import React, { useRef, useState } from "react";
import {
  TextInput,
  StyleSheet,
  useColorScheme,
} from "react-native";
import { auth } from "@/firebaseConfig";
import { Button, Text } from "@/components";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { Colors } from "@/constants/Colors";
import { Image } from "expo-image";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
} from "react-native-reanimated";
import { signInWithEmailAndPassword } from "firebase/auth";

const LoginPage = () => {

  const router = useRouter();
  const colorScheme = useColorScheme();
  const [isLoading, setisLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const passwordInputRef = useRef<TextInput>(null); // Reference for password input

  const handleLogin = async () => {
    setisLoading(true);

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential;
        console.log("user", user);
        router.replace("/tabs");
      })
      .catch((error) => {
        console.log("error", error);
        Toast.show({
          type: "error",
          text1: error.message,
        });
      })
      .finally(() => {
        setisLoading(false);
      });
  };

  return (
    <Animated.View
      layout={LinearTransition}
      entering={FadeIn}
      exiting={FadeOut}
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme ?? "light"].background },
      ]}
    >
      <Image source={require("@/assets/images/icon.png")} style={styles.logo} />
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="next" // Enables "Next" button on the keyboard
        onSubmitEditing={() => passwordInputRef.current?.focus()} // Moves focus to password input
      />
      <TextInput
        ref={passwordInputRef} // Assign reference to password input
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="done" // Enables "Done" button on the keyboard
        onSubmitEditing={handleLogin} // Submits the form on pressing "Done"
      />
      <Button
        containerStyle={styles.button}
        title="Submit"
        onPress={handleLogin}
        isLoading={isLoading}
      />
      <Text
        style={{ textDecorationLine: "underline" }}
        onPress={() => router.navigate("/register")}
      >
        Belum punya Akun? Register
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  logo: {
    width: 200,
    height: 200,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
  },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  button: {
    width: "100%",
    height: 50,
    backgroundColor: "#007BFF",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default LoginPage;
