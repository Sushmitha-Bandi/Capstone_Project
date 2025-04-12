import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

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
  const [totalSpent, setTotalSpent] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const fetchExpenses = async () => {
    const token = await AsyncStorage.getItem("jwt");
    if (!token) return;

    try {
      const res = await fetch("http://192.168.1.84:8000/expenses/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setExpenses(data);
      }
    } catch (err) {
      console.error("Error fetching expenses", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTotalSpent = async () => {
    const token = await AsyncStorage.getItem("jwt");
    if (!token) return;

    try {
      const res = await fetch("http://192.168.1.84:8000/expenses/total", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const total = await res.json();
      setTotalSpent(Number(total));
    } catch (err) {
      console.error("Error fetching total spent", err);
    }
  };

  const deleteExpense = async () => {
    if (selectedId === null) return;

    const token = await AsyncStorage.getItem("jwt");
    if (!token) return;

    try {
      const res = await fetch(
        `http://192.168.1.84:8000/expenses/${selectedId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.status === 204) {
        setModalVisible(false);
        await fetchExpenses();
        await fetchTotalSpent();
      } else {
        const errorText = await res.text();
        console.error(`Failed to delete: ${res.status} - ${errorText}`);
      }
    } catch (err) {
      console.error("DELETE failed:", err);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchExpenses();
      fetchTotalSpent();
    }, [])
  );

  const renderItem = ({ item }: { item: Expense }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.item_name}</Text>
      {item.quantity && (
        <Text style={styles.quantity}>Qty: {item.quantity}</Text>
      )}
      <Text style={styles.amount}>${item.price.toFixed(2)}</Text>
      <Text style={styles.timestamp}>
        {new Date(item.timestamp).toLocaleString()}
      </Text>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => {
          setSelectedId(item.id);
          setModalVisible(true);
        }}
      >
        <Text style={styles.deleteText}>🗑️ Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>📜 Expense History</Text>
      {totalSpent !== null && (
        <Text style={styles.totalText}>
          💸 Total Spent: ${totalSpent.toFixed(2)}
        </Text>
      )}
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

      {/* Custom Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Delete this expense?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#dc3545" }]}
                onPress={deleteExpense}
              >
                <Text style={styles.modalBtnText}>Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#ccc" }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, flex: 1, backgroundColor: "#f9f9f9" },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  totalText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#007BFF",
    textAlign: "center",
    marginBottom: 10,
  },
  noData: { fontSize: 16, color: "#777", textAlign: "center", marginTop: 40 },
  card: {
    backgroundColor: "#fff",
    padding: 12,
    marginBottom: 12,
    borderRadius: 10,
    elevation: 2,
  },
  title: { fontSize: 16, fontWeight: "600" },
  quantity: { fontSize: 14, color: "#555" },
  amount: { color: "#d9534f", fontWeight: "bold", fontSize: 16 },
  timestamp: { color: "#888", fontSize: 12, marginTop: 4 },
  deleteButton: {
    marginTop: 10,
    alignSelf: "flex-end",
    backgroundColor: "#f8d7da",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  deleteText: {
    color: "#dc3545",
    fontWeight: "bold",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    padding: 24,
    borderRadius: 10,
    elevation: 5,
    alignItems: "center",
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
    fontWeight: "500",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalBtn: {
    flex: 1,
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 6,
    alignItems: "center",
  },
  modalBtnText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
