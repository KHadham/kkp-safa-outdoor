// import Button from "./Button";
// import Text from "./Text";
// import { getThemeColors } from "@/constants/Colors";
// import { useSession } from "@/context/auth";
// import { shadowGenerator } from "@/utils/uiHandler";
// import React, { useEffect, useState } from "react";
// import {
//   Alert,
//   Modal,
//   StyleSheet,
//   Pressable,
//   View,
//   ModalProps,
// } from "react-native";
// import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
// import { spacing } from "@/constants/measure";
// import { useFetch } from "@/hooks/useEmployee";
// import { useLogout } from "@/hooks/useLogout";

// interface HeaderProps extends ModalProps {
//   title: string;
//   onClose?: () => void;
// }

// const App: React.FC<HeaderProps> = ({ title, onClose, ...restProps }) => {
//   const color = getThemeColors();
//   //   const [modalVisible, setModalVisible] = useState(false);
//   const { data } = useFetch();
//   const { doLogout, isLoading, error } = useLogout();

//   return (
//     <SafeAreaProvider>
//       <SafeAreaView style={styles.centeredView}>
//         <Modal animationType="slide" transparent={true} {...restProps}>
//           <View style={styles.centeredView}>
//             <Pressable
//               onPress={() => onClose?.()}
//               style={[
//                 { backgroundColor: color.transparent },
//                 StyleSheet.absoluteFill,
//               ]}
//             />
//             <View style={styles.modalView}>
//               <Text style={styles.modalText} fontWeight="bold">
//                 Halo, {data?.data?.full_name}
//               </Text>
//               <Text style={styles.modalText}>Mau Logout ?</Text>
//               <Button
//                 isLoading={isLoading}
//                 title="Logout"
//                 icon="logout"
//                 type="outline"
//                 onPress={() => {
//                   doLogout();
//                 }}
//               />
//             </View>
//           </View>
//         </Modal>
//       </SafeAreaView>
//     </SafeAreaProvider>
//   );
// };

// const styles = StyleSheet.create({
//   centeredView: {
//     flex: 1,
//     justifyContent: "flex-end",
//     alignItems: "center",
//   },
//   modalView: {
//     backgroundColor: "white",
//     width: "100%",
//     padding: spacing.md,
//     gap: spacing.md,
//     // alignItems: "center",
//     ...shadowGenerator(6),
//   },
//   button: {
//     borderRadius: 20,
//     padding: 10,
//     elevation: 2,
//   },
//   buttonOpen: {
//     backgroundColor: "#F194FF",
//   },
//   buttonClose: {
//     backgroundColor: "#2196F3",
//   },
//   textStyle: {
//     color: "white",
//     fontWeight: "bold",
//     textAlign: "center",
//   },
//   modalText: {
//     marginBottom: 15,
//   },
// });

// export default App;
