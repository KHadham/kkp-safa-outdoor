// import React from "react";
// import { StyleSheet, View, FlatListProps } from "react-native";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import Modal, { ModalProps } from "react-native-modal";
// import Animated, { FadingTransition } from "react-native-reanimated";
// import Text from "./Text";
// import { getThemeColors } from "@/constants/Colors";
// import { corner, spacing } from "@/constants/measure";
// import Header from "./Header";
// import { useRouter } from "expo-router";

// interface AppProps<ItemT> extends Partial<ModalProps> {
//   isVisible: boolean;
//   onClose?: () => void;
//   title?: string;
//   data: ItemT[];
//   onSuccess?: () => void;
//   renderItem?: (item: { item: ItemT; index: number }) => JSX.Element;
// }

// const App = <ItemT,>({
//   isVisible = false,
//   onClose,
//   title = "Default Title",
//   data,
//   onSuccess,
//   renderItem,
//   ...restProps
// }: AppProps<ItemT>) => {
//   const colors = getThemeColors();
//   const insets = useSafeAreaInsets();
//   const router = useRouter();

//   // Default Render Item
//   const defaultRenderItem = ({ item }: { item: ItemT }) => (
//     <Text>{`${item}`}</Text>
//   );

//   return (
//     <Modal
//       isVisible={isVisible}
//       {...restProps}
//       onBackButtonPress={onClose}
//       onBackdropPress={onClose}
//       style={styles.modal}
//     >
//       <View
//         style={[
//           styles.modalContent,
//           {
//             paddingVertical: insets.bottom === 0 ? spacing.md : insets.bottom,
//           },
//         ]}
//       >
//         <Header
//           title={"Termin"}
//           subtitle="Pilih Project Period"
//           canGoBack={false}
//         />
//         <Animated.FlatList
//           layout={FadingTransition}
//           contentContainerStyle={{
//             gap: spacing.xs,
//             paddingHorizontal: insets.left === 0 ? spacing.md : insets.left,
//           }}
//           data={data}
//           renderItem={renderItem || defaultRenderItem}
//         />
//         {/* Optional button for "onSuccess" */}
//         {/* <Button title="Confirm" onPress={onSuccess} /> */}
//       </View>
//     </Modal>
//   );
// };

// const styles = StyleSheet.create({
//   modal: {
//     justifyContent: "flex-end",
//     margin: 0,
//   },
//   modalContent: {
//     backgroundColor: "white",
//     borderTopLeftRadius: corner.lg,
//     borderTopRightRadius: corner.lg,
//     width: "100%",
//     gap: spacing.md,
//   },
// });

// export default App;
