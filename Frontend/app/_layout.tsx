import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [layoutReady, setLayoutReady] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem("jwt");
      console.log("JWT token:", token);
      setIsLoggedIn(!!token);
    };

    if (fontsLoaded) {
      SplashScreen.hideAsync();
      checkAuth();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    if (isLoggedIn === false && layoutReady) {
      router.replace("/LoginScreen");
    }
  }, [isLoggedIn, layoutReady]);

  if (!fontsLoaded || isLoggedIn === null) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <View style={{ flex: 1 }} onLayout={() => setLayoutReady(true)}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="LoginScreen" options={{ title: "Login" }} />
          <Stack.Screen name="SignupScreen" options={{ title: "Sign Up" }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </View>
    </ThemeProvider>
  );
}
