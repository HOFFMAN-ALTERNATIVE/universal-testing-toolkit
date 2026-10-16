// Spike: sudden burst of traffic (e.g. a marketing push) and recovery.
import { d } from "./lib/config.js";
import { userJourney } from "./lib/scenario.js";
import { summary } from "./lib/summary.js";

const PEAK = Number(__ENV.VUS || 200);
export const options = {
  stages: [
    { duration: d(10), target: 5 },
    { duration: d(10), target: PEAK },
    { duration: d(60), target: PEAK },
    { duration: d(10), target: 5 },
    { duration: d(30), target: 5 },
    { duration: d(5), target: 0 },
  ],
  thresholds: { http_req_failed: ["rate<0.05"], http_req_duration: ["p(95)<3000"] },
};
export default userJourney;
export const handleSummary = summary("spike");
