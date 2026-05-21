import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { router } from "expo-router";
const API_URL = process.env.EXPO_PUBLIC_API_URL;

type Routine = {
  id: number;
  name: string;
  created_at: string;
};

export default function RoutinesScreen() {
  const [routines, setRoutines] = useState<Routine[]>([]);

  useEffect(() => {
    const getRoutines = async () => {
      try {
        const token = await AsyncStorage.getItem("token");

        const res = await axios.get(`${API_URL}/routines`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setRoutines(res.data.routines);
      } catch (error: any) {
        console.log("Get routines error:", error?.response?.data || error.message);
        Alert.alert("Error", "Could not load routines");
      }
    };

    getRoutines();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Routines</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/create-routine")}
      >
        <Text style={styles.buttonText}>Create New Routine</Text>
      </TouchableOpacity>

      <FlatList
        data={routines}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No routines yet. Create one!</Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              router.push({
                pathname: "/routine-details",
                params: { id: item.id, name: item.name },
              })
            }
          >
            <Text style={styles.routineName}>{item.name}</Text>
            <Text style={styles.routineDate}>
              Created: {new Date(item.created_at).toLocaleDateString()}
            </Text>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => router.replace("/home")}
      >
        <Text style={styles.secondaryButtonText}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f7f7f7",
    paddingTop: 60,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#111",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 14,
    marginBottom: 12,
  },
  routineName: {
    fontSize: 20,
    fontWeight: "bold",
  },
  routineDate: {
    marginTop: 5,
    color: "#777",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 30,
    color: "#777",
    fontSize: 16,
  },
  secondaryButton: {
    marginTop: 10,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#007AFF",
    fontSize: 14,
  },
});