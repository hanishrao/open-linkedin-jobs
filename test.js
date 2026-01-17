import { linkedInJobSearch } from "./dist/index.js";

async function runTest() {
  console.log("Starting integration test...");

  // Example Query
  const queryOptions = {
    keyword: "software engineer",
    location: "United States",
    dateSincePosted: "past week",
    limit: 5,
  };

  try {
    console.log(`Querying jobs with options:`, queryOptions);
    const jobs = await linkedInJobSearch(queryOptions);

    console.log(`Successfully fetched ${jobs.length} jobs.`);
    
    // Result Validation
    if (jobs.length > 0) {
      console.log("Sample job:", jobs[0]);
      
      // Property Check
      if (!jobs[0].url || !jobs[0].title) {
        console.error("FAIL: Job properties mismatch/missing.");
        process.exit(1);
      }
    } else {
      console.warn("No jobs found. This might be due to LinkedIn blocking or no results.");
    }

    if (jobs.length > 5) {
        console.error(`FAIL: Expected at most 5 jobs, got ${jobs.length}`);
        process.exit(1);
    }

    console.log("Test Passed!");

  } catch (error) {
    console.error("Test Failed:", error);
    process.exit(1);
  }
}

runTest();
