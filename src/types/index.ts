export interface Job {
  title: string;
  company: string;
  location: string;
  postedDate: string;
  salary: string;
  url: string;
  companyLogoUrl: string;
  postedTimeAgo: string;
}

export interface QueryOptions {
  host?: string;
  keyword?: string;
  location?: string;
  dateSincePosted?: string;
  jobType?: string;
  remoteFilter?: string;
  salary?: string;
  experienceLevel?: string;
  sortBy?: string;
  limit?: number;
  page?: number;
  has_verification?: boolean;
  under_10_applicants?: boolean;
}

export interface QueryConfig {
  urlBuilder: (start: number) => string;
  limit?: number;
  cacheKey: string;
  startPage?: number;
  batchSize?: number;
}
