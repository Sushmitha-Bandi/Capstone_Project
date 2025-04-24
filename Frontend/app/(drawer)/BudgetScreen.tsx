import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Animated,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function BudgetScreen() {
  const [budget, setBudget] = useState("");
  const [savedBudget, setSavedBudget] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [message] = useState(new Animated.Value(0));
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
        setEditMode(false);
        setBudget("");
        fetchTotalExpenses();
        Animated.timing(message, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }).start(() =>
          setTimeout(() => {
            Animated.timing(message, {
              toValue: 0,
              duration: 800,
              useNativeDriver: true,
            }).start();
          }, 2000)
        );
      } else {
        Alert.alert("Error", data.detail || "Could not update budget");
      }
    } catch {
      Alert.alert("Error", "Something went wrong.");
    }
    setLoading(false);
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

  const getComparisonStatus = () => {
    if (!savedBudget || totalSpent === null) return null;
    const budgetNum = parseFloat(savedBudget);
    if (totalSpent > budgetNum)
      return <Text style={[styles.badge, styles.over]}>Over Budget 🚨</Text>;
    if (totalSpent === budgetNum)
      return <Text style={[styles.badge, styles.equal]}>On Budget ⚖️</Text>;
    return <Text style={[styles.badge, styles.under]}>Under Budget ✅</Text>;
  };

  return (
    <View style={styles.container}>
      {fetching ? (
        <ActivityIndicator size="large" />
      ) : (
        <>
          <View style={styles.card}>
            <Text style={styles.title}>💰 Budget Summary</Text>
            <Text style={styles.budgetLine}>
              Budget:{" "}
              <Text style={styles.amount}>
                ${savedBudget ? savedBudget : "Not Set"}
              </Text>
            </Text>
            <Text style={styles.budgetLine}>
              Spent:{" "}
              <Text style={styles.spent}>
                ${totalSpent?.toFixed(2) ?? "0.00"}
              </Text>
            </Text>
            {getComparisonStatus()}
          </View>

          {editMode ? (
            <>
              <Text style={styles.label}>Edit Budget:</Text>
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
                  <Button title="Cancel" onPress={() => setEditMode(false)} />
                </View>
              </View>
            </>
          ) : (
            <View style={styles.editButtonContainer}>
              <Button title="Edit Budget" onPress={() => setEditMode(true)} />
            </View>
          )}

          {/* Animated success text */}
          <Animated.Text
            style={[
              styles.successText,
              { opacity: message, transform: [{ scale: message }] },
            ]}
          >
            ✅ Budget updated!
          </Animated.Text>

          {/* Motivational Tip */}
          <View style={styles.tipBox}>
            <Text style={styles.tipText}>
              💡 Tip: Keep your spending{" "}
              <Text style={{ fontWeight: "bold" }}>20%</Text> below your budget
              to save more!
            </Text>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: "#fff",
  },
  card: {
    backgroundColor: "#f0f4f8",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  budgetLine: {
    fontSize: 16,
    marginVertical: 4,
  },
  amount: {
    color: "#007bff",
    fontWeight: "bold",
  },
  spent: {
    color: "#dc3545",
    fontWeight: "bold",
  },
  badge: {
    marginTop: 10,
    padding: 6,
    borderRadius: 6,
    textAlign: "center",
    fontWeight: "bold",
  },
  over: {
    backgroundColor: "#f8d7da",
    color: "#721c24",
  },
  equal: {
    backgroundColor: "#fff3cd",
    color: "#856404",
  },
  under: {
    backgroundColor: "#d4edda",
    color: "#155724",
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
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  buttonWrapper: {
    flex: 1,
  },
  editButtonContainer: {
    marginTop: 10,
  },
  successText: {
    color: "green",
    fontSize: 14,
    marginTop: 16,
    textAlign: "center",
  },
  tipBox: {
    marginTop: 30,
    backgroundColor: "#e3f2fd",
    padding: 14,
    borderRadius: 10,
  },
  tipText: {
    color: "#0d47a1",
    fontSize: 14,
    textAlign: "center",
  },
});
