import { Job as IJob } from "../types/index.js";

export class Job implements IJob {
  title: string;
  company: string;
  location: string;
  postedDate: string;
  salary: string;
  url: string;
  companyLogoUrl: string;
  postedTimeAgo: string;

  constructor({
    title,
    company,
    location,
    postedDate,
    salary,
    url,
    companyLogoUrl,
    postedTimeAgo,
  }: Partial<IJob> & { title: string; company: string }) {
    if (!title || !company) {
      throw new Error("Job validation failed: 'title' and 'company' are required fields.");
    }

    this.title = title;
    this.company = company;
    this.location = location || "";
    this.postedDate = postedDate || new Date().toISOString();
    this.salary = salary || "Not specified";
    this.url = url || "";
    this.companyLogoUrl = companyLogoUrl || "";
    this.postedTimeAgo = postedTimeAgo || "";
  }
}
