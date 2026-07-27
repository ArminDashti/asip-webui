# Modules

| Module | Role |
|--------|------|
| `App` | Pathname routing (`/` home, `/ip` lookup) |
| `HomePage` | Auto-load caller IP info |
| `IpPage` | Manual IP lookup form + results |
| `asIpClient` | HTTP client for as-ip `/ip/info` endpoints |
| `countryFlag` | Country name → `flag-icons` CSS class |
| Styles | Global layout, fields, lookup form |
| Deploy | Docker + nginx SPA |
