# 09 — Security baseline

> These checks catch **misconfiguration**, not application logic bugs. They are a floor, not a penetration test.
> Scan only systems you own or are authorised to test.

## Deterministic checks (`tests/security/headers.spec.ts`)

| Check | Pass condition |
|---|---|
| Content-Security-Policy | present, has `default-src`, no `'unsafe-eval'` |
| Clickjacking | `X-Frame-Options: DENY/SAMEORIGIN` or CSP `frame-ancestors` |
| MIME sniffing | `X-Content-Type-Options: nosniff` |
| Referrer-Policy | strict variant |
| Permissions-Policy | present |
| HSTS | `max-age` ≥ 180 days |
| Tech disclosure | no `X-Powered-By`, no version in `Server` |
| TLS (https targets) | certificate valid, HTTP → HTTPS redirect |
| Exposure | `/.env`, `/.git/config`, `/server-status`, `/phpinfo.php`, `/backup.zip` not served |
| Path traversal | encoded `../` cannot read `/etc/passwd` |

## OWASP ZAP baseline (`scripts/zap-baseline.sh`)

Runs the official `zap-baseline.py` in Docker: spiders the target and performs **passive** checks (no attacks).

```bash
BASE_URL=https://staging.example.com make zap
```

Reports: `reports/zap/zap-report.{html,json,md}`. Alerts are graded **FAIL / WARN / INFO**; by default only FAIL breaks the build (`-I`).
Tune rule levels in `security/zap-rules.tsv` (`<rule id>\t<IGNORE|INFO|WARN|FAIL>`), and document *why* every override exists.
