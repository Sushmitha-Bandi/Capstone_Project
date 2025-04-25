import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserDetails = async () => {
    const token = await AsyncStorage.getItem("jwt");
    try {
      const res = await fetch("http://192.168.1.84:8000/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        console.error("❌ Failed to fetch: ", res.status);
        setUser(null);
        return;
      }

      const data = await res.json();
      console.log("✅ Fetched user data:", data);
      setUser(data);
    } catch (err) {
      console.error("❌ Exception while fetching user profile:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  const getInitials = (name: string | null = "") => {
    return name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase();
  };

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>Could not load user details.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>👤 Profile Details</Text>
      <View style={styles.avatarWrapper}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {getInitials(user.full_name || user.username)}
          </Text>
        </View>
      </View>
      <View style={styles.infoBox}>
        <ProfileField label="Username" value={user.username} />
        <ProfileField label="Full Name" value={user.full_name} />
        <ProfileField label="Email" value={user.email} />
        <ProfileField label="Phone" value={user.phone} />
        <ProfileField
          label="Joined On"
          value={
            user.created_at
              ? new Date(user.created_at).toLocaleDateString()
              : "N/A"
          }
        />
      </View>
    </ScrollView>
  );
}

const ProfileField = ({ label, value }: { label: string; value: string }) => (
  <>
    <Text style={styles.label}>{label}:</Text>
    <Text style={styles.value}>{value || "N/A"}</Text>
  </>
);

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f9f9f9",
    flexGrow: 1,
    alignItems: "center",
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
  },
  avatarWrapper: {
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#007BFF",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
  },
  infoBox: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    color: "#555",
    marginTop: 10,
  },
  value: {
    fontSize: 16,
    fontWeight: "500",
    color: "#222",
  },
  errorText: {
    color: "#dc3545",
    fontSize: 16,
  },
});
