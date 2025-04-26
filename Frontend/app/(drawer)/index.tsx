import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { BarChart, LineChart } from "react-native-chart-kit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "./AuthContext";

const screenWidth = Dimensions.get("window").width;

export default function HomeScreen() {
  const [totalSpent, setTotalSpent] = useState<number>(0);
  const [budget, setBudget] = useState<number>(0);
  const [weeklyLabels, setWeeklyLabels] = useState<string[]>([]);
  const [weeklyAmounts, setWeeklyAmounts] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  const { resetKey } = useAuth();

  const fetchData = async () => {
    const token = await AsyncStorage.getItem("jwt");
    if (!token) {
      setTotalSpent(0);
      setBudget(0);
      setWeeklyLabels([]);
      setWeeklyAmounts([]);
      setLoading(false);
      return;
    }

    try {
      const [budgetRes, totalRes, expensesRes] = await Promise.all([
        fetch("http://192.168.1.84:8000/budget/", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://192.168.1.84:8000/expenses/total", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://192.168.1.84:8000/expenses/", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (budgetRes.ok) {
        const budgetData = await budgetRes.json();
        setBudget(Number(budgetData.amount));
      } else {
        setBudget(0);
      }

      if (totalRes.ok) {
        const totalData = await totalRes.json();
        setTotalSpent(Number(totalData));
      } else {
        setTotalSpent(0);
      }

      if (expensesRes.ok) {
        const expenses = await expensesRes.json();
        const grouped: Record<string, number> = {};

        for (let i = 6; i >= 0; i--) {
          const day = new Date();
          day.setDate(day.getDate() - i);
          const label = day.toLocaleDateString("en-US", { weekday: "short" });
          grouped[label] = 0;
        }

        expenses.forEach((item: any) => {
          const date = new Date(item.timestamp);
          const label = date.toLocaleDateString("en-US", { weekday: "short" });
          if (grouped[label] !== undefined) {
            grouped[label] += item.price;
          }
        });

        setWeeklyLabels(Object.keys(grouped));
        setWeeklyAmounts(Object.values(grouped));
      } else {
        setWeeklyLabels([]);
        setWeeklyAmounts([]);
      }
    } catch (error) {
      console.error("Error fetching HomeScreen data", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      setTotalSpent(0);
      setBudget(0);
      setWeeklyLabels([]);
      setWeeklyAmounts([]);
      fetchData();
    }, [resetKey])
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Welcome to My Shopping & Budget App 🛒</Text>
      <Text style={styles.subtitle}>Use the menu to navigate</Text>

      <Text style={styles.chartTitle}>📊 Budget vs Spent</Text>
      <BarChart
        data={{
          labels: ["Budget", "Spent"],
          datasets: [{ data: [budget, totalSpent] }],
        }}
        width={screenWidth - 32}
        height={220}
        fromZero
        yAxisSuffix="$"
        chartConfig={{
          backgroundGradientFrom: "#fff",
          backgroundGradientTo: "#fff",
          color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`,
          labelColor: () => "#000",
          barPercentage: 0.5,
          decimalPlaces: 2,
        }}
        style={styles.chart}
      />

      <Text style={styles.chartTitle}>📈 Weekly Spend</Text>
      <LineChart
        data={{
          labels: weeklyLabels,
          datasets: [{ data: weeklyAmounts }],
        }}
        width={screenWidth - 32}
        height={220}
        yAxisSuffix="$"
        fromZero
        chartConfig={{
          backgroundGradientFrom: "#fff",
          backgroundGradientTo: "#fff",
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(255, 99, 132, ${opacity})`,
          labelColor: () => "#000",
        }}
        bezier
        style={styles.chart}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, backgroundColor: "#f9f9f9" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 24,
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 24,
    marginBottom: 8,
    textAlign: "center",
  },
  chart: { borderRadius: 16, marginBottom: 24, alignSelf: "center" },
});
