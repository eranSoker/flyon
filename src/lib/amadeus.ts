// FlyOn — Amadeus API Client v1.1.0 | 2026-02-06

const AMADEUS_BASE_URL = process.env.AMADEUS_BASE_URL || 'https://test.api.amadeus.com';
const AMADEUS_API_KEY = process.env.AMADEUS_API_KEY;
const AMADEUS_API_SECRET = process.env.AMADEUS_API_SECRET;

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000;

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

class AmadeusClient {
  private token: string | null = null;
  private tokenExpiry: number = 0;

  private async getToken(): Promise<string> {
    if (this.token && Date.now() < this.tokenExpiry) {
      return this.token;
    }

    if (!AMADEUS_API_KEY || !AMADEUS_API_SECRET) {
      throw new Error(
        'Missing Amadeus API credentials. Set AMADEUS_API_KEY and AMADEUS_API_SECRET in .env.local'
      );
    }

    const response = await fetch(`${AMADEUS_BASE_URL}/v1/security/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: AMADEUS_API_KEY,
        client_secret: AMADEUS_API_SECRET,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Amadeus auth failed (${response.status}): ${errorText}`);
    }

    const data: TokenResponse = await response.json();
    this.token = data.access_token;
    // Expire 60 seconds early to avoid edge cases
    this.tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;

    return this.token;
  }

  async get(endpoint: string, params: Record<string, string> = {}): Promise<unknown> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const token = await this.getToken();
        const url = new URL(`${AMADEUS_BASE_URL}${endpoint}`);
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            url.searchParams.set(key, value);
          }
        });

        const response = await fetch(url.toString(), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          // Token expired, clear and retry
          this.token = null;
          this.tokenExpiry = 0;
          continue;
        }

        if (response.status === 429) {
          // Rate limited — wait with exponential backoff
          const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Amadeus API error (${response.status}): ${errorText}`);
        }

        return await response.json();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt < MAX_RETRIES - 1) {
          const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error('Amadeus API request failed after retries');
  }
}

// Singleton instance for server-side use
export const amadeus = new AmadeusClient();
