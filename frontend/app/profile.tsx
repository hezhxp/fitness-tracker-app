import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
const API_URL = process.env.EXPO_PUBLIC_API_URL;
import { router } from "expo-router";

type UserProfile = {
  id: number;
  name: string;
  email: string;
  age?: number | null;
  weight?: number | null;
  height?: number | null;
  goal?: string | null;
  activity_level?: string | null;
  created_at?: string;
};

export default function ProfileScreen() {
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const getProfile = async () => {
      try {
        const token = await AsyncStorage.getItem("token");

        const res = await axios.get(`${API_URL}/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(res.data.user);
      } catch (error: any) {
        console.log("Profile error:", error?.response?.data || error.message);
        Alert.alert("Error", "Could not load profile");
      }
    };

    getProfile();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      {user ? (
        <View style={styles.card}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>{user.name}</Text>

          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user.email}</Text>

          <Text style={styles.label}>User ID</Text>
          <Text style={styles.value}>{user.id}</Text>

          <Text style={styles.label}>Age</Text>
          <Text style={styles.value}>{user.age ?? "Not set"}</Text>

          <Text style={styles.label}>Weight</Text>
          <Text style={styles.value}>
            {user.weight !== null && user.weight !== undefined ? `${user.weight} kg` : "Not set"}
          </Text>

          <Text style={styles.label}>Height</Text>
          <Text style={styles.value}>
            {user.height !== null && user.height !== undefined ? `${user.height} cm` : "Not set"}
          </Text>

          <Text style={styles.label}>Goal</Text>
          <Text style={styles.value}>{user.goal || "Not set"}</Text>

          <Text style={styles.label}>Activity Level</Text>
          <Text style={styles.value}>{user.activity_level || "Not set"}</Text>

          <Text style={styles.label}>Account Created</Text>
          <Text style={styles.value}>
            {user.created_at
              ? new Date(user.created_at).toLocaleDateString()
              : "N/A"}
          </Text>
        </View>
      ) : (
        <Text style={styles.loadingText}>Loading profile...</Text>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/edit-profile")}
      >
        <Text style={styles.buttonText}>Edit Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.replace("/home")}
      >
        <Text style={styles.buttonText}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f7f7",
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 25,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  label: {
    fontSize: 14,
    color: "#777",
    marginTop: 10,
  },
  value: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111",
    marginTop: 4,
  },
  loadingText: {
    textAlign: "center",
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#111",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});