import axios from "axios";
import { getApiKey } from "../utils/secureStore";

export const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://10.0.2.2:8081/api/v1";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

apiClient.interceptors.request.use(async (config) => {
  const apiKey = await getApiKey();
  if (apiKey) {
    config.headers["X-Device-Api-Key"] = apiKey;
  }
  return config;
});
