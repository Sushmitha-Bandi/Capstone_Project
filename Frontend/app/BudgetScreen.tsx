import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function BudgetScreen() {
  const [budget, setBudget] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const fetchBudget = async () => {
    try {
      const token = await AsyncStorage.getItem("jwt");
      const res = await fetch("http://192.168.1.84:8000/budget/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setBudget(data.amount.toString());
      } else {
        setBudget("");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Could not fetch budget");
    }
    setFetching(false);
  };

  const saveBudget = async () => {
    if (!budget.trim() || isNaN(Number(budget))) {
      Alert.alert("Invalid Input", "Please enter a valid number.");
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("jwt");
      const res = await fetch("http://192.168.1.84:8000/budget/", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: parseFloat(budget) }),
      });

      if (res.ok) {
        Alert.alert("Success", "Budget updated successfully");
      } else {
        Alert.alert("Error", "Failed to update budget");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Something went wrong");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBudget();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>💰 Monthly Budget</Text>

      {fetching ? (
        <ActivityIndicator size="large" />
      ) : (
        <>
          <Text style={styles.label}>Enter your budget:</Text>
          <TextInput
            style={styles.input}
            value={budget}
            onChangeText={setBudget}
            placeholder="e.g. 2000"
            keyboardType="numeric"
          />
          <Button
            title={loading ? "Saving..." : "Save Budget"}
            onPress={saveBudget}
            disabled={loading}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
  },
  heading: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
    fontWeight: "bold",
  },
  label: {
    fontSize: 16,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 6,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
});
