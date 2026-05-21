import { useCallback, useState } from "react";
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
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

type RoutineExercise = {
  id: number;
  routine_id: number;
  name: string;
  exercise_order: number;
};

export default function RoutineDetailsScreen() {
  const { id, name } = useLocalSearchParams();
  const [routineExercises, setRoutineExercises] = useState<RoutineExercise[]>([]);

  const getRoutineExercises = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const res = await axios.get(`${API_URL}/routines/${id}/exercises`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setRoutineExercises(res.data.exercises);
    } catch (error: any) {
      console.log(
        "Get routine exercises error:",
        error?.response?.data || error.message
      );
      Alert.alert("Error", "Could not load routine exercises");
    }
  };

  useFocusEffect(
    useCallback(() => {
      getRoutineExercises();
    }, [])
  );

  const deleteExercise = async (exerciseId: number) => {
    Alert.alert(
      "Delete Exercise",
      "Are you sure you want to remove this exercise from the routine?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("token");

              await axios.delete(`${API_URL}/routine-exercises/${exerciseId}`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });

              getRoutineExercises();
            } catch (error: any) {
              console.log(
                "Delete exercise error:",
                error?.response?.data || error.message
              );
              Alert.alert("Error", "Could not delete exercise");
            }
          },
        },
      ]
    );
  };

  const startRoutine = () => {
    if (routineExercises.length === 0) {
      Alert.alert("No Exercises", "Add exercises before starting this routine.");
      return;
    }

    router.push({
      pathname: "/active-workout" as any,
      params: {
        routineId: String(id),
        routineName: String(name),
      },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{name}</Text>
      <Text style={styles.subtitle}>Exercises in this routine</Text>

      <FlatList
        data={routineExercises}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No exercises added yet. Tap + to add exercises.
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View>
              <Text style={styles.exerciseName}>
                {item.exercise_order}. {item.name}
              </Text>
            </View>

            <TouchableOpacity onPress={() => deleteExercise(item.id)}>
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <TouchableOpacity style={styles.startButton} onPress={startRoutine}>
        <Text style={styles.startButtonText}>Start Routine</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => router.replace("/routines")}
      >
        <Text style={styles.secondaryButtonText}>Back to Routines</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() =>
          router.push({
            pathname: "/add-routine-exercises" as any,
            params: { id: String(id), name: String(name) },
          })
        }
      >
        <Text style={styles.floatingButtonText}>+</Text>
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
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#777",
    textAlign: "center",
    marginBottom: 20,
    marginTop: 5,
  },
  startButton: {
    backgroundColor: "#22c55e",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 15,
  },
  startButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 14,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: "600",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 30,
    color: "#777",
    fontSize: 16,
  },
  deleteText: {
    color: "red",
    fontWeight: "600",
  },
  secondaryButton: {
    marginTop: 10,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#007AFF",
    fontSize: 14,
  },
  floatingButton: {
    position: "absolute",
    right: 25,
    bottom: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
  },
  floatingButtonText: {
    color: "#fff",
    fontSize: 34,
    lineHeight: 36,
    fontWeight: "bold",
  },
});