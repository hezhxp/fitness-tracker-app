import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { router } from "expo-router";
const API_URL = process.env.EXPO_PUBLIC_API_URL;

export default function CreateRoutineScreen() {
  const [name, setName] = useState("");

  const handleCreateRoutine = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!name.trim()) {
        Alert.alert("Error", "Please enter a routine name");
        return;
      }

      await axios.post(
        `${API_URL}/routines`,
        { name },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Alert.alert("Success", "Routine created successfully");
      router.replace("/routines");
    } catch (error: any) {
      console.log("Create routine error:", error?.response?.data || error.message);
      Alert.alert(
        "Error",
        error?.response?.data?.message || "Could not create routine"
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Routine</Text>

      <TextInput
        style={styles.input}
        placeholder="Routine name e.g. Push Day"
        value={name}
        onChangeText={setName}
      />

      <TouchableOpacity style={styles.button} onPress={handleCreateRoutine}>
        <Text style={styles.buttonText}>Create Routine</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => router.replace("/home")}
      >
        <Text style={styles.secondaryButtonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 14,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#111",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  secondaryButton: {
    marginTop: 20,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#007AFF",
    fontSize: 14,
  },
});