import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  FlatList,
  Touchable,
  TouchableOpacity,
  useColorScheme,
  Linking,
  Alert,
  ActivityIndicator,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Button, Header, ImagePicker, Input, Text } from "@/components";
import EnhancedImageViewing from "react-native-image-viewing";
import { Image } from "expo-image";
import { corner, sizes, spacing } from "@/constants/measure";
import dayjs from "dayjs";
import { formatRupiah, hasChanges } from "@/utils";
import { Colors } from "@/constants/Colors";
import {
  deleteDoc,
  doc,
  getDoc,
  getFirestore,
  setDoc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { app, auth } from "@/firebaseConfig";
import Toast from "react-native-toast-message";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
} from "react-native-reanimated";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  deleteObject,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes,
} from "firebase/storage";
import { heightByScreen, widthByScreen } from "@/utils/dimension";

export default function CustomerDetail() {
  const db = getFirestore(app);
  const storage = getStorage(app);

  const colorScheme = useColorScheme();
  const { details } = useLocalSearchParams();
  const parsedDetails: RentalHistory = JSON.parse(details as string);

  const [selectedImageKey, setSelectedImageKey] = useState<number | null>(null);
  const [visibleIndex, setIsVisibleIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [Data, setData] = useState<RentalHistory | null>(null);

  const [originalData, setOriginalData] = useState<any>(null); // Store the original data for comparison
  const [images, setImages] = useState<any>([]);

  useEffect(() => {
    setIsLoading(true);
    setData(parsedDetails);
    // setImages(parsedImage);
    setOriginalData(parsedDetails);
    setIsLoading(false);
  }, []);

  const cancelRental = async () => {
    if (Data?.id == undefined) return;
    setIsLoading(true);
    try {
      const rentRef = doc(db, "rentals", Data?.id);
      const rentDoc = await getDoc(rentRef);
      if (rentDoc.exists()) {
        await updateDoc(rentRef, {
          updatedAt: Timestamp.now(),
          updatedBy: auth?.currentUser?.displayName,
          updatedById: auth?.currentUser?.uid,
          status: "batal",
        });
      } else {
        console.error("Rental Ref not found:");
      }

      const custRef = doc(db, "customers", Data?.customerId);
      const custDoc = await getDoc(custRef);
      if (custDoc.exists()) {
        await updateDoc(custRef, {
          rentCount: Number(custDoc.data()?.rentCount) - 1,
          rentStatus: false,
          rentIncome:
            Number(custDoc.data()?.rentIncome) - Number(Data?.rentNominal),
        });
      } else {
        console.error("Customer Ref not found:");
      }

      // Update all tools sequentially
      for (const item of Data?.items) {
        const toolRef = doc(db, "tools", item.toolId);
        const toolDoc = await getDoc(toolRef);
        if (toolDoc.exists()) {
          await updateDoc(toolRef, {
            toolsAvailability: true,
            rentCount: toolDoc.data()?.rentCount - 1,
            rentProfit: toolDoc.data()?.rentProfit - item?.totalPrice,
          });
        } else {
          console.error("Tool not found:", item.toolId);
        }
      }

      // Show success message only after all updates are complete
      Toast.show({
        type: "success",
        text1: "Berhasil membatalkan sewa",
      });

      // Only navigate after all updates are successful
      router.back();
    } catch (error) {
      console.error("Error updating documents:", error);
      Toast.show({
        type: "error",
        text1: "Error saat membatalkan sewa",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const completeRental = async () => {
    if (Data?.id == undefined) return;
    setIsLoading(true);
    try {
      const rentRef = doc(db, "rentals", Data?.id);
      const rentDoc = await getDoc(rentRef);
      if (rentDoc.exists()) {
        await updateDoc(rentRef, {
          updatedAt: Timestamp.now(),
          updatedBy: auth?.currentUser?.displayName,
          updatedById: auth?.currentUser?.uid,
          rentActualReturn: Timestamp.now(),
          status: "selesai",
        });
      } else {
        console.error("Rental Ref not found:");
      }

      const custRef = doc(db, "customers", Data?.customerId);
      const custDoc = await getDoc(custRef);
      if (custDoc.exists()) {
        await updateDoc(custRef, {
          rentStatus: false,
        });
      } else {
        console.error("Customer Ref not found:");
      }

      // Update all tools sequentially
      for (const item of Data?.items) {
        const toolRef = doc(db, "tools", item.toolId);
        const toolDoc = await getDoc(toolRef);
        if (toolDoc.exists()) {
          await updateDoc(toolRef, {
            toolsAvailability: true,
          });
        } else {
          console.error("Tool not found:", item.toolId);
        }
      }

      Toast.show({
        type: "success",
        text1: "Berhasil menyelesaikan sewa",
      });

      router.back();
    } catch (error) {
      console.error("Error updating documents:", error);
      Toast.show({
        type: "error",
        text1: "Error saat menyelesaikan sewa",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (
    imageData: any,
    imgKey: string | number | null
  ) => {
    setIsLoading(true);
    if (Data?.id == null || imgKey == null) return;
    try {
      const { uri, fileName } = imageData;

      const response = await fetch(uri);
      const blob = await response.blob();
      const storageRef = ref(storage, `toolDocs/${fileName}`);
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);

      // Update Firestore and local state
      const customerRef = doc(db, "tools", Data?.id); // Use existing ID or placeholder for new data
      const updatedImageUrl = [...images];
      updatedImageUrl.push(downloadURL);

      await setDoc(customerRef, { imageUrl: updatedImageUrl }, { merge: true }); // Create or update document
      setImages(updatedImageUrl);

      Toast.show({
        type: "success",
        text1:
          imgKey !== null
            ? "Foto berhasil diperbarui"
            : "Foto berhasil ditambahkan",
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      Toast.show({
        type: "error",
        text1: "Gagal mengunggah foto",
      });
    } finally {
      setIsLoading(false);
      setSelectedImageKey(null);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      const customerRef = doc(db, "tools", Data?.id as string);
      await deleteDoc(customerRef);
      const deleteImagePromises = images.map(async (key: string) => {
        if (key) {
          try {
            await deleteObject(ref(storage, key));
          } catch (error) {
            console.error(`Failed to delete image: ${key}`, error);
          }
        }
      });

      await Promise.all(deleteImagePromises);
      Toast.show({
        type: "success",
        text1: "Data Alat berhasil dihapus",
      });

      router.push("/tools");
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Gagal menghapus data Alat",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteImage = async (imageUrl: string, index: number) => {
    if (Data?.id == null) {
      Toast.show({
        type: "error",
        text1: "Gagal menghapus gambar",
      });
      return;
    }
    try {
      setIsLoading(true);
      await deleteObject(ref(storage, imageUrl));
    } catch (error) {
    } finally {
      const updatedImages = [...images];
      updatedImages.splice(index, 1);
      setImages(updatedImages);
      const userRef = doc(db, "tools", Data?.id);
      await updateDoc(userRef, { imageUrl: updatedImages })
        .then((res) => {
          Toast.show({
            type: "success",
            text1: "Gambar berhasil dihapus",
          });
        })
        .catch((error) => {
          Toast.show({
            type: "error",
            text1: "Gagal menghapus gambar",
          });
        });
      setIsLoading(false);
    }
  };

  const renderImageDocs = ({
    item,
    index,
  }: {
    item: string;
    index: number;
  }) => {
    // console.log("item", item);
    return (
      <View>
        <MaterialCommunityIcons
          style={{
            backgroundColor: Colors[colorScheme ?? "light"].error,
            borderRadius: 100,
            padding: spacing.xxs,
            color: Colors[colorScheme ?? "light"].background,
            position: "absolute",
            bottom: 20,
            right: 20,
            zIndex: 10,
          }}
          name="trash-can"
          size={30}
          onPress={() => {
            Alert.alert(
              "Konfirmasi Hapus",
              "Yakin ingin menghapus gambar alat ini? Tindakan ini tidak dapat dibatalkan.",
              [
                {
                  text: "Batal",
                  onPress: () => {},
                },
                {
                  text: "Yakin",
                  onPress: () => {
                    deleteImage(item, index);
                  },
                },
              ]
            );
          }}
        />
        <TouchableOpacity
          onPress={() => {
            setIsVisibleIndex(index);
          }}
          style={{ justifyContent: "center", alignItems: "center" }}
        >
          <Image
            source={{ uri: item }}
            style={[styles.imagePreview, { opacity: isLoading ? 0.5 : 1 }]}
          />
          {isLoading && (
            <ActivityIndicator
              style={{ position: "absolute" }}
              size={"large"}
            />
          )}
        </TouchableOpacity>
      </View>
    );
  };

  if (Data?.id) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: Colors[colorScheme ?? "light"].background },
        ]}
      >
        <Header
          title={"Detail Penyewaan"}
          subtitle={`id sewa: ${Data?.id.slice(-5)}`}
          rightIcon="history"
          onRightPress={() =>
            router.push({
              pathname: "/peralatan/history",
              params: { id: Data?.id },
            })
          }
        />

        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View>
            <View style={styles.row}>
              <Text fontWeight="bold" size="md">
                {Data?.customerName}
              </Text>
              <Text fontWeight="bold" size="md">
                ke {Data?.destination}
              </Text>
            </View>
            <View style={styles.row}>
              <Text fontWeight="light" size="xs">
                {dayjs.unix(Data?.rentDate?.seconds).format("dddd, DD-MM-YYYY")}
              </Text>
              <Text fontWeight="light" size="xs">
                {dayjs
                  .unix(Data?.rentReturn?.seconds)
                  .format("dddd, DD-MM-YYYY")}
              </Text>
            </View>
            {Data?.rentActualReturn && (
              <View style={styles.row}>
                <Text fontWeight="light" size="xs">
                  Dikembalikan pada{" "}
                  {dayjs
                    .unix(Data?.rentActualReturn?.seconds)
                    .format("dddd, DD-MM-YYYY")}
                </Text>
                {Data?.rentLateLength && (
                  <Text fontWeight="bold" size="xs" color="red">
                    Telat {Data?.rentLateLength} Hari
                  </Text>
                )}
              </View>
            )}

            <View
              style={{
                borderTopWidth: 1,
                borderColor: Colors[colorScheme ?? "light"].border,
                marginVertical: spacing.xs,
              }}
            />
            <View style={styles.row}>
              <Text>Dicatat oleh</Text>
              <Text>Diperbarui oleh</Text>
            </View>

            <View style={styles.row}>
              <View>
                <Text fontWeight="light" size="xs">
                  {Data?.createdBy}
                </Text>
                <Text fontWeight="light" size="xs">
                  {dayjs
                    .unix(Data?.createdAt?.seconds)
                    .format("dddd, DD-MM-YYYY")}
                </Text>
              </View>
              <View>
                <Text fontWeight="light" size="xs">
                  {Data?.updatedBy || "belum ada"}
                </Text>
                {Data?.updatedAt && (
                  <Text
                    fontWeight="light"
                    size="xs"
                    style={{ textAlign: "right" }}
                  >
                    {dayjs
                      .unix(Data?.updatedAt?.seconds)
                      .format("dddd, DD-MM-YYYY")}
                  </Text>
                )}
              </View>
            </View>
          </View>
          <View style={styles.row}>
            <Text
              color={Colors[colorScheme ?? "light"].success}
              fontWeight="bold"
            >
              {formatRupiah(Data?.rentPerDay)} x {Data?.rentLength} hari ={" "}
            </Text>
            <Text
              color={Colors[colorScheme ?? "light"].success}
              fontWeight="bold"
            >
              {formatRupiah(Data?.rentNominal)}
            </Text>
          </View>
          {Data?.items?.map &&
            Data?.items.map((item1) => (
              <View
                key={item1.toolId}
                style={{
                  borderWidth: 1,
                  borderRadius: corner.sm,
                  padding: spacing.xs,
                  gap: spacing.xs,
                  borderColor: Colors[colorScheme ?? "light"].border,
                }}
              >
                <Text
                  fontWeight="bold"
                  color={Colors[colorScheme ?? "light"].primary}
                >
                  {item1.toolName}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text>
                    {formatRupiah(item1.price)} x {Data.rentLength} hari
                  </Text>
                  <Text
                    color={Colors[colorScheme ?? "light"].success}
                    fontWeight="bold"
                  >
                    {formatRupiah(item1.totalPrice)}
                  </Text>
                </View>
              </View>
            ))}
          {Data?.status == "berlangsung" && (
            <Button
              isLoading={isLoading}
              title="Selesaikan sewa"
              event="warning"
              onPress={() => {
                Alert.alert(
                  "Sewa sedang berlangsung",
                  "Pastikan periksa peralatan saat pengembalian sewa!",
                  [
                    {
                      text: "Batal",
                      onPress: () => {},
                    },
                    {
                      text: "Yakin",
                      onPress: () => {
                        completeRental();
                      },
                    },
                  ]
                );
              }}
            />
          )}
          {Data?.status == "selesai" && (
            <Button
              disabled
              isLoading={isLoading}
              title="Sewa selesai pada"
              subTitle={dayjs
                .unix(Data?.rentActualReturn?.seconds)
                .format("dddd, DD-MM-YYYY")}
              onPress={() => {}}
              event="success"
              icon="check"
            />
          )}
          {Data?.status == "batal" && (
            <Button
              disabled
              isLoading={isLoading}
              title="Sewa sudah di batalkan"
              onPress={() => {}}
              event="error"
              icon="cancel"
            />
          )}
          {Data?.status == "booking" && (
            <Button
              isLoading={isLoading}
              title="Batalkan booking ini"
              onPress={() => {
                Alert.alert(
                  "Konfirmasi Batalkan",
                  "Apakah Anda yakin ingin membatalkan booking ini? Tindakan ini tidak dapat dibatalkan.",
                  [
                    {
                      text: "Batal",
                      onPress: () => {},
                    },
                    {
                      text: "Yakin",
                      onPress: () => {
                        cancelRental();
                      },
                    },
                  ]
                );
              }}
              event="error"
              icon="cancel"
            />
          )}
        </ScrollView>
        {!hasChanges(originalData, Data) && (
          <Animated.View
            layout={LinearTransition}
            entering={FadeIn}
            exiting={FadeOut}
            style={{
              backgroundColor: Colors[colorScheme ?? "light"].background,
            }}
          >
            <Button
              isLoading={isLoading}
              containerStyle={{ margin: spacing.md }}
              title="Simpan Perubahan"
              // onPress={handleBulkUpdate}
            />
          </Animated.View>
        )}

        <EnhancedImageViewing
          images={images.map((url: string) => ({ uri: url }))}
          imageIndex={visibleIndex !== null ? visibleIndex : 0}
          visible={visibleIndex !== null}
          onRequestClose={() => setIsVisibleIndex(null)}
        />
        <ImagePicker
          isLoading={isLoading}
          title="Edit Foto"
          visible={selectedImageKey !== null}
          onClose={() => setSelectedImageKey(null)}
          onConfirm={(imageData) =>
            handleImageUpload(imageData, selectedImageKey)
          }
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  scrollContainer: { padding: spacing.md, gap: spacing.sm },
  iconImageWrap: {
    position: "absolute",
    bottom: 10,
    right: 10,
    zIndex: 10,
    gap: spacing.xs,
  },
  imageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  imagePreview: {
    width: widthByScreen(100),
    height: heightByScreen(25),
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
});
