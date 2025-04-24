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
  const [totalSpent, setTotalSpent] = useState<number | null>(null);

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
    } catch {
      Alert.alert("Error", "Could not fetch budget");
    }
  };

  const fetchTotalExpenses = async () => {
    try {
      const token = await AsyncStorage.getItem("jwt");
      const res = await fetch("http://192.168.1.84:8000/expenses/total", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const total = await res.json();
        setTotalSpent(Number(total));
      }
    } catch {
      console.error("Error fetching expenses");
    }
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
    } catch {
      Alert.alert("Error", "Something went wrong.");
    }
    setLoading(false);
  };

  const getComparisonMessage = () => {
    if (!savedBudget || totalSpent === null) return null;
    const budgetNum = parseFloat(savedBudget);
    if (totalSpent > budgetNum) return "🚨 You have exceeded your budget!";
    if (totalSpent === budgetNum) return "⚖️ You are exactly on your budget.";
    return `🟢 You are under budget by $${(budgetNum - totalSpent).toFixed(2)}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      setFetching(true);
      await fetchBudget();
      await fetchTotalExpenses();
      setFetching(false);
    };
    fetchData();
  }, []);

  const handleEdit = () => {
    if (savedBudget) {
      setBudget(savedBudget);
      setEditMode(true);
    }
  };

  const cancelEdit = () => {
    setBudget("");
    setEditMode(false);
    setMessage(null);
  };

  return (
    <View style={styles.container}>
      {fetching ? (
        <ActivityIndicator size="large" />
      ) : editMode ? (
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
      ) : (
        <View style={styles.centeredContent}>
          <Text style={styles.savedText}>
            🎯 Your current budget:{" "}
            <Text style={styles.amount}>${savedBudget}</Text>
          </Text>
          <Text style={styles.savedText}>
            💰 Total Spent:{" "}
            <Text style={styles.amount}>
              ${totalSpent?.toFixed(2) ?? "0.00"}
            </Text>
          </Text>
          {message && <Text style={styles.successText}>{message}</Text>}
          {getComparisonMessage() && (
            <Text style={styles.statusMessage}>{getComparisonMessage()}</Text>
          )}
          <View style={{ marginTop: 20 }}>
            <Button title="Edit Budget" onPress={handleEdit} />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
    backgroundColor: "#fff",
  },
  centeredContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
    backgroundColor: "#f9f9f9",
  },
  savedText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 6,
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
  statusMessage: {
    marginTop: 12,
    fontSize: 16,
    color: "#dc3545",
    fontWeight: "bold",
    textAlign: "center",
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
