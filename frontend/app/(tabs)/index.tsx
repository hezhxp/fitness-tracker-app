import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
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

  useEffect(() => {
  const loadToken = async () => {
    const savedToken = await AsyncStorage.getItem("token");

      if (savedToken) {
        setToken(savedToken);
        console.log("Token loaded from storage");
      }
    };

    loadToken();
  }, []);

  const handleLogin = async () => {
    try {
      const response = await axios.post("http://192.168.0.8:5000/login", {
        email,
        password,
      });

      const token = response.data.token;
      const user = response.data.user;

        // "Save token to AsyncStorage"
      await AsyncStorage.setItem("token", token);
      setToken(token);
      setUserName(user.name);

      Alert.alert("Success", "Login successful");
    } catch (error: any) {
      Alert.alert(
        "Login Failed",
        error?.response?.data?.message || error.message || "Something went wrong"
      );
    }
  };

  const getProfile = async () => {
    try {
      const savedToken = await AsyncStorage.getItem("token");

      const res = await axios.get("http://192.168.0.8:5000/profile", {
        headers: {
          Authorization: `Bearer ${savedToken}`,
        },
      });

      console.log("Profile:", res.data);
      Alert.alert("Profile", res.data.user.name);
    } catch (err: any) {
      console.log(err?.response?.data || err.message);
      Alert.alert("Error", "Could not fetch profile");
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

      <TouchableOpacity style={styles.button} onPress={getProfile}>
        <Text style={styles.buttonText}>Get Profile</Text>
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