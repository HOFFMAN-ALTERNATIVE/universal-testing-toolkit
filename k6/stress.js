// Stress: push well beyond normal load in steps to find the breaking point.
import { d } from "./lib/config.js";
import { userJourney } from "./lib/scenario.js";
import { summary } from "./lib/summary.js";

const MAX = Number(__ENV.VUS || 100);
export const options = {
  stages: [
    { duration: d(60), target: Math.round(MAX * 0.25) },
    { duration: d(120), target: Math.round(MAX * 0.5) },
    { duration: d(120), target: Math.round(MAX * 0.75) },
    { duration: d(120), target: MAX },
    { duration: d(60), target: 0 },
  ],
  // Under stress we tolerate slower responses but still fail on errors.
  thresholds: { http_req_failed: ["rate<0.05"], http_req_duration: ["p(95)<2000"] },
};
export default userJourney;
export const handleSummary = summary("stress");
