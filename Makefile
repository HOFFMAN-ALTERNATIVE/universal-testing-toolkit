# Universal Testing Toolkit — every target honours BASE_URL (defaults to the bundled demo app).
SHELL := /bin/bash
BASE_URL ?=
export BASE_URL
SCALE ?= 1
export SCALE

.PHONY: help install demo all ci-fast e2e smoke api security a11y visual visual-update lighthouse load-smoke load stress spike soak zap report clean

help: ## Show targets
	@grep -E '^[a-z-]+:.*##' $(MAKEFILE_LIST) | awk -F':.*## ' '{printf "  \033[36m%-14s\033[0m %s\n", $$1, $$2}'

install: ## Install deps + browsers
	npm ci && npx playwright install --with-deps

demo: ## Run the demo target app on :3000
	node demo-app/server.mjs

all: e2e api security visual lighthouse load-smoke ## Everything except long load tests and ZAP

ci-fast: smoke api security ## Quick gate (used by docker compose)

e2e: ## E2E on desktop + mobile browsers
	npm run test:e2e
smoke: ## Smoke + link checker
	npm run test:smoke -- --project=chromium
api: ## API tests with JSON-schema validation
	npm run test:api
security: ## Security headers / exposure / TLS checks
	npm run test:security
a11y: ## axe-core accessibility scan
	npm run test:a11y -- --project=chromium
visual: ## Visual regression
	npm run test:visual
visual-update: ## Re-record visual baselines
	npm run test:visual:update
lighthouse: ## Lighthouse CI budgets
	npm run test:lighthouse

define with_target
	@if [ -z "$(BASE_URL)" ]; then node demo-app/server.mjs & echo $$! > .demo.pid; sleep 1; fi; \
	trap '[ -f .demo.pid ] && kill $$(cat .demo.pid) && rm -f .demo.pid' EXIT; mkdir -p reports/k6; $(1)
endef

load-smoke: ## k6 smoke (1 VU)
	$(call with_target,k6 run k6/smoke.js)
load: ## k6 load profile
	$(call with_target,K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=reports/k6/load.html k6 run k6/load.js)
stress: ## k6 stress profile
	$(call with_target,K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=reports/k6/stress.html k6 run k6/stress.js)
spike: ## k6 spike profile
	$(call with_target,K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=reports/k6/spike.html k6 run k6/spike.js)
soak: ## k6 soak profile (hours!)
	$(call with_target,K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=reports/k6/soak.html k6 run k6/soak.js)
zap: ## OWASP ZAP baseline scan (Docker)
	$(call with_target,bash scripts/zap-baseline.sh)

report: ## Open the Playwright HTML report
	npm run report
clean:
	rm -rf reports .lighthouseci
