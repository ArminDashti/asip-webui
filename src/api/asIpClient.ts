export type IpInfo = {
  ip: string
  asn: number
  as: string
  country: string
}

export type DnsAddress = {
  ip: string
  asn: number
  as: string
  country: string
}

export type DnsLookupResult = {
  domain: string
  a: string[]
  aaaa: string[]
  ns: string[]
  mx: unknown[]
  txt: string[]
  cname: string
  asn: number
  as: string
  country: string
  addresses: DnsAddress[]
}

type ApiErrorBody = {
  error?: string
  message?: string
}

const FETCH_RETRY_ATTEMPTS = 3
const FETCH_RETRY_BASE_DELAY_MS = 400
const API_UNREACHABLE_MESSAGE =
  'API unreachable — service may still be starting after a server restart.'

function resolveApiBaseUrl(): string {
  const configured = import.meta.env.VITE_AS_IP_BASE_URL?.trim()
  if (!configured) {
    throw new Error('VITE_AS_IP_BASE_URL is not configured')
  }
  return configured.replace(/\/$/, '')
}

function isTransientNetworkError(error: unknown): boolean {
  return error instanceof TypeError
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

async function fetchWithRetry(url: string): Promise<Response> {
  let lastError: unknown

  for (let attempt = 0; attempt < FETCH_RETRY_ATTEMPTS; attempt += 1) {
    try {
      return await fetch(url)
    } catch (error) {
      lastError = error
      if (!isTransientNetworkError(error) || attempt === FETCH_RETRY_ATTEMPTS - 1) {
        break
      }
      await sleep(FETCH_RETRY_BASE_DELAY_MS * (attempt + 1))
    }
  }

  if (isTransientNetworkError(lastError)) {
    throw new Error(API_UNREACHABLE_MESSAGE)
  }
  throw lastError instanceof Error
    ? lastError
    : new Error(API_UNREACHABLE_MESSAGE)
}

async function throwIfNotOk(response: Response): Promise<void> {
  if (response.ok) {
    return
  }

  let detail = `HTTP ${response.status}`
  try {
    const body = (await response.json()) as ApiErrorBody
    if (body.message) {
      detail = body.message
    }
  } catch {
    // keep status-based detail
  }
  throw new Error(detail)
}

async function readIpInfoResponse(response: Response): Promise<IpInfo> {
  await throwIfNotOk(response)
  return (await response.json()) as IpInfo
}

async function readDnsLookupResponse(response: Response): Promise<DnsLookupResult> {
  await throwIfNotOk(response)
  return (await response.json()) as DnsLookupResult
}

export async function fetchIpInfo(): Promise<IpInfo> {
  const response = await fetchWithRetry(`${resolveApiBaseUrl()}/ip/info`)
  return readIpInfoResponse(response)
}

export async function fetchIpInfoByAddress(ipAddress: string): Promise<IpInfo> {
  const trimmed = ipAddress.trim()
  const response = await fetchWithRetry(
    `${resolveApiBaseUrl()}/ip/info/${encodeURIComponent(trimmed)}`,
  )
  return readIpInfoResponse(response)
}

export async function fetchDnsLookup(domain: string): Promise<DnsLookupResult> {
  const trimmed = domain.trim()
  const response = await fetchWithRetry(
    `${resolveApiBaseUrl()}/dns/lookup/${encodeURIComponent(trimmed)}`,
  )
  return readDnsLookupResponse(response)
}
