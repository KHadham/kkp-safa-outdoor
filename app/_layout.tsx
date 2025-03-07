// import { useFonts } from "expo-font";
// import * as SplashScreen from "expo-splash-screen";
// import { useEffect } from "react";
// import {
//   Roboto_400Regular,
//   Roboto_500Medium,
//   Roboto_700Bold,
//   Roboto_900Black,
//   Roboto_300Light,
//   Roboto_100Thin,
//   Roboto_400Regular_Italic,
//   Roboto_500Medium_Italic,
//   Roboto_700Bold_Italic,
//   Roboto_900Black_Italic,
//   Roboto_300Light_Italic,
//   Roboto_100Thin_Italic,
// } from "@expo-google-fonts/roboto";
// export { ErrorBoundary } from "expo-router";
// import Toast from "react-native-toast-message";
// import { Slot, Stack } from "expo-router";
// import { SessionProvider } from "@/context/auth";
// import { corner, spacing } from "@/constants/measure";
// import { StyleSheet } from "react-native";
// import dayjs from "dayjs";
// import React from "react";

// const Layout = () => {
//   const [fontsLoaded] = useFonts({
//     Roboto_400Regular,
//     Roboto_500Medium,
//     Roboto_700Bold,
//     Roboto_900Black,
//     Roboto_300Light,
//     Roboto_100Thin,
//     Roboto_400Regular_Italic,
//     Roboto_500Medium_Italic,
//     Roboto_700Bold_Italic,
//     Roboto_900Black_Italic,
//     Roboto_300Light_Italic,
//     Roboto_100Thin_Italic,
//   });

//   useEffect(() => {
//     if (fontsLoaded) {
//       SplashScreen.hideAsync();
//     }
//   }, [fontsLoaded]);

//   if (!fontsLoaded) {
//     return null;
//   }

//   return (
//     <>
//       <Stack screenOptions={{ headerShown: false, statusBarHidden: true }}>
//         <Stack.Screen name="index" />
//       </Stack>
//       <Toast position="bottom" visibilityTime={2000} />
//     </>
//   );
// };

// export default Layout;

import { useFonts } from "expo-font";
import { router, SplashScreen, Stack } from "expo-router";
import {
  Roboto_400Regular,
  Roboto_500Medium,
  Roboto_700Bold,
  Roboto_900Black,
  Roboto_300Light,
  Roboto_100Thin,
  Roboto_400Regular_Italic,
  Roboto_500Medium_Italic,
  Roboto_700Bold_Italic,
  Roboto_900Black_Italic,
  Roboto_300Light_Italic,
  Roboto_100Thin_Italic,
} from "@expo-google-fonts/roboto";
import React, { useEffect } from "react";
import Toast from "react-native-toast-message";
import { auth } from "@/firebaseConfig";
import { onAuthStateChanged } from "@firebase/auth";
import dayjs from "dayjs";
require("dayjs/locale/id");
dayjs.locale("id");

const Layout = () => {
  const [fontsLoaded] = useFonts({
    Roboto_400Regular,
    Roboto_500Medium,
    Roboto_700Bold,
    Roboto_900Black,
    Roboto_300Light,
    Roboto_100Thin,
    Roboto_400Regular_Italic,
    Roboto_500Medium_Italic,
    Roboto_700Bold_Italic,
    Roboto_900Black_Italic,
    Roboto_300Light_Italic,
    Roboto_100Thin_Italic,
  });

  useEffect(() => {
    dayjs.locale("id");

    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("User logged in:", user.uid);
        router.replace("/tabs");
      } else {
        console.log("No user logged in, redirecting to login.");
        router.replace("/login");
      }
    });

    return () => unsubscribe();
  }, [fontsLoaded]);
  if (!fontsLoaded) {
    return null;
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="autentikasi/login" />
        <Stack.Screen name="autentikasi/register" />
      </Stack>
      <Toast position="bottom" visibilityTime={2000} />
    </>
  );
};

export default Layout;
