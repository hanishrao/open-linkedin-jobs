export interface IHttpClient {
  get(url: string, options?: { proxyUrl?: string }): Promise<string>;
}
