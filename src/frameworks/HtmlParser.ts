import * as cheerio from 'cheerio';
import { Job } from '../entities/Job.js';
import { IHtmlParser } from '../interfaces/IHtmlParser.js';
import { Job as IJob } from '../types/index.js';

export class HtmlParser implements IHtmlParser {
  parseJobs(htmlContent: string): IJob[] {
    try {
      const $ = cheerio.load(htmlContent);
      const jobs = $('li');

      return jobs
        .map((_, element) => {
          try {
            const jobElement = $(element);
            const title = jobElement.find('.base-search-card__title').text().trim();
            const company = jobElement.find('.base-search-card__subtitle').text().trim();
            const location = jobElement.find('.job-search-card__location').text().trim();
            const dateElement = jobElement.find('time');
            const postedDate = dateElement.attr('datetime');
            const salary = jobElement
              .find('.job-search-card__salary-info')
              .text()
              .trim()
              .replace(/\s+/g, ' ');
            const jobUrl = jobElement.find('.base-card__full-link').attr('href');
            const companyLogo = jobElement.find('.artdeco-entity-image').attr('data-delayed-url');
            const agoTime = jobElement.find('.job-search-card__listdate').text().trim();

            if (!title || !company) {
              return null;
            }

            return new Job({
              title,
              company,
              location,
              postedDate: postedDate || undefined,
              salary,
              url: jobUrl || undefined,
              companyLogoUrl: companyLogo || undefined,
              postedTimeAgo: agoTime,
            });
          } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown parsing error';
            console.warn(
              `[HtmlParser] Warning: Failed to parse individual job element. Reason: ${errorMessage}`,
            );
            return null;
          }
        })
        .get()
        .filter(Boolean) as IJob[];
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown critical error';
      console.error(
        `[HtmlParser] Critical: Failed to parse job list HTML. Reason: ${errorMessage}`,
      );
      return [];
    }
  }
}
