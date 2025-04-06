import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

type ShoppingItem = {
  id: number;
  item_name: string;
  quantity?: string;
};

export default function ShoppingListScreen() {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [editedName, setEditedName] = useState("");
  const [editedQty, setEditedQty] = useState("");

  const fetchItems = async () => {
    const token = await AsyncStorage.getItem("jwt");
    const response = await fetch("http://192.168.1.84:8000/shopping-list/", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data: ShoppingItem[] = await response.json();
    setItems(data);
  };

  const addItem = async () => {
    if (!itemName.trim()) {
      Alert.alert("Validation Error", "Item name is required.");
      return;
    }

    const token = await AsyncStorage.getItem("jwt");
    const response = await fetch("http://192.168.1.84:8000/shopping-list/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ item_name: itemName, quantity }),
    });

    if (response.ok) {
      setItemName("");
      setQuantity("");
      setShowAddForm(false);
      fetchItems();
    } else {
      Alert.alert("Error", "Failed to add item");
    }
  };

  const deleteItem = async (id: number) => {
    const token = await AsyncStorage.getItem("jwt");
    await fetch(`http://192.168.1.84:8000/shopping-list/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchItems();
  };

  const startEdit = (item: ShoppingItem) => {
    setEditingItemId(item.id);
    setEditedName(item.item_name);
    setEditedQty(item.quantity || "");
  };

  const saveEdit = async () => {
    const token = await AsyncStorage.getItem("jwt");
    const response = await fetch(
      `http://192.168.1.84:8000/shopping-list/${editingItemId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          item_name: editedName,
          quantity: editedQty,
        }),
      }
    );

    if (response.ok) {
      setEditingItemId(null);
      setEditedName("");
      setEditedQty("");
      fetchItems();
    } else {
      Alert.alert("Error", "Failed to update item");
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🛒 My Shopping List</Text>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setShowAddForm(!showAddForm)}
      >
        <Text style={styles.addButtonText}>
          {showAddForm ? "Cancel" : "➕ Add Item"}
        </Text>
      </TouchableOpacity>

      {showAddForm && (
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Item Name"
            value={itemName}
            onChangeText={setItemName}
          />
          <TextInput
            style={styles.input}
            placeholder="Quantity"
            value={quantity}
            onChangeText={setQuantity}
          />
          <Button title="Save" onPress={addItem} />
        </View>
      )}

      <FlatList
        data={items}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 30 }}
        renderItem={({ item }) =>
          editingItemId === item.id ? (
            <View style={styles.editRow}>
              <TextInput
                style={styles.editInput}
                value={editedName}
                onChangeText={setEditedName}
              />
              <TextInput
                style={styles.editInput}
                value={editedQty}
                onChangeText={setEditedQty}
              />
              <Button title="Save" onPress={saveEdit} />
            </View>
          ) : (
            <View style={styles.itemCard}>
              <Text style={styles.itemText}>
                {item.item_name} {item.quantity ? `(${item.quantity})` : ""}
              </Text>
              <View style={styles.actions}>
                <TouchableOpacity onPress={() => startEdit(item)}>
                  <Text style={styles.link}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteItem(item.id)}>
                  <Text style={[styles.link, { color: "red" }]}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f8f9fa" },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  addButton: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: "center",
  },
  addButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  form: {
    marginBottom: 20,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    elevation: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  itemCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  itemText: { fontSize: 16, fontWeight: "500" },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
    gap: 15,
  },
  link: {
    color: "#007BFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  editRow: {
    flexDirection: "column",
    gap: 10,
    marginBottom: 20,
    backgroundColor: "#e9ecef",
    padding: 10,
    borderRadius: 10,
  },
  editInput: {
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 6,
    padding: 8,
    backgroundColor: "#fff",
  },
});
