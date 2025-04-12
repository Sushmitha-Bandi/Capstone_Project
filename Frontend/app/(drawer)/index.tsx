import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Dimensions, ScrollView } from "react-native";
import { BarChart, LineChart } from "react-native-chart-kit";
import AsyncStorage from "@react-native-async-storage/async-storage";

const screenWidth = Dimensions.get("window").width;

export default function HomeScreen() {
  const [totalSpent, setTotalSpent] = useState(0);
  const [budget, setBudget] = useState(500); // You can fetch dynamically if needed
  const [weeklyLabels, setWeeklyLabels] = useState<string[]>([]);
  const [weeklyAmounts, setWeeklyAmounts] = useState<number[]>([]);

  useEffect(() => {
    fetchTotalSpent();
    fetchWeeklySpending();
  }, []);

  const fetchTotalSpent = async () => {
    const token = await AsyncStorage.getItem("jwt");
    try {
      const res = await fetch("http://192.168.1.84:8000/expenses/total", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setTotalSpent(Number(data));
    } catch (error) {
      console.error("Error fetching total spent:", error);
    }
  };

  const fetchWeeklySpending = async () => {
    const token = await AsyncStorage.getItem("jwt");
    try {
      const res = await fetch("http://192.168.1.84:8000/expenses/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      const grouped: Record<string, number> = {};

      for (let i = 6; i >= 0; i--) {
        const day = new Date();
        day.setDate(day.getDate() - i);
        const label = day.toLocaleDateString("en-US", { weekday: "short" });
        grouped[label] = 0;
      }

      data.forEach((item: any) => {
        const date = new Date(item.timestamp);
        const label = date.toLocaleDateString("en-US", { weekday: "short" });
        if (grouped[label] !== undefined) {
          grouped[label] += item.price;
        }
      });

      setWeeklyLabels(Object.keys(grouped));
      setWeeklyAmounts(Object.values(grouped));
    } catch (error) {
      console.error("Error fetching weekly data:", error);
    }
  };

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
  container: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: "#f9f9f9",
  },
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
  chart: {
    borderRadius: 16,
    marginBottom: 24,
    alignSelf: "center",
  },
});
