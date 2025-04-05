import { View, Button } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import ShoppingListScreen from "../ShoppingListScreen";

export default function HomeScreen() {
  const router = useRouter();

  const logout = async () => {
    await AsyncStorage.removeItem("jwt");
    router.replace("/LoginScreen");
  };

  return (
    <View style={{ flex: 1 }}>
      <ShoppingListScreen />
      <Button title="Logout" onPress={logout} />
    </View>
  );
}
