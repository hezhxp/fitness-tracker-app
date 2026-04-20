import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function HomeScreen() {
  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    router.replace("/login");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/profile")}
      >
        <Text style={styles.buttonText}>Go to Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
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
});