import { Text, View, Button } from "react-native";
import axios from "axios";

export default function App() {
  const testApi = async () => {
    try {
      const res = await axios.get("http://192.168.0.18:5000/");
      console.log(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Fitness App</Text>
      <Button title="Test API" onPress={testApi} />
    </View>
  );
}