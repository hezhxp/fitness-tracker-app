import { useEffect } from "react";
import { View, Text } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

export default function IndexScreen() {
  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem("token");

      if (token) {
        router.replace("/home");
      } else {
        router.replace("/login");
      }
    };

    checkAuth();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Loading...</Text>
    </View>
  );
}