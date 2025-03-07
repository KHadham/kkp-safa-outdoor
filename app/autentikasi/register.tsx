import React, { useRef, useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  useColorScheme,
} from "react-native";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { Button, Text } from "@/components";
import { useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { Colors } from "@/constants/Colors";
import Animated, {
  LinearTransition,
  SlideInRight,
  SlideOutRight,
} from "react-native-reanimated";
import { Image } from "expo-image";
import { auth } from "@/firebaseConfig";

const RegisterPage = () => {
  const colorScheme = useColorScheme();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setisLoading] = useState(false);

  const emailInputRef = useRef<TextInput>(null); // Reference for password input
  const passwordInputRef = useRef<TextInput>(null); // Reference for password input

  const handleLogin = async () => {
    setisLoading(true);
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;

        // Update displayName and photoURL
        updateProfile(user, {
          displayName: fullName,
        })
          .then(() => {
            Toast.show({
              type: "success",
              text1: "Berhasil Registrasi, Silahkan Login",
            });
            router.replace("/login");
          })
          .catch((error) => {
            Toast.show({
              type: "error",
              text1: error.message,
            });
          });
        Toast.show({
          type: "success",
          text1: "Berhasil Registrasi, Silahkan Login",
        });
        router.replace("/login");
      })
      .catch((error) => {
        Toast.show({
          type: "error",
          text1: error.message,
        });
        const errorCode = error.code;
        const errorMessage = error.message;
      })
      .finally(() => {
        setisLoading(false);
      });
  };

  return (
    <Animated.View
      layout={LinearTransition}
      entering={SlideInRight}
      exiting={SlideOutRight}
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme ?? "light"].background },
      ]}
    >
      <Image source={require("@/assets/images/icon.png")} style={styles.logo} />
      <Text style={styles.title}>Register</Text>
      <TextInput
        style={styles.input}
        placeholder="setFullName"
        value={fullName}
        onChangeText={setFullName}
        keyboardType="default"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="next" // Enables "Next" button on the keyboard
        onSubmitEditing={() => emailInputRef.current?.focus()} // Moves focus to password input
      />
      <TextInput
        ref={emailInputRef}
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
        onPress={() => router.back()}
      >
        Sudah punya Akun? Login
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

export default RegisterPage;
