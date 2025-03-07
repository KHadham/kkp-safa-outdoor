import React, { useEffect } from "react";
import {
  TextProps as RNTextProps,
  TextStyle,
  useColorScheme,
} from "react-native";
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
  useFonts,
} from "@expo-google-fonts/roboto";
import { sizes, spacingVal, spacing, corner } from "@/constants/measure";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  FadeIn,
  FadeOut,
  ReduceMotion,
} from "react-native-reanimated";
import { Colors } from "@/constants/Colors";

interface CustomTextProps extends RNTextProps {
  size?: keyof typeof sizes;
  margin?: keyof typeof spacingVal;
  padding?: keyof typeof spacingVal;
  color?: string;
  fontWeight?: "light" | "regular" | "medium" | "semiBold" | "bold" | "black";
  italic?: boolean;
  isLoading?: boolean;
  position?: "center" | "left" | "right";
  bordered?: boolean;
}

const fontMap = {
  light: "Roboto_300Light",
  regular: "Roboto_400Regular",
  medium: "Roboto_500Medium",
  semiBold: "Roboto_600SemiBold",
  bold: "Roboto_700Bold",
  black: "Roboto_900Black",
};

const Text: React.FC<CustomTextProps> = ({
  size = "sm",
  margin,
  padding,
  color = "",
  fontWeight = "regular",
  italic = false,
  style,
  children,
  isLoading = false,
  position = "left",
  bordered = false,
  ...rest
}) => {
  const colorScheme = useColorScheme();

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

  const opacity = useSharedValue(0.1);

  useEffect(() => {
    startAnimation(isLoading);
  }, [isLoading]);

  const startAnimation = (isLoading: boolean) => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 400 }),
      isLoading ? -1 : 0,
      true,
      () => {},
      ReduceMotion.System
    );
  };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (!fontsLoaded) {
    return null;
  }

  const fontFamily = fontMap[fontWeight] + (italic ? "Italic" : "");

  const combinedStyles: TextStyle = {
    fontSize: sizes[size],
    margin: margin ? spacing[margin] : undefined,
    padding: padding ? spacing[padding] : undefined,
    color: color !== "" ? color : Colors[colorScheme ?? "light"].text,
    fontFamily,
    textAlign: position,
  };
  const borderedStyles: TextStyle = {
    borderWidth: 2,
    borderRadius: corner.md,
    padding: spacing.xxs,
    borderColor: color !== "" ? color : Colors[colorScheme ?? "light"].border,
    backgroundColor: Colors[colorScheme ?? "light"].background,
  };

  // Loading Skeleton Render
  if (isLoading) {
    return (
      <Animated.View
        style={[
          {
            backgroundColor: Colors[colorScheme ?? "light"].disabled,
            borderRadius: 10,
            margin: 2,
            height: sizes[size],
            minWidth: sizes.xxl,
          },
          animatedStyle,
        ]}
      />
    );
  }

  // Normal Text Render
  return (
    <Animated.Text
      layout={FadeIn}
      style={[
        combinedStyles,
        style,
        italic && { fontStyle: "italic" },
        bordered && borderedStyles,
      ]}
      {...rest}
    >
      {children}
    </Animated.Text>
  );
};

export default Text;
