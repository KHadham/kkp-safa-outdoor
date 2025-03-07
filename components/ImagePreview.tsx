// import Header from "./Header";
// import { getThemeColors } from "@/constants/Colors";
// import React, { useEffect, useState } from "react";
// import {
//   Alert,
//   Modal,
//   StyleSheet,
//   Pressable,
//   View,
//   ModalProps,
//   useWindowDimensions,
//   LayoutChangeEvent,
// } from "react-native";
// import {
//   SafeAreaView,
//   SafeAreaProvider,
//   useSafeAreaInsets,
// } from "react-native-safe-area-context";
// import { corner, sizes, spacing } from "@/constants/measure";
// import { useFetch } from "@/hooks/useEmployee";
// import * as ImagePicker from "expo-image-picker";
// import { Image, ImageStyle } from "expo-image";
// import { widthByScreen } from "@/utils/dimension";
// import ImageViewer from "react-native-image-zoom-viewer";
// import Icon from "@expo/vector-icons/MaterialCommunityIcons";

// interface HeaderProps extends ModalProps {
//   url: string;
//   visible: boolean;
//   onClose?: () => void;
//   onConfirm?: (image: any) => void;
//   isLoading?: boolean;
//   eventMessage?: string;
// }

// const App: React.FC<HeaderProps> = ({
//   url,
//   visible,
//   onClose,
//   onConfirm,
//   isLoading,
//   eventMessage,
//   ...restProps
// }) => {
//   const color = getThemeColors();
//   const insets = useSafeAreaInsets();

//   return (
//     <Modal
//       animationType="slide"
//       transparent={true}
//       {...restProps}
//       visible={visible}
//     >
//       <Pressable
//         onPress={() => {
//           onClose?.();
//         }}
//         style={[
//           { backgroundColor: color.transparent },
//           StyleSheet.absoluteFill,
//         ]}
//       />
//       {(url !== undefined || url !== '') && (
//         <ImageViewer
//           failImageSource={{
//             url: "https://placehold.co/400?text=gagal-dimuat",
//           }}
//           useNativeDriver
//           onSwipeDown={onClose}
//           enableSwipeDown
//           renderHeader={() => (
//             <Header
//               title={"Tutup"}
//               wrapperStyle={[
//                 {
//                   position: "absolute",
//                   backgroundColor: "white",
//                   zIndex: 10,
//                 },
//                 insets.top !== 0 && { paddingTop: insets.top },
//               ]}
//               onLeftPress={onClose}
//               leftIcon="chevron-down"
//             />
//           )}
//           renderIndicator={() => {
//             return <View />;
//           }}
//           imageUrls={[{ url }]}
//         />
//       )}
//     </Modal>
//   );
// };

// export default App;
