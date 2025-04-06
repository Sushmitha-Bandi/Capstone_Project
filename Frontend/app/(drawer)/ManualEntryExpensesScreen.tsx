import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function ManualEntryScreen() {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const router = useRouter();

  const handleSubmit = async () => {
    if (!description.trim() || !amount.trim() || isNaN(Number(amount))) {
      Alert.alert("Error", "Please enter valid item and amount");
      return;
    }

    const token = await AsyncStorage.getItem("jwt");

    try {
      const res = await fetch("http://192.168.1.84:8000/expenses/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          item_name: description,
          price: parseFloat(amount),
        }),
      });

      if (res.ok) {
        setDescription("");
        setAmount("");
        Alert.alert("✅ Saved", "Expense saved successfully!");

        router.replace("/");
      } else {
        const err = await res.json();
        Alert.alert("Failed", err.detail || "Something went wrong");
      }
    } catch (err) {
      Alert.alert("Error", "Failed to connect to server");
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container}>
      <Text style={styles.title}>Manual Price Entry</Text>
      <TextInput
        style={styles.input}
        placeholder="Item name (e.g. Milk)"
        value={description}
        onChangeText={setDescription}
      />
      <TextInput
        style={styles.input}
        placeholder="Amount (e.g. 9.99)"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />
      <Button title="Save Expense" onPress={handleSubmit} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: { fontSize: 24, marginBottom: 20, textAlign: "center" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
    backgroundColor: "#f9f9f9",
  },
});
