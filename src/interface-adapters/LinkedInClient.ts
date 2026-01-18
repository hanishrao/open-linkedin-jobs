import { SearchJobs } from '../use-cases/SearchJobs.js';
import { IHttpClient } from '../interfaces/IHttpClient.js';
import { IHtmlParser } from '../interfaces/IHtmlParser.js';
import { ICache } from '../interfaces/ICache.js';
import { Job, QueryOptions, QueryConfig } from '../types/index.js';

export class LinkedInClient {
  private searchJobsUseCase: SearchJobs;

  constructor(httpClient: IHttpClient, htmlParser: IHtmlParser, cache: ICache<Job[]>) {
    this.searchJobsUseCase = new SearchJobs(httpClient, htmlParser, cache);
  }

  async search(queryObject: QueryOptions): Promise<Job[]> {
    // Input Sanitization & Validation
    const sanitizedQuery = this._sanitize(queryObject);

    // Prepare configuration for Use Case
    const queryConfig: QueryConfig = {
      urlBuilder: (start: number) => this._buildUrl(sanitizedQuery, start),
      limit: sanitizedQuery.limit,
      cacheKey: this._generateCacheKey(sanitizedQuery),
      startPage: (sanitizedQuery.page || 0) * 25,
      proxyUrl: sanitizedQuery.proxyUrl,
    };

    return this.searchJobsUseCase.execute(queryConfig);
  }

  private _sanitize(queryObj: QueryOptions): QueryOptions {
    return {
      host: queryObj.host || 'www.linkedin.com',
      keyword: queryObj.keyword?.trim().replace(/\s+/g, '+') || '',
      location: queryObj.location?.trim().replace(/\s+/g, '+') || '',
      dateSincePosted: queryObj.dateSincePosted || '',
      jobType: queryObj.jobType || '',
      remoteFilter: queryObj.remoteFilter || '',
      salary: queryObj.salary || '',
      experienceLevel: queryObj.experienceLevel || '',
      sortBy: queryObj.sortBy || '',
      limit: Number(queryObj.limit) || 0,
      page: Number(queryObj.page) || 0,
      has_verification: Boolean(queryObj.has_verification),
      under_10_applicants: Boolean(queryObj.under_10_applicants),
      proxyUrl: queryObj.proxyUrl || undefined,
    };
  }

  private _generateCacheKey(query: QueryOptions): string {
    return `${this._buildUrl(query, 0)}_limit:${query.limit}`;
  }

  private _buildUrl(query: QueryOptions, start: number): string {
    const baseUrl = `https://${query.host}/jobs-guest/jobs/api/seeMoreJobPostings/search?`;
    const params = new URLSearchParams();

    if (query.keyword) params.append('keywords', query.keyword!);
    if (query.location) params.append('location', query.location!);
    if (query.dateSincePosted)
      params.append('f_TPR', this._getDateSincePosted(query.dateSincePosted));
    if (query.salary) params.append('f_SB2', this._getSalary(query.salary));
    if (query.experienceLevel)
      params.append('f_E', this._getExperienceLevel(query.experienceLevel));
    if (query.remoteFilter) params.append('f_WT', this._getRemoteFilter(query.remoteFilter));
    if (query.jobType) params.append('f_JT', this._getJobType(query.jobType));
    if (query.has_verification) params.append('f_VJ', 'true');
    if (query.under_10_applicants) params.append('f_EA', 'true');

    params.append('start', start.toString());

    if (query.sortBy === 'recent') params.append('sortBy', 'DD');
    else if (query.sortBy === 'relevant') params.append('sortBy', 'R');

    return baseUrl + params.toString();
  }

  // Helper mappings
  private _getDateSincePosted(value: string): string {
    const map: Record<string, string> = {
      'past month': 'r2592000',
      'past week': 'r604800',
      '24hr': 'r86400',
    };
    return map[value.toLowerCase()] || '';
  }

  private _getExperienceLevel(value: string): string {
    const map: Record<string, string> = {
      internship: '1',
      'entry level': '2',
      associate: '3',
      senior: '4',
      director: '5',
      executive: '6',
    };
    return map[value.toLowerCase()] || '';
  }

  private _getJobType(value: string): string {
    const map: Record<string, string> = {
      'full time': 'F',
      'full-time': 'F',
      'part time': 'P',
      'part-time': 'P',
      contract: 'C',
      temporary: 'T',
      volunteer: 'V',
      internship: 'I',
    };
    return map[value.toLowerCase()] || '';
  }

  private _getRemoteFilter(value: string): string {
    const map: Record<string, string> = {
      'on-site': '1',
      'on site': '1',
      remote: '2',
      hybrid: '3',
    };
    return map[value.toLowerCase()] || '';
  }

  private _getSalary(value: string): string {
    const map: Record<string, string> = {
      '40000': '1',
      '60000': '2',
      '80000': '3',
      '100000': '4',
      '120000': '5',
    };
    return map[value] || '';
  }
}
