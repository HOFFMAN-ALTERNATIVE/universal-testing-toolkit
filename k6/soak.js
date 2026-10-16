// Soak: moderate load for a long time — finds memory leaks, connection exhaustion, log growth.
import { d, thresholds } from "./lib/config.js";
import { userJourney } from "./lib/scenario.js";
import { summary } from "./lib/summary.js";

const VUS = Number(__ENV.VUS || 15);
export const options = {
  stages: [
    { duration: d(120), target: VUS },
    { duration: d(Number(__ENV.SOAK_SECONDS || 3 * 3600)), target: VUS },
    { duration: d(120), target: 0 },
  ],
  thresholds,
};
export default userJourney;
export const handleSummary = summary("soak");
