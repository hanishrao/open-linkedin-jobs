#!/usr/bin/env node
import { Command } from 'commander';
import { linkedInJobSearch } from './index.js';
import { QueryOptions } from './types/index.js';

const program = new Command();

program
  .name('open-linkedin-jobs')
  .description('Fetch job listings from LinkedIn via CLI')
  .version('1.1.0')
  .option('-k, --keyword <string>', 'Job title or keyword')
  .option('-l, --location <string>', 'Location to search')
  .option('--limit <number>', 'Number of jobs to fetch', '10')
  .option('--json', 'Output results as JSON')
  .option('--proxy <string>', 'Proxy URL (e.g., http://user:pass@host:port)')
  .action(async (options) => {
    try {
      if (!options.keyword && !options.location) {
        console.error('Error: You must provide at least a --keyword or --location.');
        process.exit(1);
      }

      const queryOptions: QueryOptions = {
        keyword: options.keyword,
        location: options.location,
        limit: parseInt(options.limit, 10),
        proxyUrl: options.proxy,
      };

      if (!options.json) {
        console.log(
          `Searching for jobs matching "${options.keyword || '*'}" in "${options.location || '*'}"...`,
        );
      }

      const jobs = await linkedInJobSearch(queryOptions);

      if (options.json) {
        console.log(JSON.stringify(jobs, null, 2));
      } else {
        console.log(`\nFound ${jobs.length} jobs:\n`);
        jobs.forEach((job) => {
          console.log(`Title: ${job.title}`);
          console.log(`Company: ${job.company}`);
          console.log(`Location: ${job.location}`);
          console.log(`Posted: ${job.postedTimeAgo}`);
          console.log(`URL: ${job.url}`);
          console.log('---');
        });
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error fetching jobs:', errorMessage);
      process.exit(1);
    }
  });

program.parse(process.argv);
