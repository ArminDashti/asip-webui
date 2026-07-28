# NSLookup page design

Date: 2026-07-28  
Status: approved for planning

## Goal

Add a page at `/nslookup` where a user enters a domain and sees DNS/AS summary fields plus a per-address grid (IP, AS, ASN, Country+Flag) from `GET /api/v1/dns/lookup/{domain}`.

## Approach

Lightweight pathname routing in `App` (no `react-router`). Extend `asIpClient` with a DNS lookup call. New `NslookupPage` mirrors `IpPage` form/state patterns: summary definition list, then an HTML table for `addresses`.

## Architecture

```
Browser (/nslookup)
  → App (pathname switch)
      → NslookupPage
          → asIpClient.fetchDnsLookup(domain)
               GET {VITE_AS_IP_BASE_URL}/dns/lookup/{encodedDomain}
          → countryFlag helper (top-level country + each address row)
```

## API response (display contract)

```json
{
  "domain": "example.com",
  "a": ["93.184.216.34"],
  "aaaa": ["…"],
  "ns": ["a.iana-servers.net.", "b.iana-servers.net."],
  "mx": [],
  "txt": ["…"],
  "cname": "",
  "asn": 15133,
  "as": "EDGECAST",
  "country": "United States",
  "addresses": [
    {
      "ip": "93.184.216.34",
      "asn": 15133,
      "as": "EDGECAST",
      "country": "United States"
    }
  ]
}
```

**Show:** `domain`, `a`, `ns`, `cname`, top-level `asn` / `as` / `country`, and `addresses[]`.  
**Omit from UI:** `aaaa`, `mx`, `txt` (still allowed on the typed response).

## Components

| Unit | Responsibility |
|------|----------------|
| `App` | Pathname `/nslookup` → `NslookupPage`; keep `/` and `/ip`; other paths redirect home |
| `NslookupPage` | Domain form, load/error/ready states, summary + addresses table |
| `asIpClient.fetchDnsLookup(domain)` | `GET …/dns/lookup/{encodedDomain}` → `DnsLookupResult` |
| `buildCountryFlagClassName` | Country name → `flag-icons` class |

## Data flow

1. User types domain and submits.
2. Client validates non-empty trim; otherwise inline error, no API call.
3. Call `fetchDnsLookup(trimmedDomain)`.
4. On success: render summary fields, then table rows from `addresses`.
5. On failure: show API `message` when present, else short fallback.

## UI

- Match existing visual language: centered layout, ASIP brand, form row, mono values.
- Summary (`<dl>`): Domain, A (join with `, `), NS (join with `, `), CNAME (`—` if empty), ASN, AS, Country + flag.
- Addresses table columns: **IP | AS | ASN | Country+Flag**. Empty `addresses` → short empty message.
- No nav links in v1.

## Error handling

- Empty submit → validation message.
- Non-OK HTTP / network → API `message` or generic error.
- Unknown country → omit flag; still show country text.

## Out of scope

- React Router / nav chrome
- Displaying `aaaa`, `mx`, `txt`
- Lookup history / batch domains
- Changing home or `/ip` behavior

## Testing (manual)

1. Open `/nslookup`, look up a known domain → summary + address rows with flags.
2. Empty submit → validation, no crash.
3. `/` and `/ip` unchanged.
4. Direct load of `/nslookup` works (SPA fallback).
