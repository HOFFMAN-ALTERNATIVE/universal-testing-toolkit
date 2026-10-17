# Security policy

## Reporting
Use GitHub "Report a vulnerability" on this repository to open a private advisory.
Please do not open public issues for security problems. First answer within 5 working days.

## Supported versions
Only the latest release and `main` receive fixes.

## Threat model
- Assets: the machine or CI runner executing the suite, its secrets, and the target
  system being tested.
- Actors: a hostile or compromised target site; anyone who can reach the demo app.
- Entry points: pages and responses from `BASE_URL`, the demo app's HTTP interface,
  npm dependencies.
- Risks and mitigations:
  - A hostile target exploiting the browser: the runner image runs as the
    unprivileged `pwuser` (uid 1000) with `no-new-privileges`, never root.
  - Demo app crash or exhaustion: fixed URL base (a malformed `Host` header used to
    crash the process), 64 KiB body limit, 15 s request and 10 s header timeouts,
    bounded in-memory stores, generic 500 responses with details only in logs,
    graceful SIGTERM drain capped at 10 s. Regression tests in `demo-app/server.test.mjs`.
  - Demo app container: non-root `node` user, read-only root filesystem, all
    capabilities dropped, port bound to 127.0.0.1 in compose, health-checked.
  - Unintended load or scanning: k6 and ZAP only run when invoked explicitly; see
    "Responsible use" in the README.
- Secrets: none are required. If you add auth for a target, pass it through
  environment variables or CI secrets; `.env` is git-ignored.

## Dependencies
CI runs `npm audit --audit-level=critical`. Known remaining highs are transitive via
`@lhci/cli` with no upstream fix; the rationale and exposure are in
[ADR 0003](docs/adr/0003-lighthouse-ci-transitive-advisories.md).
