import React from "react";
import {
  ViewStyle,
  TextStyle,
  TouchableOpacity,
  ActivityIndicator,
  View,
  useColorScheme,
} from "react-native";
import { corner, sizes, spacing } from "@/constants/measure";
import Text from "./Text";
import Icon from "@expo/vector-icons/MaterialCommunityIcons";
import { Colors } from "@/constants/Colors";

interface AppProps {
  title?: string;
  subTitle?: string;
  disabled?: boolean;
  type?: "outline" | "default" | "dashed" | "shadow";
  isLoading?: boolean;
  onPress?: () => void;
  size?: "xs" | "sm" | "md" | "lg";
  icon?: keyof typeof Icon.glyphMap;
  event?: "error" | "success" | "warning" | "info";
  containerStyle?: ViewStyle;
}

const Component: React.FC<AppProps> = ({
  title,
  subTitle,
  disabled = false,
  type = "default",
  isLoading = false,
  onPress,
  size = "md",
  icon,
  event,
  containerStyle,
}) => {
  const colorScheme = useColorScheme();

  const eventStyles: Record<
    NonNullable<AppProps["event"]>,
    Partial<ViewStyle>
  > = {
    error: {
      backgroundColor: Colors[colorScheme ?? "light"].error,
    },
    success: {
      backgroundColor: Colors[colorScheme ?? "light"].success,
    },
    warning: {
      backgroundColor: Colors[colorScheme ?? "light"].warning,
    },
    info: {
      backgroundColor: Colors[colorScheme ?? "light"].info,
    },
  };

  const typeStyles: Record<
    NonNullable<AppProps["type"]>,
    Partial<ViewStyle>
  > = {
    default: {
      backgroundColor: Colors[colorScheme ?? "light"].primary,
    },
    outline: {
      backgroundColor: Colors[colorScheme ?? "light"].background,
      borderWidth: 1,
    },
    dashed: {
      borderStyle: "dashed",
    },
    shadow: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
      backgroundColor: Colors[colorScheme ?? "light"].background,
    },
  };

  const baseButtonStyle: ViewStyle = {
    ...typeStyles[type],
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing[size],
    paddingVertical: spacing[size] / 2,
    borderRadius: corner.md,
    borderColor: disabled
      ? Colors[colorScheme ?? "light"].border
      : Colors[colorScheme ?? "light"].primary,
    backgroundColor: disabled
      ? Colors[colorScheme ?? "light"].disabled
      : typeStyles[type].backgroundColor,
    // Merge specific type styles here
  };

  const textStyles: Record<
    NonNullable<AppProps["type"]>,
    Partial<TextStyle>
  > = {
    default: { color: Colors[colorScheme ?? "light"].text_light },
    outline: { color: Colors[colorScheme ?? "light"].primary },
    dashed: { color: Colors[colorScheme ?? "light"].primary },
    shadow: { color: Colors[colorScheme ?? "light"].text },
  };

  const baseTextStyle: TextStyle = {
    // Merge specific type styles here
    textAlign: "center",
    ...textStyles[type],
    color: disabled
      ? Colors[colorScheme ?? "light"].text_light
      : textStyles[type].color,
  };

  return (
    <TouchableOpacity
      style={[
        baseButtonStyle,
        event !== undefined && eventStyles[event],
        containerStyle,
      ]}
      onPress={onPress}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <ActivityIndicator color={baseTextStyle.color} size={"large"} />
      ) : (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            width: icon ? "100%" : "auto",
          }}
        >
          <View style={{ alignItems: "flex-start" }}>
            <Text fontWeight="bold" style={baseTextStyle} size={size}>
              {title}
            </Text>
            {subTitle && (
              <Text fontWeight="light" style={baseTextStyle} size={"xs"}>
                {subTitle}
              </Text>
            )}
          </View>
          {icon && (
            <Icon name={icon} size={sizes.lg} color={baseTextStyle.color} />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

export default Component;
