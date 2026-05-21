import { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { router, useLocalSearchParams } from "expo-router";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

type LibraryExercise = {
  id: number;
  name: string;
  muscle_group: string | null;
  equipment: string | null;
};

export default function AddRoutineExercisesScreen() {
  const { id, name } = useLocalSearchParams();

  const [library, setLibrary] = useState<LibraryExercise[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const getExerciseLibrary = async () => {
      try {
        const token = await AsyncStorage.getItem("token");

        const res = await axios.get(`${API_URL}/exercises`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setLibrary(res.data.exercises);
      } catch (error: any) {
        console.log("Get library error:", error?.response?.data || error.message);
        Alert.alert("Error", "Could not load exercise library");
      }
    };

    getExerciseLibrary();
  }, []);

  const toggleSelect = (exerciseId: number) => {
    setSelectedIds((current) =>
      current.includes(exerciseId)
        ? current.filter((id) => id !== exerciseId)
        : [...current, exerciseId]
    );
  };

  const addSelectedExercises = async () => {
    if (selectedIds.length === 0) {
      Alert.alert("Error", "Please select at least one exercise");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("token");

      const selectedExercises = library.filter((exercise) =>
        selectedIds.includes(exercise.id)
      );

      for (let i = 0; i < selectedExercises.length; i++) {
        await axios.post(
          `${API_URL}/routines/${id}/exercises`,
          {
            name: selectedExercises[i].name,
            exercise_order: i + 1,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      Alert.alert("Success", "Exercises added to routine");

      router.replace({
        pathname: "/routine-details" as any,
        params: { id: String(id), name: String(name) },
      });
    } catch (error: any) {
      console.log("Add selected exercises error:", error?.response?.data || error.message);
      Alert.alert("Error", "Could not add selected exercises");
    }
  };

  const filteredLibrary = library.filter((exercise) =>
    exercise.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Exercises</Text>
      <Text style={styles.subtitle}>{name}</Text>

      <TextInput
        style={styles.input}
        placeholder="Search exercises..."
        value={search}
        onChangeText={setSearch}
      />

      <Text style={styles.selectedText}>
        Selected: {selectedIds.length}
      </Text>

      <FlatList
        data={filteredLibrary}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No exercises found.</Text>
        }
        renderItem={({ item }) => {
          const isSelected = selectedIds.includes(item.id);

          return (
            <TouchableOpacity
              style={[styles.card, isSelected && styles.selectedCard]}
              onPress={() => toggleSelect(item.id)}
            >
              <Text style={styles.exerciseName}>{item.name}</Text>
              <Text style={styles.metaText}>
                {item.muscle_group || "Unknown"} • {item.equipment || "Unknown"}
              </Text>
              <Text style={styles.selectText}>
                {isSelected ? "Selected" : "Tap to select"}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      <TouchableOpacity style={styles.button} onPress={addSelectedExercises}>
        <Text style={styles.buttonText}>Add Selected Exercises</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() =>
          router.replace({
            pathname: "/routine-details" as any,
            params: { id: String(id), name: String(name) },
          })
        }
      >
        <Text style={styles.secondaryButtonText}>Cancel</Text>
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
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    fontSize: 16,
  },
  selectedText: {
    marginBottom: 10,
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
    marginBottom: 10,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: "#007AFF",
    backgroundColor: "#EAF3FF",
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: "700",
  },
  metaText: {
    color: "#777",
    marginTop: 4,
  },
  selectText: {
    marginTop: 8,
    color: "#007AFF",
    fontWeight: "600",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 30,
    color: "#777",
    fontSize: 16,
  },
  button: {
    backgroundColor: "#111",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  secondaryButton: {
    marginTop: 15,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#007AFF",
    fontSize: 14,
  },
});