// import React, { useEffect, useState } from "react";
// import { ActivityIndicator, View, StyleSheet } from "react-native";
// import { Image } from "expo-image";
// import { fetch } from "react-native-ssl-pinning";
// import {
//   FasterImageView,
//   clearCache,
//   prefetch,
// } from "@candlefinance/faster-image";


// const SecureImage = () => {
//   const [imageSource, setImageSource] = useState("");
//   const [loading, setLoading] = useState(true);

// //   useEffect(() => {
// //     let isMounted = true;
// //     setLoading(true);

// //     const fetchImage = async () => {
// //       try {
// //         const response = await fetch(
// //           "https://uncletracking.pertamc.com/storage/files/1439/901459/676e84b48b8c0_1735296180_68A57257-7378-43EA-896C-F37698147920.jpg",
// //           {
// //             method: "GET",
// //             sslPinning: { certs: ["DigiCertCA2"] },
// //           }
// //         );
// //         const base64String = await response.text();
// //         console.log("Base64 String:", base64String);

// //         if (isMounted) {
// //           if (!base64String || base64String.trim() === "") {
// //             console.error("Received empty base64 data");
// //             setImageSource("https://placehold.co/400?text=Invalid Image");
// //           } else {
// //             setImageSource(`data:image/jpg;base64,${base64String}`);
// //           }
// //           setLoading(false);
// //         }
// //       } catch (error) {
// //         console.error("Image fetch failed:", error);
// //         if (isMounted) {
// //           setImageSource("https://placehold.co/400?text=Error Loading");
// //           setLoading(false);
// //         }
// //       }
// //     };

// //     fetchImage();
// //     return () => {
// //       isMounted = false;
// //     };
// //   }, []);

// //   if (loading) {
// //     return (
// //       <View style={styles.loadingContainer}>
// //         <ActivityIndicator size="large" color="#0000ff" />
// //       </View>
// //     );
// //   }

//   return (
//     <FasterImageView
//       source={{
//         url: "https://uncletracking.pertamc.com/storage/files/1439/901459/676e84b48b8c0_1735296180_68A57257-7378-43EA-896C-F37698147920.jpg",
//       }}
//       style={{ width: 70, height: 70, borderWidth: 1 }}
//       onError={(e) => console.log("Error rendering image:", e)}
//     />
//   );
// };

// const styles = StyleSheet.create({
//   loadingContainer: {
//     width: 70,
//     height: 70,
//   },
// });

// export default SecureImage;
