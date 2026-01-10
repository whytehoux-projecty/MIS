import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// Note: localStorage is used as a fallback for web, but it is not encrypted.
// For a production PWA, consider using a more secure storage solution or encrypting values.
const isWeb = Platform.OS === "web";

export async function setSecureItem(key: string, value: string): Promise<void> {
  if (isWeb) {
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(key, value);
      }
    } catch (e) {
      console.error("Local storage is not available:", e);
    }
  } else {
    await SecureStore.setItemAsync(key, value);
  }
}

export async function getSecureItem(key: string): Promise<string | null> {
  if (isWeb) {
    try {
      if (typeof localStorage !== "undefined") {
        return localStorage.getItem(key);
      }
      return null;
    } catch (e) {
      console.error("Local storage is not available:", e);
      return null;
    }
  } else {
    return SecureStore.getItemAsync(key);
  }
}

export async function deleteSecureItem(key: string): Promise<void> {
  if (isWeb) {
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem(key);
      }
    } catch (e) {
      console.error("Local storage is not available:", e);
    }
  } else {
    await SecureStore.deleteItemAsync(key);
  }
}
