import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import { Button, Header, ImagePicker, Input, Text } from "@/components";
import EnhancedImageViewing from "react-native-image-viewing";
import { Image } from "expo-image";
import { corner, spacing } from "@/constants/measure";
import { Colors } from "@/constants/Colors";
import {
  addDoc,
  collection,
  doc,
  getFirestore,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { app } from "@/firebaseConfig";
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
import { getNumberOnly, getNumberRemoveFirstZero } from "@/utils";

export default function CreateData() {
  const db = getFirestore(app);
  const storage = getStorage(app);
  const colorScheme = useColorScheme();

  const [generatedId, setGeneratedId] = useState<string>("");
  const [visibleIndex, setVisibleIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<any>({
    fullName: "",
    phone: "",
    address: "",
  });
  const [images, setImages] = useState({
    doc_ktp: "",
    doc_npwp: "",
    doc_sim: "",
    doc_person: "",
  });
  const [selectedImageKey, setSelectedImageKey] = useState<string>("");

  const handleInputChange = (key: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleFormSubmit = async () => {
    if (!formData.fullName || !formData.phone || !formData.address) {
      Toast.show({
        type: "error",
        text1: "Semua field wajib diisi",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Prepare data for submission
      const newCustomerData = {
        fullName: formData?.fullName,
        phone: formData?.phone,
        address: formData?.address,
        createdAt: new Date(),
      };

      // Save the new customer data to Firestore
      // await setDoc(doc(db, "customers", "Lasdasd"), newCustomerData);
      const docRef = await addDoc(collection(db, "customers"), newCustomerData);
      Toast.show({
        type: "success",
        text1: "Berhasil menambahkan pelanggan",
      });
      setGeneratedId(docRef.id);
    } catch (error) {
      console.error("Error saving data:", error);
      Toast.show({
        type: "error",
        text1: "Gagal menyimpan data",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (
    imageData: any,
    key: keyof typeof images
  ) => {
    setIsLoading(true);
    try {
      const { uri, fileName } = imageData;

      // Delete existing image if it exists
      if (images[key]) {
        const currentRef = ref(storage, images[key]);
        await deleteObject(currentRef);
      }

      // Upload new image
      const response = await fetch(uri);
      const blob = await response.blob();
      const storageRef = ref(storage, `customersDocs/${fileName}`);
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);

      // Update Firestore and local state
      const customerRef = doc(db, "customers", generatedId);
      await updateDoc(customerRef, { [key]: downloadURL });
      setImages((prev) => ({ ...prev, [key]: downloadURL }));

      Toast.show({
        type: "success",
        text1: "Foto berhasil diunggah",
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      Toast.show({
        type: "error",
        text1: "Gagal mengunggah foto",
      });
    } finally {
      setIsLoading(false);
      setSelectedImageKey("");
    }
  };

  const renderImagePicker = (label: string, key: keyof typeof images) => (
    <TouchableOpacity
      disabled={generatedId == ""}
      onPress={() => setVisibleIndex(Object.keys(images).indexOf(key))}
    >
      <View
        style={[
          styles.imageRow,
          {
            backgroundColor:
              generatedId == ""
                ? Colors[colorScheme ?? "light"].disabled
                : Colors[colorScheme ?? "light"].background,
          },
        ]}
      >
        <Text fontWeight="bold">{label}</Text>
        <MaterialCommunityIcons
          disabled={generatedId == ""}
          name="plus-circle-outline"
          size={26}
          onPress={() => setSelectedImageKey(key)}
        />
      </View>
      {images[key] && (
        <Image source={{ uri: images[key] }} style={styles.imagePreview} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header
        title="Pelanggan Baru"
        subtitle="Isi untuk menambah pelanggan baru"
      />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Input
          label="Nama"
          value={formData.fullName}
          onChangeText={(text) => handleInputChange("fullName", text)}
        />
        <Input
          label="No Hp (format +62)"
          value={formData.phone}
          onChangeText={(text) =>
            handleInputChange("phone", getNumberRemoveFirstZero(text))
          }
          keyboardType="numeric"
        />
        <Input
          label="Alamat"
          value={formData.address}
          onChangeText={(text) => handleInputChange("address", text)}
          type="area"
        />
        <View>
          <Text fontWeight="bold" size="md">
            Dokumen jaminan
          </Text>
          <Text size="sm">
            dokumen baru bisa ditambahkan setelah menyimpan data pelanggan
          </Text>
        </View>
        {renderImagePicker("KTP", "doc_ktp")}
        {renderImagePicker("SIM", "doc_sim")}
        {renderImagePicker("NPWP", "doc_npwp")}
        {renderImagePicker("Foto Orang", "doc_person")}
      </ScrollView>
      {generatedId == "" && (
        <Animated.View
          layout={LinearTransition}
          entering={FadeIn}
          exiting={FadeOut}
          style={styles.footer}
        >
          <Button
            isLoading={isLoading}
            containerStyle={styles.button}
            title="Tambah Data"
            onPress={handleFormSubmit}
            disabled={
              !formData.fullName || !formData.phone || !formData.address
            }
          />
        </Animated.View>
      )}
      <EnhancedImageViewing
        images={Object.values(images).map((uri) => ({ uri }))}
        imageIndex={visibleIndex ?? 0}
        visible={visibleIndex !== null}
        onRequestClose={() => setVisibleIndex(null)}
      />
      <ImagePicker
        isLoading={isLoading}
        title="Edit Foto"
        visible={!!selectedImageKey}
        onClose={() => setSelectedImageKey("")}
        onConfirm={(imageData) =>
          handleImageUpload(imageData, selectedImageKey as keyof typeof images)
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: spacing.md,
    gap: spacing.sm,
    backgroundColor: Colors.light.background,
  },
  imageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
    borderRadius: corner.md,
  },
  imagePreview: {
    width: "100%",
    height: 200,
  },
  footer: {
    backgroundColor: Colors.light.background,
  },
  button: {
    margin: spacing.md,
  },
});
