import "../global.css";

import { NAV_THEME } from "@/lib/theme";
import { PortalHost } from "@rn-primitives/portal";
import { Tabs, ThemeProvider } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { FontAwesome6, MaterialIcons } from "@expo/vector-icons";

export default function RootLayout() {
  return (
    <ThemeProvider value={NAV_THEME.dark}>
      <Tabs
        screenOptions={{
          headerStyle: { backgroundColor: "#1a1a1a" },
          headerTintColor: "#fff",
          tabBarStyle: { backgroundColor: "#1a1a1a", borderTopColor: "#333" },
          tabBarActiveTintColor: "#fff",
          tabBarInactiveTintColor: "#888",
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            headerTitleStyle: {
              fontFamily: "mono",
            },
            title: "Text to Voice",
            tabBarIcon: ({ color }) => (
              <FontAwesome6 name="microphone-lines" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="voice-to-text"
          options={{
            title: "Voice to Text",
            tabBarIcon: ({ color }) => (
              <MaterialIcons name="record-voice-over" size={24} color={color} />
            ),
          }}
        />
      </Tabs>
      <PortalHost />
      <StatusBar style="light" />
    </ThemeProvider>
  );
}
