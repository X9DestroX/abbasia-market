import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

/**
 * Cross-platform key/value storage.
 * Native Android/iOS: Expo SecureStore.
 * Web: browser localStorage (only accessed when called in the browser).
 */
export async function getAppStorageItem(key: string): Promise<string | null> {
  if (Platform.OS === "web") {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(key);
  }
  return SecureStore.getItemAsync(key);
}

export async function setAppStorageItem(key: string, value: string): Promise<void> {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined") window.localStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

export async function removeAppStorageItem(key: string): Promise<void> {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined") window.localStorage.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}
