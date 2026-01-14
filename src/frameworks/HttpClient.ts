import axios, { AxiosInstance, AxiosResponse } from "axios";
import UserAgent from "user-agents";
import { IHttpClient } from "../interfaces/IHttpClient.js";

export class HttpClient implements IHttpClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      timeout: 10000,
      headers: {
        Accept: "application/json, text/javascript, */*; q=0.01",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        Referer: "https://www.linkedin.com/jobs",
        "X-Requested-With": "XMLHttpRequest",
        Connection: "keep-alive",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
      transformResponse: [(data: any) => data], // prevent auto-parsing JSON if the response is HTML
    });
  }

  async get(url: string): Promise<string> {
    // Generate a modern, desktop User-Agent
    const userAgent = new UserAgent({ deviceCategory: "desktop" });
    const headers = {
      "User-Agent": userAgent.toString(),
    };

    try {
      const response: AxiosResponse = await this.client.get(url, {
        headers,
        validateStatus: (status: number) => status === 200,
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error("Rate limit reached");
      }
      throw error;
    }
  }
}
