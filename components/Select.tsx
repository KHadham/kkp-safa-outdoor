// import React, { useState } from "react";
// import {
//   ViewStyle,
//   TextStyle,
//   TouchableOpacity,
//   ActivityIndicator,
// } from "react-native";
// import { getThemeColors, palette } from "@/constants/Colors";
// import { corner, sizes, spacing } from "@/constants/measure";
// import Text from "./Text";
// import RNPickerSelect from "react-native-picker-select";

// interface AppProps {
//   title?: string;
//   disabled?: boolean;
//   type?: "outline" | "default" | "dashed";
//   isLoading?: boolean;
//   onPress?: () => void;
//   size?: "xs" | "sm" | "md" | "lg";
// }

// const Component: React.FC<AppProps> = ({
//   title,
//   disabled = false,
//   type = "default",
//   isLoading = false,
//   onPress,
//   size = "md",
// }) => {
//   const colors = getThemeColors();
//   const [selectedLanguage, setSelectedLanguage] = useState("");

//   const getButtonStyle = (): ViewStyle => {
//     const baseStyle: ViewStyle = {
//       justifyContent: "center",
//       alignItems: "center",
//       // height: 50,
//       padding: spacing[size],
//       paddingVertical: spacing[size] / 2,
//       borderRadius: corner.md,
//       borderWidth: 1,
//       borderColor: colors.primary,
//       backgroundColor: type === "default" ? colors.primary : "transparent",
//     };

//     if (disabled) {
//       baseStyle.backgroundColor = colors.disabled;
//       baseStyle.borderColor = colors.border;
//     }

//     if (type === "outline") {
//       baseStyle.backgroundColor = colors.background;
//     }

//     if (type === "dashed") {
//       baseStyle.borderStyle = "dashed";
//     }

//     return baseStyle;
//   };

//   const getTextStyle = (): TextStyle => ({
//     textAlign: "center",
//     color: type === "outline" ? colors.primary : colors.text_light,
//   });

//   return (
//     <TouchableOpacity
//       style={getButtonStyle()}
//       onPress={onPress}
//       disabled={disabled || isLoading}
//     >
//       <RNPickerSelect
//         style={{
//           viewContainer: { width: "20%", borderWidth: 1, position: "absolute" },
//         }}
//         onValueChange={(value) => console.log(value)}
//         items={[
//           { label: "Football", value: "football" },
//           { label: "Baseball", value: "baseball" },
//           { label: "Hockey", value: "hockey" },
//         ]}
//       />
//       {isLoading ? (
//         <ActivityIndicator color={colors.text_light} size={"large"} />
//       ) : (
//         <Text fontWeight="bold" style={getTextStyle()} size={size}>
//           {title}
//         </Text>
//       )}
//     </TouchableOpacity>
//   );
// };

// export default Component;
