import { focusManager, onlineManager, QueryClient } from "@tanstack/react-query";
import * as Network from "expo-network";
import { AppState, Platform } from "react-native";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 2,
    },
  },
});

if (Platform.OS !== "web") {
  focusManager.setEventListener((handleFocus) => {
    const subscription = AppState.addEventListener("change", (state) => {
      handleFocus(state === "active");
    });
    return () => subscription.remove();
  });

  onlineManager.setEventListener((setOnline) => {
    Network.getNetworkStateAsync().then((state) => setOnline(state.isConnected !== false));
    const subscription = Network.addNetworkStateListener((state) => {
      setOnline(state.isConnected !== false);
    });
    return () => subscription.remove();
  });
}
