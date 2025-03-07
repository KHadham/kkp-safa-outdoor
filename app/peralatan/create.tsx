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
  addDoc,
  collection,
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
import { Tool } from "@/types/Tools";
import { heightByScreen, widthByScreen } from "@/utils/dimension";
import * as yup from "yup";

export default function CustomerDetail() {
  const db = getFirestore(app);
  const storage = getStorage(app);

  const colorScheme = useColorScheme();

  const [generatedId, setGeneratedId] = useState<string>("");
  const [selectedImageKey, setSelectedImageKey] = useState<number | null>(null);
  const [visibleIndex, setIsVisibleIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [Data, setData] = useState<Tool | null>(null);

  const [images, setImages] = useState<any>([]);

  const handleInputChange = (key: string, value: any) => {
    setData((prevData: any) => ({
      ...prevData,
      [key]: value,
    }));
  };

  const validationSchema = yup.object().shape({
    toolsName: yup.string().required("Nama Alat Wajib Di isi"),
    description: yup.string().required("Deskripsi Wajib Di isi"),
    sizes: yup.string().required("Ukuran Wajib Di isi"),
    sizesName: yup.string().required("Satuan Ukuran Wajib Di isi"),
    category: yup.string().required("Kategori Wajib Di isi"),
    toolsCondition: yup.string().required("Kondisi Alat Wajib Di isi"),
    toolsRealPrice: yup.number().required("Harga Beli Wajib Di isi"),
    toolsRentPrice: yup.number().required("Harga Sewa Wajib Di isi"),
    toolsAvailability: yup.boolean().required("Ketersediaan Wajib Di isi"),
  });

  const validateData = async () => {
    try {
      await validationSchema.validate(Data, { abortEarly: false });
      return true;
    } catch (errors) {
      if (errors instanceof yup.ValidationError) {
        errors.inner.forEach((error) => {
          Toast.show({
            type: "error",
            text1: error.message,
          });
        });
      }
      return false;
    }
  };

  const handleBulkUpdate = async () => {
    const isValid = await validateData();
    if (!isValid) return;
    setIsLoading(true);
    try {
      const newCustomerData = {
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

      const docRef = await addDoc(collection(db, "tools"), newCustomerData);
      Toast.show({
        type: "success",
        text1: "Berhasil menambahkan data",
        text2: "Silahkan tambahkan gambar",
      });
      setGeneratedId(docRef.id);
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
    if (generatedId == "") return;
    try {
      const { uri, fileName } = imageData;

      const response = await fetch(uri);
      const blob = await response.blob();
      const storageRef = ref(storage, `toolDocs/${fileName}`);
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);

      // Update Firestore and local state
      const customerRef = doc(db, "tools", generatedId); // Use existing ID or placeholder for new data
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

  return (
    <View style={styles.container}>
      <Header
        title={"Tambah Alat"}
        subtitle="Tambah Gambar Setelah Menambahkan Data Alat"
      />
      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          {
            backgroundColor: Colors[colorScheme ?? "light"].background,
          },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {generatedId && (
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
        )}

        <Input
          editable={!isLoading && generatedId == ""}
          label="Nama Alat"
          value={Data?.toolsName || ""}
          onChangeText={(text) => handleInputChange("toolsName", text)}
        />
        <Input
          editable={!isLoading && generatedId == ""}
          label="Deskripsi:"
          value={Data?.description || ""}
          onChangeText={(text) => handleInputChange("description", text)}
          type="area"
        />
        <Input
          editable={!isLoading && generatedId == ""}
          label="Ukuran"
          value={Data?.sizes || ""}
          onChangeText={(text) => handleInputChange("sizes", text)}
        />
        <Input
          editable={!isLoading && generatedId == ""}
          label="Satuan Ukuran"
          value={Data?.sizesName || ""}
          onSelect={(text) => handleInputChange("sizesName", text)}
          data={["Liter", "Luas", "Orang", "Pakaian", "Sepatu"]}
        />
        <Input
          editable={!isLoading && generatedId == ""}
          label="Kategori"
          value={Data?.category || ""}
          onSelect={(text) => handleInputChange("category", text)}
          data={["Carrier", "Sepatu", "Jaket", "Nesting", "Kompor"]}
        />
        <Input
          editable={!isLoading && generatedId == ""}
          label="Kondisi Alat"
          value={Data?.toolsCondition || ""}
          onSelect={(text) => handleInputChange("toolsCondition", text)}
          data={["Kotor", "Bolong", "Patah", "Baik", "Bau"]}
        />
        <Input
          editable={!isLoading && generatedId == ""}
          label="Harga Beli"
          value={formatRupiah(Data?.toolsRealPrice || 0)}
          onChangeText={(text) =>
            handleInputChange("toolsRealPrice", getNumberOnly(text))
          }
          keyboardType="numeric"
        />
        <Input
          editable={!isLoading && generatedId == ""}
          label="Harga Sewa"
          value={formatRupiah(Data?.toolsRentPrice || 0)}
          onChangeText={(text) =>
            handleInputChange("toolsRentPrice", getNumberOnly(text))
          }
          keyboardType="numeric"
        />
        <Input
          editable={!isLoading && generatedId == ""}
          label="Ketersediaan"
          value={
            Data?.toolsAvailability == false ? "Sedang Disewa" : "Tersedia"
          }
          onSelect={(text) =>
            handleInputChange(
              "toolsAvailability",
              text == "Sedang Disewa" ? false : true
            )
          }
          data={["Sedang Disewa", "Tersedia"]}
        />
      </ScrollView>
      {!generatedId && (
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
            title="Tambah Data"
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

const styles = StyleSheet.create({
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
