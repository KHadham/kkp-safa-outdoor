import React, { useEffect } from "react";
import { View, TouchableOpacity, ViewStyle, StyleSheet } from "react-native";
import { getThemeColors, palette } from "@/constants/Colors";
import Text from "./Text";
import Icon from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { heightByScreen, widthByScreen } from "@/utils/dimension";

interface HeaderProps {
  title: string;
  subtitle?: string | string[] | number | null | undefined;
  icon?: keyof typeof Icon.glyphMap; // Name of the left icon
  onPress?: () => void; // Function for left icon click
  color?: string;
  isLoading?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  icon,
  onPress,
  color = "#92478A",
  isLoading,
}) => {
  const colors = getThemeColors();
  const animatedValue = useSharedValue(0);

  const containerStyle: ViewStyle = {
    // flexDirection: "row",
    // alignItems: "center",
    padding: 14,
    justifyContent: "space-between",
    borderRadius: 10,
    elevation: 5,
    backgroundColor: color,
    // opacity: 1,
    minWidth: widthByScreen(30),
    flex: 1,
    maxHeight: widthByScreen(20),
  };

  useEffect(() => {
    animatedValue.value = withRepeat(
      withTiming(1, { duration: 100 }), // Animate from 0 to 1 in 1 second
      -1, // Repeat indefinitely
      true // Reverse the animation
    );
  }, [animatedValue]);

  // Style that reacts to the animated value
  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: animatedValue.value, // Use the animated value for opacity as an example
    };
  });

  if (
    subtitle == null ||
    subtitle == undefined ||
    subtitle == "" ||
    subtitle == "null" ||
    subtitle == "undefined" ||
    subtitle == "-" ||
    subtitle == 0
  ) {
    return null;
  }
  return (
    <TouchableOpacity
      style={[containerStyle, animatedStyle]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={{ justifyContent: "space-between", flexDirection: "row" }}>
      <MaterialCommunityIcons color={"white"} name={icon} size={30} />
      <Text
        color={palette.white}
        fontWeight="bold"
        ellipsizeMode="tail"
        numberOfLines={1} // Add this line
      >
        {title}
      </Text>
      </View>
      <Text
      color={palette.white}
      position="right"
      isLoading={isLoading}
      ellipsizeMode="tail"
      numberOfLines={1} // Add this line
      >
      {subtitle}
      </Text>
    </TouchableOpacity>
  );
};

export default Header;
