import {
  View,
  Text,
  Button,
  ScrollView,
  StyleSheet,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import ShoppingListScreen from "../ShoppingListScreen";
import BudgetScreen from "../BudgetScreen";

export default function HomeScreen() {
  const router = useRouter();

  const logout = async () => {
    await AsyncStorage.removeItem("jwt");
    router.replace("/LoginScreen");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.appTitle}>🛒 My Shopping & Budget App</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>💰 Budget</Text>
        <BudgetScreen />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>🛍️ Shopping List</Text>
        <ShoppingListScreen />
      </View>

      <View style={styles.footer}>
        <Button title="Logout" onPress={logout} color="#d9534f" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
    backgroundColor: "#f2f2f2",
    flexGrow: 1,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
    color: "#333",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    color: "#333",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  footer: {
    marginTop: 10,
    alignItems: "center",
  },
});
