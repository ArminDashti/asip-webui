# NSLookup page design

Date: 2026-07-28  
Status: approved (revised 2026-07-28 — grid-only UI; API in as-ip)

## Goal

Ship a working `/nslookup` experience:

1. **as-ip** implements `GET /api/v1/dns/lookup/*domain` (DNS resolve + ASN/country enrichment).
2. **asip-webui** shows a domain form and a **results grid only** with columns **IP | ASN (name) | AS (number) | Country+Flag**.

## Approach

- Implement the as-ip endpoint per `as-ip/docs/superpowers/specs/2026-07-28-dns-lookup-endpoint-design.md` (Go `net` resolver + existing IP→ASN/geo repository path). Rejected: shelling out to `nslookup`; browser-only resolve + N× `/ip/info` (CORS / fragile).
- Slim the existing `NslookupPage`: remove the summary `<dl>` (domain/A/NS/CNAME/top-level ASN/AS/country). Keep form + addresses table only.
- Column mapping (UI label ← API field):

| UI column | API field | Display |
|-----------|-----------|---------|
| IP | `ip` | literal address |
| ASN | `as` | name only (e.g. `EDGECAST`) |
| AS | `asn` | number only (e.g. `15133`) |
| Country | `country` | flag (`flag-icons` via existing helper) + country name |

Empty name / zero ASN / empty country → show `—`. Unknown country name → text without flag.

## Architecture

```
Browser (/nslookup)
  → App (pathname switch)
      → NslookupPage
          → asIpClient.fetchDnsLookup(domain)
               GET {VITE_AS_IP_BASE_URL}/dns/lookup/{encodedDomain}
          → render addresses[] table only
               → countryFlag helper per row

as-ip
  GET /api/v1/dns/lookup/*domain
    → LookupHandler.LookupDns
    → LookupService.LookupDns (normalize → DNS → enrich addresses)
```

## API contract (consumed by UI)

Full response shape is defined in the as-ip DNS lookup design (includes `a`/`aaaa`/`ns`/`mx`/`txt`/`cname` and top-level `asn`/`as`/`country`). The UI **only uses** `addresses[]`:

```json
{
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

Client keeps typing the full response for forward compatibility; display ignores non-address fields.

## Components

| Unit | Responsibility |
|------|----------------|
| as-ip `LookupDns` (dto/service/handler/router/docs) | New endpoint + enrichment |
| `asIpClient.fetchDnsLookup` | Already present — verify path matches catch-all URL encoding |
| `NslookupPage` | Domain form; loading/error/ready; **table only** |
| `buildCountryFlagClassName` | Country name → `fi fi-xx` |
| `App` | `/nslookup` route (already present) |

## Data flow

1. User submits non-empty trimmed domain (else inline validation, no request).
2. `GET …/dns/lookup/{encodedDomain}` (support bare host and URL-like inputs via API normalize).
3. Success → one row per `addresses[]` entry.
4. Empty `addresses` → short empty message (API may still 200 with other DNS types; UI still only cares about addresses).
5. Failure → show API `message` when present.

## Error handling

| Case | Behavior |
|------|----------|
| Empty submit | Inline error, no API call |
| `400` invalid domain | Show API message |
| `404` no DNS records | Show API message |
| Network / other | Generic or API message |
| Missing enrichment | `—` in ASN/AS/Country cells |

## Out of scope

- React Router / nav chrome
- Showing A/NS/MX/TXT/CNAME or top-level summary on the page
- Custom DNS server parameter
- Lookup history / batch domains
- Changing `/` or `/ip` behavior

## Success criteria

1. as-ip serves `GET /api/v1/dns/lookup/example.com` with enriched `addresses`.
2. `/nslookup` shows only **IP | ASN | AS | Country+Flag** after lookup.
3. `/` and `/ip` unchanged; empty submit and API errors handled cleanly.
4. Endpoint documented in as-ip `/api/v1/docs` and endpoint docs.

## Manual test

1. Deploy/run as-ip with DB sync; curl DNS lookup for `example.com` → `addresses` with ASN/country when known.
2. Open asip-webui `/nslookup`, look up same domain → four-column grid with flag.
3. Empty submit → validation; nonsense domain → error; `/` and `/ip` still work.
