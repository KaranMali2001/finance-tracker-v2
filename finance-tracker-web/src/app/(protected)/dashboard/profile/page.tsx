import { AuthService } from '@/generated/api';
import { initServerApiClient } from '@/lib/api-client-server';

export default async function ProfilePage() {
  // Initialize API client for this specific request (per-request, not singleton)
  // This ensures each request has its own isolated token provider
  await initServerApiClient();

  // Now API calls will include the token for this specific request
  const userData = await AuthService.getAuthUser();

  return <div>{userData.email}</div>;
}
