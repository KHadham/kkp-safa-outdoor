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
import { sizes, spacing } from "@/constants/measure";
import dayjs from "dayjs";
import { formatRupiah, getNumberOnly, hasChanges } from "@/utils";
import { Colors } from "@/constants/Colors";
import {
  deleteDoc,
  doc,
  getFirestore,
  setDoc,
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
  const { details, imageUrl } = useLocalSearchParams();
  const parsedDetails: Tool = JSON.parse(details as string);
  const parsedImage = imageUrl
    ? JSON.parse(decodeURIComponent(imageUrl as string))
    : [];

  const [selectedImageKey, setSelectedImageKey] = useState<number | null>(null);
  const [visibleIndex, setIsVisibleIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [Data, setData] = useState<Tool | null>(null);

  const [originalData, setOriginalData] = useState<any>(null); // Store the original data for comparison
  const [images, setImages] = useState<any>([]);

  useEffect(() => {
    setIsLoading(true);
    setData(parsedDetails);
    setImages(parsedImage);
    setOriginalData(parsedDetails);
    setIsLoading(false);
  }, []);

  const handleInputChange = (key: string, value: any) => {
    setData((prevData: any) => ({
      ...prevData,
      [key]: value,
    }));
  };

  const handleBulkUpdate = async () => {
    if (hasChanges(originalData, Data)) {
      Toast.show({
        type: "info",
        text1: "Tidak ada perubahan untuk disimpan",
      });
      return;
    }
    setIsLoading(true);
    try {
      const customerRef = doc(db, "tools", Data?.id as string);
      const updatedData = {
        category: Data?.category,
        description: Data?.description,
        sizes: Data?.sizes,
        sizesName: Data?.sizesName,
        toolsCondition: Data?.toolsCondition,
        toolsName: Data?.toolsName,
        toolsRealPrice: Data?.toolsRealPrice,
        toolsRentPrice: Data?.toolsRentPrice,
        toolsAvailability: Data?.toolsAvailability,
        updatedAt: new Date(),
        updatedBy: auth?.currentUser?.displayName,
      };

      const sanitizedData = Object.fromEntries(
        Object.entries(updatedData).filter(([_, value]) => value !== undefined)
      );
      await setDoc(customerRef, sanitizedData, { merge: true });

      Toast.show({
        type: "success",
        text1: "Data berhasil diperbarui",
      });
      router.back();
    } catch (error) {
      console.error("Error updating customer data:", error);
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
      <View style={styles.container}>
        <Header
          title={"Detail Alat"}
          subtitle={`id inventaris: ${Data?.id.slice(-5)}`}
          rightIcon="history"
          onRightPress={() =>
            router.push({
              pathname: "/peralatan/history",
              params: { id: Data?.id },
            })
          }
        />
        <ScrollView
          contentContainerStyle={[
            styles.scrollContainer,
            { backgroundColor: Colors[colorScheme ?? "light"].background },
          ]}
        >
          <FlatList
            style={{ marginHorizontal: -spacing.md }}
            horizontal
            pagingEnabled
            data={images}
            renderItem={renderImageDocs}
            ListFooterComponent={
              <TouchableOpacity
                style={styles.imagePreview}
                onPress={() => setSelectedImageKey(-1)}
              >
                <MaterialCommunityIcons name="plus-circle-outline" size={35} />
                <Text>Tambah Gambar</Text>
              </TouchableOpacity>
            }
          />
          <View style={styles.row}>
            <Text>Keuntungan sewa</Text>
            <Text
              fontWeight="bold"
              color={Colors[colorScheme ?? "light"].success}
            >
              {formatRupiah(Data?.rentProfit)}
            </Text>
          </View>
          <View style={styles.row}>
            <Text>Sudah disewa </Text>
            <Text>{Data?.rentCount}x</Text>
          </View>
          <Input
            editable={!isLoading && Data?.toolsAvailability}
            label="Nama Alat"
            value={Data?.toolsName}
            onChangeText={(text) => handleInputChange("toolsName", text)}
          />
          <Input
            editable={!isLoading && Data?.toolsAvailability}
            label="Deskripsi:"
            value={Data?.description}
            onChangeText={(text) => handleInputChange("description", text)}
            type="area"
          />
          <Input
            editable={!isLoading && Data?.toolsAvailability}
            label="Ukuran"
            value={Data?.sizes}
            onChangeText={(text) => handleInputChange("sizes", text)}
          />
          <Input
            editable={!isLoading && Data?.toolsAvailability}
            label="Satuan Ukuran"
            value={Data?.sizesName}
            onSelect={(text) => handleInputChange("sizesName", text)}
            data={["Liter", "Luas", "Orang", "Pakaian", "Sepatu"]}
          />
          <Input
            editable={!isLoading && Data?.toolsAvailability}
            label="Kategori"
            value={Data?.category}
            onSelect={(text) => handleInputChange("category", text)}
            data={["Carrier", "Sepatu", "Jaket", "Nesting", "Kompor"]}
          />
          <Input
            editable={!isLoading && Data?.toolsAvailability}
            label="Kondisi Alat"
            value={Data?.toolsCondition}
            onSelect={(text) => handleInputChange("toolsCondition", text)}
            data={["Kotor", "Bolong", "Patah", "Baik", "Bau"]}
          />
          <Input
            editable={!isLoading && Data?.toolsAvailability}
            label="Harga Beli"
            value={formatRupiah(Data?.toolsRealPrice)}
            onChangeText={(text) =>
              handleInputChange("toolsRealPrice", getNumberOnly(text))
            }
          />
          <Input
            editable={!isLoading && Data?.toolsAvailability}
            label="Harga Sewa"
            value={formatRupiah(Data?.toolsRentPrice)}
            onChangeText={(text) =>
              handleInputChange("toolsRentPrice", getNumberOnly(text))
            }
          />
          {Data.createdBy && (
            <Text fontWeight="light" size="xs">
              Dibuat: {Data.createdBy} pada{" "}
              {dayjs.unix(Data.createdAt?.seconds).format("DD MMMM YYYY")}
            </Text>
          )}
          {Data.updatedAt && Data.updatedBy && (
            <Text fontWeight="light" size="xs">
              Diperbaharui: {Data.updatedBy} pada{" "}
              {dayjs.unix(Data.updatedAt?.seconds).format("DD MMMM YYYY")}
            </Text>
          )}
          {!Data?.toolsAvailability ? (
            <Button
              isLoading={isLoading}
              title="Sedang Disewa"
              onPress={() =>
                alert(
                  "Alat yang sedang disewa tidak bisa di edit atau di hapus"
                )
              }
              event="warning"
              icon="alert-circle-outline"
            />
          ) : (
            <Button
              isLoading={isLoading}
              title="Hapus Data ini"
              onPress={() => {
                Alert.alert(
                  "Konfirmasi Hapus",
                  "Apakah Anda yakin ingin menghapus data pelanggan ini? Tindakan ini tidak dapat dibatalkan.",
                  [
                    {
                      text: "Batal",
                      onPress: () => {
                        Toast.show({
                          type: "error",
                          text1: "Hapus sudah dibatalkan",
                        });
                      },
                    },
                    {
                      text: "Yakin",
                      onPress: () => {
                        handleDelete();
                      },
                    },
                  ]
                );
              }}
              event="error"
              icon="trash-can"
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
              onPress={handleBulkUpdate}
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
  scrollContainer: { padding: spacing.md, gap: spacing.sm, paddingTop: 0 },
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
