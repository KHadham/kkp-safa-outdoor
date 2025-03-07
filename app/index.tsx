import { Tabs, useRouter, useSegments } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  useColorScheme,
  View,
} from "react-native";

import { HapticTab } from "@/components/HapticTab";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { onAuthStateChanged } from "firebase/auth";
import IconSymbol from "@expo/vector-icons/MaterialCommunityIcons";
import { auth } from "@/firebaseConfig";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import { Image } from "expo-image";
import Animated, { FadeOut, ZoomIn, ZoomOut } from "react-native-reanimated";
import { Text } from "@/components";
import { spacing } from "@/constants/measure";
import dayjs from "dayjs";
import Toast from "react-native-toast-message";

export default function TabLayout() {
  const router = useRouter();

  useEffect(() => {
    // router.replace("/tabs");
    // const unsubscribe = onAuthStateChanged(auth, (user) => {
    //   if (user) {
    //     console.log("User logged in:", user.uid);
    //     router.replace("/tabs");
    //   } else {
    //     console.log("No user logged in, redirecting to login.");
    //     router.replace("/login");
    //   }
    // });
    // return () => unsubscribe();
  }, []);

  return (
    <Animated.View
      entering={ZoomIn.duration(200)}
      exiting={FadeOut.duration(200)}
      style={{
        justifyContent: "center",
        alignItems: "center",
        flex: 1,
      }}
    >
      <Image
        source={require("@/assets/images/splash.png")}
        style={{ width: "100%", height: "50%" }}
      />
      <View style={{ position: "absolute", bottom: spacing.lg }}>
        <Text>Memeriksa Authentikasi...</Text>
        <ActivityIndicator size={"large"} />
      </View>
      <Toast position="bottom" visibilityTime={2000} />
    </Animated.View>
  );
}

// import { Link } from "expo-router";
// import { Text, View } from "react-native";
// export default function Index() {
//   return (
//     <View
//       style={{
//         flex: 1,
//         justifyContent: "center",
//         alignItems: "center",
//       }}
//     >
//       <Link href={"/auth/login"}>
//         <Text>Open Modal</Text>
//       </Link>
//       <Link href={"/tabs"}>
//         <Text>Open Tabs</Text>
//       </Link>
//     </View>
//   );
// }
