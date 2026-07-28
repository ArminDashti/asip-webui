import { useState, type FormEvent } from 'react'
import {
  fetchDnsLookup,
  type DnsAddress,
  type DnsLookupResult,
} from '../api/asIpClient'
import { buildCountryFlagClassName } from '../lib/countryFlag'

type LookupState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; result: DnsLookupResult }
  | { status: 'error'; message: string }

function joinRecordList(values: string[]): string {
  return values.length > 0 ? values.join(', ') : '—'
}

function displayCname(cname: string): string {
  const trimmed = cname.trim()
  return trimmed.length > 0 ? trimmed : '—'
}

export function NslookupPage() {
  const [domainName, setDomainName] = useState('')
  const [lookupState, setLookupState] = useState<LookupState>({ status: 'idle' })

  async function handleLookup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = domainName.trim()
    if (!trimmed) {
      setLookupState({ status: 'error', message: 'Enter a domain name' })
      return
    }

    setLookupState({ status: 'loading' })
    try {
      const result = await fetchDnsLookup(trimmed)
      setLookupState({ status: 'ready', result })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to look up that domain'
      setLookupState({ status: 'error', message })
    }
  }

  return (
    <div className="home">
      <form className="ip-lookup-form" onSubmit={handleLookup}>
        <label className="ip-lookup-label" htmlFor="domain-name">
          Domain
        </label>
        <div className="ip-lookup-row">
          <input
            id="domain-name"
            className="ip-lookup-input"
            type="text"
            name="domain"
            value={domainName}
            onChange={(event) => setDomainName(event.target.value)}
            placeholder="example.com"
            autoComplete="off"
            spellCheck={false}
            disabled={lookupState.status === 'loading'}
          />
          <button
            className="ip-lookup-submit"
            type="submit"
            disabled={lookupState.status === 'loading'}
          >
            Lookup
          </button>
        </div>
      </form>

      {lookupState.status === 'loading' && (
        <p className="status" role="status">
          Looking up domain…
        </p>
      )}

      {lookupState.status === 'error' && (
        <p className="status status-error" role="alert">
          {lookupState.message}
        </p>
      )}

      {lookupState.status === 'ready' && (
        <DnsLookupSummary result={lookupState.result} />
      )}
    </div>
  )
}

function DnsLookupSummary({ result }: { result: DnsLookupResult }) {
  const flagClassName = buildCountryFlagClassName(result.country)

  return (
    <div className="dns-lookup-result">
      <dl className="ip-fields">
        {flagClassName && (
          <div className="flag-row">
            <span className={`country-flag ${flagClassName}`} aria-hidden="true" />
          </div>
        )}
        <div className="field">
          <dt>Domain</dt>
          <dd>{result.domain}</dd>
        </div>
        <div className="field">
          <dt>A</dt>
          <dd>{joinRecordList(result.a)}</dd>
        </div>
        <div className="field">
          <dt>CNAME</dt>
          <dd>{displayCname(result.cname)}</dd>
        </div>
        <div className="field">
          <dt>ASN</dt>
          <dd>{result.asn}</dd>
        </div>
        <div className="field">
          <dt>AS</dt>
          <dd>{result.as}</dd>
        </div>
        <div className="field">
          <dt>Country</dt>
          <dd>{result.country}</dd>
        </div>
      </dl>

      <DnsAddressesTable addresses={result.addresses} />
      <DnsNsTable nameservers={result.ns} />
    </div>
  )
}

function DnsAddressesTable({ addresses }: { addresses: DnsAddress[] }) {
  if (addresses.length === 0) {
    return (
      <p className="status dns-grid-empty" role="status">
        No addresses returned
      </p>
    )
  }

  return (
    <div className="dns-grid">
      <h2 className="dns-grid-heading">Addresses</h2>
      <table className="dns-grid-table">
        <thead>
          <tr>
            <th scope="col">IP</th>
            <th scope="col">AS</th>
            <th scope="col">ASN</th>
            <th scope="col">Country</th>
          </tr>
        </thead>
        <tbody>
          {addresses.map((address) => (
            <DnsAddressRow key={address.ip} address={address} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function DnsAddressRow({ address }: { address: DnsAddress }) {
  const flagClassName = buildCountryFlagClassName(address.country)

  return (
    <tr>
      <td>{address.ip}</td>
      <td>{address.as}</td>
      <td>{address.asn}</td>
      <td className="dns-country-cell">
        {flagClassName && (
          <span
            className={`country-flag country-flag-inline ${flagClassName}`}
            aria-hidden="true"
          />
        )}
        <span>{address.country}</span>
      </td>
    </tr>
  )
}

function DnsNsTable({ nameservers }: { nameservers: string[] }) {
  if (nameservers.length === 0) {
    return (
      <p className="status dns-grid-empty" role="status">
        No nameservers returned
      </p>
    )
  }

  return (
    <div className="dns-grid">
      <h2 className="dns-grid-heading">NS</h2>
      <table className="dns-grid-table">
        <thead>
          <tr>
            <th scope="col">NS</th>
          </tr>
        </thead>
        <tbody>
          {nameservers.map((nameserver) => (
            <tr key={nameserver}>
              <td>{nameserver}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
