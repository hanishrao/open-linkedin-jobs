import { describe, it, expect } from 'vitest';
import { HtmlParser } from '../frameworks/HtmlParser';

describe('HtmlParser', () => {
  const parser = new HtmlParser();

  it('should parse a valid job list correctly', () => {
    const html = `
      <ul>
        <li>
          <div class="base-search-card__title">Software Engineer</div>
          <div class="base-search-card__subtitle">Tech Corp</div>
          <div class="job-search-card__location">San Francisco, CA</div>
          <time datetime="2023-10-27">1 day ago</time>
          <a class="base-card__full-link" href="https://linkedin.com/job/123"></a>
        </li>
      </ul>
    `;

    const jobs = parser.parseJobs(html);

    expect(jobs).toHaveLength(1);
    expect(jobs[0]).toMatchObject({
      title: 'Software Engineer',
      company: 'Tech Corp',
      location: 'San Francisco, CA',
      postedDate: '2023-10-27',
      url: 'https://linkedin.com/job/123',
    });
  });

  it('should ignore jobs without title or company', () => {
    const html = `
      <ul>
        <li>
          <div class="base-search-card__subtitle">Tech Corp</div>
        </li>
        <li>
           <div class="base-search-card__title">Software Engineer</div>
        </li>
      </ul>
    `;

    const jobs = parser.parseJobs(html);
    expect(jobs).toHaveLength(0);
  });

  it('should handle empty HTML gracefully', () => {
    const jobs = parser.parseJobs('');
    expect(jobs).toEqual([]);
  });
});
