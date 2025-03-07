import { useState } from "react";
import { StyleSheet, TouchableOpacity, useColorScheme, View, ViewStyle } from "react-native";

import Animated, { LinearTransition } from "react-native-reanimated";
import Icon from "@expo/vector-icons/MaterialCommunityIcons";

interface AppProps {
  children?: React.ReactNode;
  colapsibleContent?: React.ReactNode;
  colapsiblePlaceholder?: React.ReactNode;
  colapsibleStyle?: ViewStyle;
  disabled?: boolean;
  type?: "outline" | "default" | "dashed" | "shadow";
  isLoading?: boolean;
  onPress?: () => void;
  size?: "xs" | "sm" | "md" | "lg";
  icon?: keyof typeof Icon.glyphMap;
  style?: ViewStyle;
}
import { Colors } from "@/constants/Colors";

const Component: React.FC<AppProps> = ({
  children,
  colapsibleContent,
  colapsiblePlaceholder = (
    <View
      style={{
        borderTopWidth: 1,
        justifyContent: "center",
        alignItems: "center",
        // borderColor: Colors.border,
      }}
    >
      <Icon name="chevron-down" size={18} weight="medium" />
    </View>
  ),
  style,
  colapsibleStyle,
  disabled = false,
  type = "default",
  isLoading = false,
  onPress,
  size = "md",
  icon,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const colorScheme = useColorScheme();

  return (
    <Animated.View layout={LinearTransition} style={style}>
      {children}
      <TouchableOpacity onPress={() => setIsOpen((value) => !value)}>
        {isOpen ? (
          <Animated.View style={colapsibleStyle} layout={LinearTransition}>
            {colapsibleContent}
          </Animated.View>
        ) : (
          colapsiblePlaceholder
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

export default Component;
