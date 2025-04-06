import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function RootLayout() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem("jwt").then((token) => {
      setIsLoggedIn(!!token);
    });
  }, []);

  if (isLoggedIn === null) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {!isLoggedIn ? (
        <>
          <Stack.Screen name="LoginScreen" />
          <Stack.Screen name="SignupScreen" />
        </>
      ) : (
        <Stack.Screen name="(drawer)" />
      )}
    </Stack>
  );
}
