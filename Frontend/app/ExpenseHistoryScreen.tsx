import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Expense = {
  id: number;
  item_name: string;
  quantity?: string;
  price: number;
  timestamp: string;
};

export default function ExpenseHistoryScreen() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExpenses = async () => {
    const token = await AsyncStorage.getItem("jwt");

    try {
      const res = await fetch("http://192.168.1.84:8000/expenses/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data: Expense[] = await res.json();
        setExpenses(data); // already ordered from backend
      } else {
        console.error("Failed to fetch expenses");
      }
    } catch (err) {
      console.error("Error fetching expenses", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const renderItem = ({ item }: { item: Expense }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.item_name}</Text>
      {item.quantity && <Text style={styles.quantity}>Qty: {item.quantity}</Text>}
      <Text style={styles.amount}>${item.price.toFixed(2)}</Text>
      <Text style={styles.timestamp}>
        {new Date(item.timestamp).toLocaleString()}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>📜 Expense History</Text>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : expenses.length === 0 ? (
        <Text style={styles.noData}>No expenses recorded yet.</Text>
      ) : (
        <FlatList
          data={expenses}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  noData: {
    fontSize: 16,
    color: "#777",
    textAlign: "center",
    marginTop: 40,
  },
  card: {
    backgroundColor: "#fff",
    padding: 12,
    marginBottom: 12,
    borderRadius: 10,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
  },
  quantity: {
    fontSize: 14,
    color: "#555",
  },
  amount: {
    color: "#d9534f",
    fontWeight: "bold",
    fontSize: 16,
  },
  timestamp: {
    color: "#888",
    fontSize: 12,
    marginTop: 4,
  },
});
