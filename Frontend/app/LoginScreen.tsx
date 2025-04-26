import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

const LoginScreen = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://192.168.1.84:8000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        await AsyncStorage.setItem("jwt", data.access_token);
        router.replace("/(drawer)");
      } else {
        const errorData = await response.json();
        Alert.alert("Login Failed", errorData.detail || "Invalid credentials");
      }
    } catch (error) {
      Alert.alert("Error", "Unable to connect to server");
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Button title="Login" onPress={handleLogin} />
      )}

      {/* Forgot Password link */}
      <TouchableOpacity
        style={styles.forgotContainer}
        onPress={() => router.push("/ForgotPasswordScreen")}
      >
        <Text style={styles.forgotText}>Forgot Password?</Text>
      </TouchableOpacity>

      <View style={styles.switchContainer}>
        <Text style={styles.switchText}>Don't have an account?</Text>
        <TouchableOpacity onPress={() => router.push("/SignupScreen")}>
          <Text style={styles.signupText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LoginScreen;

// ✨ Updated Styles for professional look
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 32,
    textAlign: "center",
    marginBottom: 30,
    fontWeight: "bold",
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 14,
    marginBottom: 20,
    borderRadius: 8,
    fontSize: 16,
  },
  forgotContainer: {
    marginTop: 15,
    alignItems: "center",
  },
  forgotText: {
    color: "#007BFF",
    fontSize: 14,
    fontWeight: "500",
  },
  switchContainer: {
    marginTop: 30,
    alignItems: "center",
  },
  switchText: {
    fontSize: 16,
    color: "#555",
  },
  signupText: {
    marginTop: 6,
    fontSize: 16,
    color: "#007BFF",
    fontWeight: "600",
  },
});
