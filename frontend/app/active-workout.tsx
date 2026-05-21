import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  Alert,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { router, useLocalSearchParams } from "expo-router";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

type RoutineExercise = {
  id: number;
  routine_id: number;
  name: string;
  exercise_order: number;
};

type WorkoutSet = {
  id: string;
  setNumber: number;
  weight: string;
  reps: string;
  completed: boolean;
};

type WorkoutExercise = {
  routineExerciseId: number;
  name: string;
  sets: WorkoutSet[];
};

export default function ActiveWorkoutScreen() {
  const { routineId, routineName } = useLocalSearchParams();

  const [seconds, setSeconds] = useState(0);
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>(
    []
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadRoutineExercises = async () => {
      try {
        const token = await AsyncStorage.getItem("token");

        const res = await axios.get(
          `${API_URL}/routines/${routineId}/exercises`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const formattedExercises = res.data.exercises.map(
          (exercise: RoutineExercise) => ({
            routineExerciseId: exercise.id,
            name: exercise.name,
            sets: [
              {
                id: `${exercise.id}-1`,
                setNumber: 1,
                weight: "",
                reps: "",
                completed: false,
              },
            ],
          })
        );

        setWorkoutExercises(formattedExercises);
      } catch (error: any) {
        console.log(
          "Load active workout error:",
          error?.response?.data || error.message
        );
        Alert.alert("Error", "Could not load workout");
      }
    };

    loadRoutineExercises();
  }, []);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;

    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const addSet = (routineExerciseId: number) => {
    setWorkoutExercises((currentExercises) =>
      currentExercises.map((exercise) => {
        if (exercise.routineExerciseId !== routineExerciseId) return exercise;

        const nextSetNumber = exercise.sets.length + 1;

        return {
          ...exercise,
          sets: [
            ...exercise.sets,
            {
              id: `${routineExerciseId}-${nextSetNumber}-${Date.now()}`,
              setNumber: nextSetNumber,
              weight: "",
              reps: "",
              completed: false,
            },
          ],
        };
      })
    );
  };

  const updateSet = (
    routineExerciseId: number,
    setId: string,
    field: "weight" | "reps",
    value: string
  ) => {
    setWorkoutExercises((currentExercises) =>
      currentExercises.map((exercise) => {
        if (exercise.routineExerciseId !== routineExerciseId) return exercise;

        return {
          ...exercise,
          sets: exercise.sets.map((set) =>
            set.id === setId ? { ...set, [field]: value } : set
          ),
        };
      })
    );
  };

  const toggleSetComplete = (routineExerciseId: number, setId: string) => {
    setWorkoutExercises((currentExercises) =>
      currentExercises.map((exercise) => {
        if (exercise.routineExerciseId !== routineExerciseId) return exercise;

        return {
          ...exercise,
          sets: exercise.sets.map((set) =>
            set.id === setId ? { ...set, completed: !set.completed } : set
          ),
        };
      })
    );
  };

  const cancelWorkout = () => {
    Alert.alert("Cancel Workout", "Are you sure you want to cancel?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes, Cancel",
        style: "destructive",
        onPress: () => router.replace("/routine-details" as any),
      },
    ]);
  };

    const finishWorkout = async () => {
    const completedSets = workoutExercises.flatMap((exercise) =>
        exercise.sets
        .filter((set) => set.completed)
        .map((set) => ({
            routineExerciseId: exercise.routineExerciseId,
            setNumber: set.setNumber,
            weight: set.weight,
            reps: set.reps,
        }))
    );

    if (completedSets.length === 0) {
        Alert.alert("No Sets Completed", "Complete at least one set first.");
        return;
    }

    try {
        const token = await AsyncStorage.getItem("token");

        await axios.post(
        `${API_URL}/workout-sessions/finish`,
        {
            routineId,
            duration_seconds: seconds,
            sets: completedSets,
        },
        {
            headers: {
            Authorization: `Bearer ${token}`,
            },
        }
        );

        Alert.alert("Workout Saved", "Workout saved successfully!", [
        {
            text: "OK",
            onPress: () =>
            router.replace({
                pathname: "/routine-details" as any,
                params: {
                id: String(routineId),
                name: String(routineName),
                },
            }),
        },
        ]);
    } catch (error: any) {
        console.log(
        "Finish workout error:",
        error?.response?.data || error.message
        );

        Alert.alert("Error", "Could not save workout");
    }
    };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.timer}>{formatTime(seconds)}</Text>

        <TouchableOpacity style={styles.finishButton} onPress={finishWorkout}>
          <Text style={styles.finishButtonText}>Finish</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>{routineName}</Text>
      <Text style={styles.notes}>Notes</Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        {workoutExercises.map((exercise) => (
          <View key={exercise.routineExerciseId} style={styles.exerciseBlock}>
            <Text style={styles.exerciseTitle}>{exercise.name}</Text>

            <View style={styles.tableHeader}>
              <Text style={[styles.headerText, styles.setColumn]}>Set</Text>
              <Text style={[styles.headerText, styles.inputColumn]}>kg</Text>
              <Text style={[styles.headerText, styles.inputColumn]}>Reps</Text>
              <Text style={[styles.headerText, styles.checkColumn]}>✓</Text>
            </View>

            <FlatList
              data={exercise.sets}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View style={styles.setRow}>
                  <Text style={[styles.setNumber, styles.setColumn]}>
                    {item.setNumber}
                  </Text>

                  <TextInput
                    style={[styles.setInput, styles.inputColumn]}
                    keyboardType="numeric"
                    value={item.weight}
                    onChangeText={(value) =>
                      updateSet(
                        exercise.routineExerciseId,
                        item.id,
                        "weight",
                        value
                      )
                    }
                    placeholder="0"
                  />

                  <TextInput
                    style={[styles.setInput, styles.inputColumn]}
                    keyboardType="numeric"
                    value={item.reps}
                    onChangeText={(value) =>
                      updateSet(
                        exercise.routineExerciseId,
                        item.id,
                        "reps",
                        value
                      )
                    }
                    placeholder="0"
                  />

                  <TouchableOpacity
                    style={[
                      styles.checkbox,
                      item.completed && styles.checkboxCompleted,
                    ]}
                    onPress={() =>
                      toggleSetComplete(exercise.routineExerciseId, item.id)
                    }
                  >
                    <Text style={styles.checkboxText}>
                      {item.completed ? "✓" : ""}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            />

            <TouchableOpacity
              style={styles.addSetButton}
              onPress={() => addSet(exercise.routineExerciseId)}
            >
              <Text style={styles.addSetText}>+ Add Set</Text>
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity style={styles.cancelButton} onPress={cancelWorkout}>
          <Text style={styles.cancelButtonText}>Cancel Workout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
    backgroundColor: "#fff",
    paddingTop: 55,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 28,
  },
  timer: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
  },
  finishButton: {
    backgroundColor: "#22c55e",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  finishButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#222",
  },
  notes: {
    color: "#aaa",
    marginTop: 6,
    marginBottom: 25,
    fontSize: 16,
  },
  exerciseBlock: {
    marginBottom: 30,
  },
  exerciseTitle: {
    color: "#1e90ff",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 12,
  },
  tableHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  headerText: {
    fontWeight: "800",
    color: "#444",
  },
  setRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 9,
  },
  setColumn: {
    width: 50,
  },
  inputColumn: {
    flex: 1,
    marginHorizontal: 5,
  },
  checkColumn: {
    width: 40,
    textAlign: "center",
  },
  setNumber: {
    fontSize: 16,
    fontWeight: "700",
    backgroundColor: "#f2f2f2",
    textAlign: "center",
    paddingVertical: 8,
    borderRadius: 10,
  },
  setInput: {
    backgroundColor: "#f5f5f7",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
  checkbox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f1f1f1",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 5,
  },
  checkboxCompleted: {
    backgroundColor: "#dff7e8",
  },
  checkboxText: {
    color: "#111",
    fontSize: 20,
    fontWeight: "900",
  },
  addSetButton: {
    backgroundColor: "#f4f4f6",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  addSetText: {
    fontWeight: "700",
    color: "#333",
  },
  cancelButton: {
    backgroundColor: "#ffe9e9",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 40,
  },
  cancelButtonText: {
    color: "#ff5a5f",
    fontSize: 16,
    fontWeight: "800",
  },
});