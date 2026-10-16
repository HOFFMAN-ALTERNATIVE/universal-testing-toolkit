// Load: expected production traffic. Ramp up, hold, ramp down.
import { d, thresholds } from "./lib/config.js";
import { userJourney } from "./lib/scenario.js";
import { summary } from "./lib/summary.js";

const VUS = Number(__ENV.VUS || 20);
export const options = {
  stages: [
    { duration: d(60), target: VUS },
    { duration: d(300), target: VUS },
    { duration: d(30), target: 0 },
  ],
  thresholds,
};
export default userJourney;
export const handleSummary = summary("load");
