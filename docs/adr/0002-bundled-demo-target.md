# 0002. Ship a demo target app and test against it in CI

Status: accepted
Date: 2026-10-17

## Context
A test suite that is only ever run against other people's sites cannot tell its own
bugs apart from theirs. Users need to see a green run before they trust a red one.

## Options
1. Test against a public site (e.g. a sandbox shop): no code to maintain, but flaky and
   outside our control.
2. A zero-dependency Node app in `demo-app/` with pages, a form, a JSON API and strict
   security headers, started automatically when `BASE_URL` is unset.

## Decision
Option 2. Every layer gets a deterministic target, and CI is green only if the toolkit
works.

## Consequences
- CI exercises every layer on every push, including Docker.
- The demo app is code we maintain; it now has its own regression tests
  (`node --test demo-app/`) and is hardened like a real service.
- The demo's perfect Lighthouse scores do not predict scores on real sites.
