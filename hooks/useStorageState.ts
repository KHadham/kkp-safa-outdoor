import { useEffect, useCallback, useReducer } from "react";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

type UseStateHook<T> = [[boolean, T | null], (value: T | null) => void];

function useAsyncState<T>(
  initialValue: [boolean, T | null] = [true, null]
): UseStateHook<T> {
  return useReducer(
    (
      state: [boolean, T | null],
      action: T | null = null
    ): [boolean, T | null] => [false, action],
    initialValue
  ) as UseStateHook<T>;
}

export async function setStorageItemAsync(key: string, value: string | null) {
  if (Platform.OS === "web") {
    try {
      if (value === null) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, value);
      }
    } catch (e) {
      console.error("Local storage is unavailable:", e);
    }
  } else {
    if (value == null) {
      await SecureStore.deleteItemAsync(key);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  }
}

// Utility function to get stored data outside of React components
export async function getStoredDataAsync<T>(key: string): Promise<T | null> {
  try {
    if (Platform.OS === "web") {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } else {
      const value = await SecureStore.getItemAsync(key);
      return value ? JSON.parse(value) : null;
    }
  } catch (e) {
    console.error("Error retrieving stored data:", e);
    return null;
  }
}

// React hook to manage state and sync with storage
export function useStorageState<T>(key: string): UseStateHook<T> {
  const [state, setState] = useAsyncState<T>();

  // Get value from storage and set it to state
  useEffect(() => {
    const fetchData = async () => {
      const storedValue = await getStoredDataAsync<T>(key);
      setState(storedValue);
    };
    fetchData();
  }, [key]);

  // Set value in state and store it in storage
  const setValue = useCallback(
    (value: T | null) => {
      setState(value);
      setStorageItemAsync(key, value ? JSON.stringify(value) : null);
    },
    [key]
  );

  return [state, setValue];
}
