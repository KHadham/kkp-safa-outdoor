// import Button from "./Button";
// import Inputs from "./Input";
// import Text from "./Text";
// import { getThemeColors } from "@/constants/Colors";
// import { useSession } from "@/context/auth";
// import { shadowGenerator } from "@/utils/uiHandler";
// import React, { useEffect, useState } from "react";
// import { StyleSheet, Pressable, View, TouchableOpacity } from "react-native";
// import {
//   SafeAreaView,
//   SafeAreaProvider,
//   useSafeAreaInsets,
// } from "react-native-safe-area-context";
// import { corner, sizes, spacing } from "@/constants/measure";
// import { useFetch } from "@/hooks/useEmployee";
// import Modal, { ModalProps } from "react-native-modal";
// import Icon from "@expo/vector-icons/MaterialCommunityIcons";
// import Animated, { FadeIn, FadeInDown, FadeInUp, LinearTransition,FadingTransition } from "react-native-reanimated";
// import { useDelayedTermin } from "@/hooks/useDelayedTermin";

// interface HeaderProps extends Partial<ModalProps> {
//   isVisible: boolean;
//   onClose?: () => void;
//   project_id: number | string | undefined;
//   termin_id: number | string | undefined;
//   onSuccess?: () => void;
// }

// const selection = [
//   "Pejabat berwenang tidak ditempat",
//   "Budget Exceeded",
//   "Proses Addendum",
//   "Terkendala PO",
//   "Lainnya",
// ];

// const App: React.FC<HeaderProps> = ({
//   isVisible = false,
//   onClose,
//   project_id,
//   termin_id,
//   onSuccess,
//   ...restProps
// }) => {
//   const color = getThemeColors();
//   const insets = useSafeAreaInsets();
//   const { doSubmitDelayed, errorDelayed, isLoadingDelayed, successDelayed } =
//     useDelayedTermin();

//   const [selected, setselected] = useState("");
//   const [other, setother] = useState("");

//   useEffect(() => {
//     if (successDelayed !== "" && successDelayed !== null) {
//       setTimeout(() => {
//         onClose?.();
//         onSuccess?.();
//       }, 2000);
//     }
//   }, [successDelayed]);

//   return (
//     <Modal
//       isVisible={isVisible}
//       {...restProps}
//       onBackButtonPress={onClose}
//       onBackdropPress={onClose}
//       style={styles.modal}
//       avoidKeyboard
//       // animationIn={'slideIn'}
//     >
//       <Animated.View
//         layout={LinearTransition}
//         style={[
//           styles.modalContent,
//           {
//             paddingVertical: insets.bottom === 0 ? spacing.md : insets.bottom,
//             paddingHorizontal: insets.left === 0 ? spacing.md : insets.left,
//           },
//         ]}
//       >
//         {successDelayed ? (
//           <Text fontWeight="bold" size="md" position="center">
//             Berhasil Mengirim Alasan Keterlambatan
//           </Text>
//         ) : (
//           <>
//             <Text fontWeight="bold" size="md">
//               Pilih Alasan Keterlambatan
//             </Text>
//             <Animated.FlatList
//               layout={LinearTransition}
//               contentContainerStyle={{ gap: spacing.xs }}
//               data={selection}
//               renderItem={({ item }) => (
//                 <TouchableOpacity
//                   onPress={() => setselected(item)}
//                   style={{
//                     flexDirection: "row",
//                     alignItems: "center",
//                     borderWidth: 1,
//                     padding: spacing.xs,
//                     borderRadius: corner.md,
//                     borderColor:
//                       item === selected ? color.success : color.border,
//                     backgroundColor:
//                       item === selected ? color.success_bg : color.background,
//                     gap: spacing.xs,
//                   }}
//                 >
//                   <Icon
//                     name={
//                       item === selected
//                         ? "checkbox-marked-outline"
//                         : "checkbox-blank-outline"
//                     }
//                     size={sizes.lg}
//                   />
//                   <Text size="sm">{item}</Text>
//                 </TouchableOpacity>
//               )}
//             />
//             {selected == "Lainnya" && (
//               <Inputs
//                 value={other}
//                 onChangeText={(txt) => setother(txt)}
//                 placeholder="Alasan Lainnya"
//                 errorMessage={errorDelayed}
//               />
//             )}
//             <Animated.View
//               layout={LinearTransition}
//               style={{
//                 flexDirection: "row",
//                 gap: spacing.sm,
//               }}
//             >
//               <Button
//                 disabled={isLoadingDelayed}
//                 event="error"
//                 title="Batal"
//                 onPress={() => {
//                   onClose?.();
//                 }}
//                 containerStyle={{ flex: 1 }}
//               />
//               <Button
//                 isLoading={isLoadingDelayed}
//                 title="Kirim"
//                 event="success"
//                 onPress={() => {
//                   doSubmitDelayed({
//                     id: termin_id,
//                     late: selected,
//                     project_id: project_id,
//                     late_other: other,
//                   });
//                 }}
//                 containerStyle={{ flex: 1 }}
//               />
//             </Animated.View>
//           </>
//         )}
//       </Animated.View>
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
//     // padding: 20,
//     borderTopLeftRadius: corner.lg,
//     borderTopRightRadius: corner.lg,
//     width: "100%",
//     gap: spacing.md,
//   },
// });

// export default App;
