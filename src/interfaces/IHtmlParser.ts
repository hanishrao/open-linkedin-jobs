import { Job } from "../types/index.js";

export interface IHtmlParser {
  parseJobs(htmlContent: string): Job[];
}
