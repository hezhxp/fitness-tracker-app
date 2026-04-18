import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import axios from "axios";

export default function HomeScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [userName, setUserName] = useState("");

  const handleLogin = async () => {
    try {
      const response = await axios.post("http://192.168.0.18:5000/login", {
        email,
        password,
      });

      setToken(response.data.token);
      setUserName(response.data.user.name);

      Alert.alert("Success", "Login successful");
      console.log("Login response:", response.data);
    } catch (error: any) {
      console.log("Login error:", error?.response?.data || error.message);

      Alert.alert(
        "Login Failed",
        error?.response?.data?.message || "Something went wrong"
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Fitness App Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Enter password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      {userName ? (
        <Text style={styles.successText}>Welcome, {userName}</Text>
      ) : null}

      {token ? (
        <Text style={styles.tokenText}>
          Token received successfully
        </Text>
      ) : null}
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
  successText: {
    marginTop: 20,
    fontSize: 18,
    textAlign: "center",
  },
  tokenText: {
    marginTop: 10,
    fontSize: 14,
    textAlign: "center",
    color: "green",
  },
});