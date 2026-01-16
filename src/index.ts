import { HttpClient } from "./frameworks/HttpClient.js";
import { HtmlParser } from "./frameworks/HtmlParser.js";
import { InMemoryCache } from "./frameworks/InMemoryCache.js";
import { LinkedInClient } from "./interface-adapters/LinkedInClient.js";
import { QueryOptions, Job } from "./types/index.js";

// Initialize Dependencies (Dependency Injection)
const httpClient = new HttpClient();
const htmlParser = new HtmlParser();
const cache = new InMemoryCache<Job[]>();

// Initialize Client
const client = new LinkedInClient(httpClient, htmlParser, cache);

/**
 * Main query function to fetch LinkedIn jobs.
 * @param {QueryOptions} queryObject - The query configuration.
 * @returns {Promise<Job[]>} - List of jobs.
 */
export const linkedInJobSearch = (queryObject: QueryOptions): Promise<Job[]> => {
  return client.search(queryObject);
};

// Backward compatibility alias (deprecated)
export const query = linkedInJobSearch;

// Export classes and types for advanced usage or testing
export { HttpClient, HtmlParser, InMemoryCache, LinkedInClient };
export * from "./types/index.js";
