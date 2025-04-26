import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthProvider, useAuth } from "./(drawer)/AuthContext";

function RootLayoutInner() {
  const { resetKey } = useAuth();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem("jwt");
      setIsLoggedIn(!!token);
    };

    checkToken();
  }, [resetKey]);

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

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutInner />
    </AuthProvider>
  );
}
