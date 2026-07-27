export type IpInfo = {
  ip: string
  asn: number
  as: string
  country: string
}

type ApiErrorBody = {
  error?: string
  message?: string
}

function resolveApiBaseUrl(): string {
  const configured = import.meta.env.VITE_AS_IP_BASE_URL?.trim()
  if (!configured) {
    throw new Error('VITE_AS_IP_BASE_URL is not configured')
  }
  return configured.replace(/\/$/, '')
}

async function readIpInfoResponse(response: Response): Promise<IpInfo> {
  if (!response.ok) {
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

  return (await response.json()) as IpInfo
}

export async function fetchIpInfo(): Promise<IpInfo> {
  const response = await fetch(`${resolveApiBaseUrl()}/ip/info`)
  return readIpInfoResponse(response)
}

export async function fetchIpInfoByAddress(ipAddress: string): Promise<IpInfo> {
  const trimmed = ipAddress.trim()
  const response = await fetch(
    `${resolveApiBaseUrl()}/ip/info/${encodeURIComponent(trimmed)}`,
  )
  return readIpInfoResponse(response)
}
