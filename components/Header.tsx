import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  TextInput,
  ViewStyle,
  TextStyle,
  Platform,
  UIManager,
  ViewProps,
  StyleProp,
  useColorScheme,
} from "react-native";
import {} from "@/constants/Colors";
import Text from "./Text";
import Icon from "@expo/vector-icons/MaterialCommunityIcons"; // Replace with your icon library
import { sizes, spacing } from "@/constants/measure";
import { shadowGenerator } from "@/utils/uiHandler";
import Input from "./Input";
import { widthByScreen } from "@/utils/dimension";
import { useRouter } from "expo-router"; // Import useRouter for navigation
import Animated, {
  LinearTransition,
  SlideInLeft,
} from "react-native-reanimated";
import { Colors } from "@/constants/Colors";

interface HeaderProps extends ViewProps {
  title: string | string[] | undefined;
  subtitle?: string | null | boolean;
  leftIcon?: keyof typeof Icon.glyphMap; // Name of the left icon
  rightIcon?: keyof typeof Icon.glyphMap; // Name of the right icon
  onLeftPress?: () => void; // Function for left icon click
  onRightPress?: () => void; // Function for right icon click
  onSearch?: (text: string) => void; // Function for search input
  labelPosition?: "left" | "right" | "center";
  footer?: React.ReactNode;
  customRightComponent?: React.ReactNode;
  customLeftComponent?: React.ReactNode;
  canGoBack?: boolean;
  isLoading?: boolean;
  wrapperStyle?: StyleProp<ViewStyle> | undefined;
  subtitleColor?: string;
}

const Header: React.FC<HeaderProps> = (
  {
    title,
    subtitle,
    leftIcon,
    rightIcon,
    onLeftPress,
    onRightPress,
    onSearch,
    labelPosition = "left",
    footer,
    customRightComponent,
    customLeftComponent,
    canGoBack = true,
    wrapperStyle,
    isLoading,
    subtitleColor,
  },
  ...restProps
) => {
  const router = useRouter(); // Initialize the router
  const colorScheme = useColorScheme();

  const [modalSetting, setmodalSetting] = useState(false); // Toggle search input
  const [isSearching, setIsSearching] = useState(false); // Toggle search input
  const [searchText, setSearchText] = useState(""); // Track search input

  // Enable LayoutAnimation on Android
  if (
    Platform.OS === "android" &&
    UIManager.setLayoutAnimationEnabledExperimental
  ) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }

  const handleLeftPress = () => {
    if (onLeftPress) {
      onLeftPress();
    } else if (canGoBack) {
      router.back(); // Use router to navigate back
    }
  };

  const handleRightPress = () => {
    if (onSearch) {
      // LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); // Animate the layout change
      setIsSearching(!isSearching); // Toggle search input
      if (isSearching) {
        setSearchText("");
        onSearch?.("");
      } // Clear search text when closing
    } else if (rightIcon == "menu") {
      setmodalSetting(true);
    } else if (onRightPress) {
      onRightPress();
    }
  };

  const containerStyle: ViewStyle = {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: Colors[colorScheme ?? "light"].background,
    ...shadowGenerator(5),
    gap: spacing.xs,
    // marginVertical: isSearching ? -spacing.sm : 0,
    width: widthByScreen(100),
    borderWidth: 1,
    borderColor: Colors[colorScheme ?? "light"].background,
  };

  const textContainerStyle: ViewStyle = {
    flex: 1,
    justifyContent: "center",
    marginVertical: -spacing.md,
  };

  const iconStyle: ViewStyle = {
    // padding: spacing.xs,
  };

  return (
    <>
      <Animated.View
        layout={LinearTransition}
        style={[containerStyle, wrapperStyle]}
        {...restProps}
      >
        {(labelPosition == "center" ||
          labelPosition == "right" ||
          canGoBack ||
          leftIcon) &&
          (customLeftComponent || (
            <Animated.View layout={LinearTransition}>
              <TouchableOpacity onPress={handleLeftPress} style={iconStyle}>
                <Icon
                  name={
                    leftIcon !== undefined
                      ? leftIcon
                      : canGoBack
                      ? "chevron-left"
                      : "square"
                  }
                  size={sizes.lg}
                  color={
                    leftIcon || canGoBack ? Colors[colorScheme ?? "light"].primary : Colors[colorScheme ?? "light"].background
                  }
                />
              </TouchableOpacity>
            </Animated.View>
          ))}
        {isSearching ? (
          <Animated.View layout={LinearTransition} style={{ flex: 1 }}>
            <Input
              placeholder="Masukan pencarian..."
              placeholderTextColor={Colors[colorScheme ?? "light"].text}
              value={searchText}
              onChangeText={(text) => {
                setSearchText(text);
                // if (onSearch) onSearch(text); // Call search handler
              }}
              onSubmitEditing={() => onSearch?.(searchText)}
              onClear={() => onSearch?.("")}
            />
          </Animated.View>
        ) : (
          <Animated.View layout={LinearTransition} style={textContainerStyle}>
            <Text
            size="md"
              isLoading={isLoading}
              fontWeight="bold"
              position={labelPosition}
              style={{ color: Colors[colorScheme ?? "light"].text }}
            >
              {title}
            </Text>
            {subtitle && (
              <Text
                isLoading={isLoading}
                position={labelPosition}
                size="sm"
                style={{ color: subtitleColor ?? Colors[colorScheme ?? "light"].text }}
              >
                {subtitle}
              </Text>
            )}
          </Animated.View>
        )}
        {(labelPosition == "center" ||
          labelPosition == "left" ||
          onSearch !== undefined) &&
          (customRightComponent || (
            <TouchableOpacity onPress={handleRightPress} style={iconStyle}>
              <Icon
                name={
                  onSearch
                    ? "magnify"
                    : rightIcon !== undefined
                    ? rightIcon
                    : "square"
                }
                size={sizes.lg}
                color={
                  rightIcon || onSearch !== undefined
                    ? Colors[colorScheme ?? "light"].primary
                    : Colors[colorScheme ?? "light"].background
                }
              />
            </TouchableOpacity>
          ))}
      </Animated.View>
      {footer}
    </>
  );
};

export default Header;
