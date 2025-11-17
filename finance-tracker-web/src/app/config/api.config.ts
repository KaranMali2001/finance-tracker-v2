import { OpenAPI } from '../../api';
import { environment } from '../../environments/environment';

/**
 * Configure the OpenAPI client with base URL and authentication settings.
 * Call this function during app initialization (e.g., in main.ts or app.config.ts).
 */
export function configureApi() {
  // Set your backend API base URL from environment configuration
  // This will automatically use the correct URL for dev/prod based on the build
  OpenAPI.BASE = environment.apiUrl;

  // Include credentials (cookies) in requests if needed
  OpenAPI.WITH_CREDENTIALS = true;
  OpenAPI.CREDENTIALS = 'include';

  // Optional: Set default headers
  OpenAPI.HEADERS = {
    'Content-Type': 'application/json',
  };

  // Optional: Configure token-based authentication
  // This will be called for each request that requires authentication
  // OpenAPI.TOKEN = async () => {
  //   // Get token from your auth service (e.g., Clerk)
  //   // const token = await getAuthToken();
  //   // return token || '';
  // };
}

/**
 * Configure API with Clerk authentication token.
 * Use this if you're using Clerk for authentication.
 */
export function configureApiWithClerk(getToken: () => Promise<string | null>) {
  configureApi();

  OpenAPI.TOKEN = async () => {
    const token = await getToken();
    return token || '';
  };
}
