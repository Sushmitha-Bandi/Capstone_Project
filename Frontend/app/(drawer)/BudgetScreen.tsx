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
  const [savedBudget, setSavedBudget] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Fetch budget on mount
  const fetchBudget = async () => {
    try {
      const token = await AsyncStorage.getItem("jwt");
      const res = await fetch("http://192.168.1.84:8000/budget/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setSavedBudget(data.amount.toString());
      } else {
        setSavedBudget(null);
      }
    } catch (err) {
      Alert.alert("Error", "Could not fetch budget");
    }
    setFetching(false);
  };

  // Save budget
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

      const data = await res.json();

      if (res.ok) {
        setSavedBudget(data.amount.toString());
        setMessage("✅ Budget updated successfully!");
        setEditMode(false);
        setBudget("");
        setTimeout(() => setMessage(null), 3000);
      } else {
        Alert.alert("Error", data.detail || "Could not update budget");
      }
    } catch (err) {
      Alert.alert("Error", "Something went wrong.");
    }
    setLoading(false);
  };

  // Setup initial fetch
  useEffect(() => {
    fetchBudget();
  }, []);

  // Handle edit click
  const handleEdit = () => {
    if (savedBudget) {
      setBudget(savedBudget); // pre-fill current
      setEditMode(true);
    }
  };

  // Cancel editing
  const cancelEdit = () => {
    setBudget("");
    setEditMode(false);
    setMessage(null);
  };

  return (
    <View style={styles.container}>
      {fetching ? (
        <ActivityIndicator size="large" />
      ) : (
        <>
          {editMode ? (
            <>
              <Text style={styles.label}>Edit your budget:</Text>
              <TextInput
                style={styles.input}
                value={budget}
                onChangeText={setBudget}
                placeholder="e.g. 2000"
                keyboardType="numeric"
              />
              <View style={styles.buttonRow}>
                <View style={styles.buttonWrapper}>
                  <Button
                    title={loading ? "Saving..." : "Save"}
                    onPress={saveBudget}
                    disabled={loading}
                    color="#28a745"
                  />
                </View>
                <View style={styles.buttonWrapper}>
                  <Button title="Cancel" onPress={cancelEdit} color="#6c757d" />
                </View>
              </View>
            </>
          ) : savedBudget ? (
            <>
              <Text style={styles.savedText}>
                🎯 Your current budget:{" "}
                <Text style={styles.amount}>${savedBudget}</Text>
              </Text>
              {message && <Text style={styles.successText}>{message}</Text>}
              <View style={{ marginTop: 10 }}>
                <Button title="Edit Budget" onPress={handleEdit} />
              </View>
            </>
          ) : (
            <>
              <Text style={styles.label}>Set your budget:</Text>
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
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 10,
    paddingBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 6,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  savedText: {
    marginTop: 10,
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  amount: {
    color: "#007BFF",
    fontWeight: "bold",
  },
  successText: {
    color: "green",
    fontSize: 14,
    marginTop: 8,
    fontStyle: "italic",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  buttonWrapper: {
    flex: 1,
  },
});
