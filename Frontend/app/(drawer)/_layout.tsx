import { Drawer } from "expo-router/drawer";
import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from "@react-navigation/drawer";
import { View, Text, Image, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function DrawerLayout() {
  const router = useRouter();

  const CustomDrawerContent = (props: any) => {
    const logout = async () => {
      await AsyncStorage.removeItem("jwt");
      router.replace("/LoginScreen");
    };

    return (
      <DrawerContentScrollView {...props}>
        <View style={styles.profileContainer}>
          <Image
            source={{ uri: "https://via.placeholder.com/80" }}
            style={styles.profilePic}
          />
          <Text style={styles.profileName}>Hello, User!</Text>
          <DrawerItem
            label="👤 Profile"
            onPress={() => router.push("/(drawer)/ProfileScreen")}
          />
        </View>

        <DrawerItemList {...props} />

        <DrawerItem
          label="🚪 Logout"
          onPress={logout}
          style={{ marginTop: 20 }}
        />
      </DrawerContentScrollView>
    );
  };

  return (
    <Drawer
      screenOptions={{
        drawerType: "front",
        drawerStyle: {
          width: 250,
        },
        headerShown: true,
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen name="index" options={{ title: "🏠 Home" }} />
      <Drawer.Screen name="BudgetScreen" options={{ title: "💰 Budget" }} />
      <Drawer.Screen
        name="ShoppingListScreen"
        options={{ title: "🛍️ Shopping List" }}
      />
      <Drawer.Screen
        name="ManualEntryExpensesScreen"
        options={{ title: "✍️ Manual Entry" }}
      />
      <Drawer.Screen
        name="ExpenseHistoryScreen"
        options={{ title: "📜 Expense History" }}
      />
      <Drawer.Screen name="ProfileScreen" options={{ title: "👤 Profile" }} />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  profileContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  profilePic: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
  },
  profileName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
});
