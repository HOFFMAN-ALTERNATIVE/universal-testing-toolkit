import { textSummary } from "https://jslib.k6.io/k6-summary/0.1.0/index.js";

/** Write console + JSON summary into reports/k6/<name>.json */
export function summary(name) {
  return (data) => ({
    stdout: textSummary(data, { indent: " ", enableColors: true }),
    [`reports/k6/${name}.json`]: JSON.stringify(data, null, 2),
  });
}
