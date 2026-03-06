import * as SecureStore from "expo-secure-store";
import { NativeModules, Platform } from "react-native";
import { BASE_URL } from "../api/client";

const API_KEY_STORAGE_KEY = "device_api_key";

export async function saveApiKey(apiKey: string): Promise<void> {
  await SecureStore.setItemAsync(API_KEY_STORAGE_KEY, apiKey);
  if (Platform.OS === "android") {
    NativeModules.ApiKeyModule?.save(apiKey, BASE_URL);
  }
}

export async function getApiKey(): Promise<string | null> {
  return SecureStore.getItemAsync(API_KEY_STORAGE_KEY);
}

export async function deleteApiKey(): Promise<void> {
  await SecureStore.deleteItemAsync(API_KEY_STORAGE_KEY);
}
