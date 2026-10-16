// Smoke: 1 VU for a few iterations — does the system work at all under scripted traffic?
import { thresholds } from "./lib/config.js";
import { userJourney } from "./lib/scenario.js";
import { summary } from "./lib/summary.js";

export const options = { vus: 1, iterations: 5, thresholds };
export default userJourney;
export const handleSummary = summary("smoke");
