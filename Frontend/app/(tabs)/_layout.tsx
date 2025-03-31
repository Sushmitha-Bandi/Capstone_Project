// app/_layout.tsx
import React, { useEffect, useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Layout() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem('jwt');
        if (token) {
          // If a token exists, go to your main/home screen.
          // Example: router.replace('/explore') or '/home'
          router.replace('/explore');
        } else {
          // If no token, go to the login screen
          // (assuming you have a file named LoginScreen.tsx in app/)
          router.replace('/LoginScreen');
        }
      } catch (error) {
        // Fallback: if an error occurs, also go to login
        router.replace('/LoginScreen');
      }
      setCheckingAuth(false);
    };

    checkToken();
  }, []);

  // Show a loading indicator while checking token
  if (checkingAuth) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Once the token check is done, render the stack normally
  return <Stack />;
}
