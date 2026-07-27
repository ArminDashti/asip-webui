# Features

- **Caller IP summary (`/`)** — On load, fetch the visitor’s IP, ASN, AS, and country from as-ip; show country flag when mappable.
- **IP lookup (`/ip`)** — Form to enter an IP; lookup returns ASN, AS, country, and flag via `GET /ip/info/{ip}`.
- **Country flags** — Map country display names from as-ip to ISO codes and render via the local `flag-icons` CSS package (no external flag CDN).
- **Docker deploy** — Local and server scripts under `.armin/docker-scripts/` with nginx SPA hosting.
