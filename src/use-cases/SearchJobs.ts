import { IHttpClient } from "../interfaces/IHttpClient.js";
import { IHtmlParser } from "../interfaces/IHtmlParser.js";
import { ICache } from "../interfaces/ICache.js";
import { Job } from "../types/index.js";
import { QueryConfig } from "../types/index.js";

export class SearchJobs {
  private httpClient: IHttpClient;
  private htmlParser: IHtmlParser;
  private cache: ICache<Job[]>;

  constructor(
    httpClient: IHttpClient,
    htmlParser: IHtmlParser,
    cache: ICache<Job[]>
  ) {
    this.httpClient = httpClient;
    this.htmlParser = htmlParser;
    this.cache = cache;
  }

  async execute(queryConfig: QueryConfig): Promise<Job[]> {
    const {
      urlBuilder,
      limit,
      cacheKey,
      startPage = 0,
      batchSize = 25,
    } = queryConfig;

    // 1. Check Cache
    if (this.cache) {
      const cachedJobs = this.cache.get(cacheKey);
      if (cachedJobs) {
        return cachedJobs;
      }
    }

    let allJobs: Job[] = [];
    let start = startPage;
    let hasMore = true;
    let consecutiveErrors = 0;
    const MAX_CONSECUTIVE_ERRORS = 3;

    while (hasMore) {
      try {
        const url = urlBuilder(start);
        const data = await this.httpClient.get(url);
        const jobs = this.htmlParser.parseJobs(data);

        if (!jobs || jobs.length === 0) {
          hasMore = false;
          break;
        }

        allJobs.push(...jobs);

        if (limit && allJobs.length >= limit) {
          allJobs = allJobs.slice(0, limit);
          break;
        }

        consecutiveErrors = 0;
        start += batchSize;

        // Rate limiting / Politeness delay
        const delay = 2000 + Math.random() * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      } catch (error: unknown) {
        consecutiveErrors++;
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        
        console.error(
          `Error fetching batch (attempt ${consecutiveErrors}):`,
          errorMessage
        );

        // Stop strictly on fatal logic errors or max retries
        // We assume "Rate limit reached" is the specific error message we want to backoff on
        const isRateLimit = errorMessage.includes("Rate limit reached") || errorMessage.includes("429");
        
        if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
             console.error("Max consecutive errors reached. Stopping search.");
             break;
        }

        // Only backoff significantly if it looks like a rate limit/network issue
        if (isRateLimit) {
            const backoff = Math.pow(2, consecutiveErrors) * 1000;
            console.log(`Rate limit detected. Backing off for ${backoff}ms...`);
            await new Promise((resolve) => setTimeout(resolve, backoff));
        } else {
             // For other errors, small delay or break? 
             // We'll treat them as transient for now but break if they persist
             await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
    }

    // 2. Set Cache
    if (this.cache && allJobs.length > 0) {
      this.cache.set(cacheKey, allJobs);
    }

    return allJobs;
  }
}
