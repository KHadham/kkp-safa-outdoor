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
} from "react-native";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { Button, Header, ImagePicker, Input, Text } from "@/components";
import EnhancedImageViewing from "react-native-image-viewing";
import { Image } from "expo-image";
import { spacing } from "@/constants/measure";
import dayjs from "dayjs";
import { formatRupiah, hasChanges } from "@/utils";
import { Colors } from "@/constants/Colors";
import { deleteDoc, doc, getFirestore, updateDoc } from "firebase/firestore";
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

export default function CustomerDetail() {
  const db = getFirestore(app);
  const storage = getStorage(app);
  // const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const { customer, doc_ktp, doc_npwp, doc_sim, doc_person } =
    useLocalSearchParams<{
      customer: string;
      doc_ktp: string;
      doc_npwp: string;
      doc_sim: string;
      doc_person: string;
    }>();
  const [selectedImageKey, setSelectedImageKey] = useState<string>("");
  const [visibleIndex, setIsVisibleIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [customerData, setCustomerData] = useState<any>(null);
  const [originalCustomerData, setOriginalCustomerData] = useState<any>(null); // Store the original data for comparison
  const [selectedImage, setselectedImage] = useState("");
  const [images, setImages] = useState<{
    doc_ktp: string;
    doc_npwp: string;
    doc_sim: string;
    doc_person: string;
  }>({
    doc_ktp: doc_ktp,
    doc_npwp: doc_npwp,
    doc_sim: doc_sim,
    doc_person: doc_person,
  });

  useEffect(() => {
    // router.setOptions({ tabBarVisible: false });

    setIsLoading(true);
    if (typeof customer === "string") {
      const parsedCustomer = JSON.parse(customer);
      setCustomerData(parsedCustomer);
      setOriginalCustomerData(parsedCustomer);
      setIsLoading(false);
    }
  }, [customer]);

  const handleInputChange = (key: string, value: string) => {
    setCustomerData((prevData: any) => ({
      ...prevData,
      [key]: value,
    }));
  };

  const handleBulkUpdate = async () => {
    if (hasChanges(originalCustomerData, customerData)) {
      Toast.show({
        type: "info",
        text1: "Tidak ada perubahan untuk disimpan",
      });
      return;
    }
    setIsLoading(true);
    try {
      const customerRef = doc(db, "customers", customerData?.id);
      const updatedData = {
        fullName: customerData?.fullName,
        phone: customerData?.phone,
        address: customerData?.address,
        updatedAt: new Date(),
        // Add any other fields you want to update here
      };

      await updateDoc(customerRef, updatedData);

      // Optionally, update the local state (customerData) to reflect the changes
      setCustomerData((prev: any) => ({
        ...prev,
        ...updatedData,
      }));

      Toast.show({
        type: "success",
        text1: "Data berhasil diperbarui",
      });
    } catch (error) {
      console.error("Error updating customer data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditPhoto = async (imageData: any) => {
    setIsLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("No user is currently authenticated");
      }

      const { uri, fileName } = imageData;

      // Get the current photo URL from the user object
      const currentPhotoURL = selectedImage;

      // Delete the existing file in Firebase Storage if it exists
      if (currentPhotoURL) {
        const currentPhotoRef = ref(storage, currentPhotoURL);
        try {
          await deleteObject(currentPhotoRef);
          console.log("Old profile photo deleted successfully");
        } catch (error: any) {
          console.warn("Error deleting old profile photo:", error?.message);
        }
      }

      // Convert local file URI to Blob
      const response = await fetch(uri);
      const blob = await response.blob();

      // Upload the Blob to Firebase Storage
      const storageRef = ref(storage, `customersDocs/${fileName}`);
      await uploadBytes(storageRef, blob);

      // Get the Download URL
      const downloadURL = await getDownloadURL(storageRef);
      console.log("New profile photo URL:", downloadURL);

      // Update Firestore with the new photo URL
      const userRef = doc(db, "customers", customerData?.id);

      // await updateDoc(userRef, { photoProfilex: downloadURL });
      // Find the key in the images state that matches the selectedImage value
      const imageKey = (Object.keys(images) as (keyof typeof images)[]).find(
        (key) => images[key] === selectedImage
      );
      console.log("imageKey", imageKey);
      if (imageKey) {
        // Update Firestore with the new photo URL using the dynamic key
        await updateDoc(userRef, { [imageKey]: downloadURL });
      }
      // Update local state
      // setuserObject((prev: any) => ({ ...prev, photoProfile: downloadURL }));
      if (imageKey) {
        setImages((prevImages) => ({
          ...prevImages,
          [imageKey]: downloadURL,
        }));
      }

      console.log("downloadURL", downloadURL);
      console.log("images", images);
      Toast.show({
        type: "success",
        text1: "Foto berhasil diubah",
      });
    } catch (error) {
      console.error("Error updating profile photo:", error);
    } finally {
      setIsLoading(false);
      setselectedImage("");
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
      const storageRef = ref(storage, `customerDocs/${fileName}`);
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);

      // Update Firestore and local state
      const customerRef = doc(db, "customers", customerData?.id);
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

  const renderImageDocs = (label: string, key: keyof typeof images) => (
    <TouchableOpacity
      onPress={() => setIsVisibleIndex(Object.keys(images).indexOf(key))}
    >
      <View style={[styles.imageRow]}>
        <Text fontWeight="bold">{label}</Text>
        <MaterialCommunityIcons
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

  const handleWhatsapp = () => {
    if (customerData?.phone) {
      const whatsappUrl = `whatsapp://send?phone=${customerData.phone}`;
      Linking.canOpenURL(whatsappUrl)
        .then((supported) => {
          if (supported) {
            return Linking.openURL(whatsappUrl);
          } else {
            Toast.show({
              type: "error",
              text1: "WhatsApp tidak terpasang di perangkat ini",
            });
          }
        })
        .catch((err) => console.error("Error opening WhatsApp:", err));
    } else {
      Toast.show({
        type: "error",
        text1: "Nomor telepon pelanggan tidak tersedia",
      });
    }
  };

  const handleDeleteCustomer = async () => {
    setIsLoading(true);
    try {
      const customerRef = doc(db, "customers", customerData?.id);
      await deleteDoc(customerRef);
      const imageKeys = Object.keys(images) as (keyof typeof images)[];
      for (const key of imageKeys) {
        if (images[key]) {
          const imageRef = ref(storage, images[key]);
          await deleteObject(imageRef);
        }
      }

      Toast.show({
        type: "success",
        text1: "Data pelanggan berhasil dihapus",
      });

      // Navigate back to the customer list or another appropriate screen
      router.push("/customers");
    } catch (error) {
      console.error("Error deleting customer data:", error);
      Toast.show({
        type: "error",
        text1: "Gagal menghapus data pelanggan",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!customerData && isLoading) return null;

  return (
    <View style={styles.container}>
      <Header
        title={"Detail Pelanggan"}
        subtitle={`userId: ${customerData?.id.slice(-5)}`}
        rightIcon="history"
        onRightPress={() =>
          router.push({
            pathname: "/pelanggan/history",
            params: { id: customerData?.id },
          })
        }
      />

      <ScrollView
        contentContainerStyle={{
          padding: spacing.md,
          gap: spacing.sm,
          backgroundColor: Colors[colorScheme ?? "light"].background,
        }}
      >
        <Input
          label="Nama"
          value={customerData?.fullName}
          onChangeText={(text) => handleInputChange("fullName", text)}
          editable={false}
        />
        <Input
          label="No Hp:"
          value={customerData?.phone}
          onChangeText={(text) => handleInputChange("phone", text)}
        />
        <Input
          label="Alamat:"
          value={customerData?.address}
          onChangeText={(text) => handleInputChange("address", text)}
          type="area"
        />
        <Text fontWeight="bold" color="red" >
          <Text fontWeight="bold">Total Nominal Sewa:</Text>{" "}
          {customerData?.rentIncome
            ? formatRupiah(customerData.rentIncome)
            : "Belum ada data"}
        </Text>
        <Text>
          <Text fontWeight="bold">Banyak Sewa:</Text>{" "}
          {customerData?.rentIncome ? customerData.rentCount : "Belum ada data"}
        </Text>
        <Text>
          <Text fontWeight="bold">Terakhir Sewa: </Text>
          {customerData?.lastRent?.seconds
            ? dayjs.unix(customerData.lastRent.seconds).format("DD MMMM YYYY")
            : "Belum ada data"}
        </Text>
        <Text>
          <Text fontWeight="bold">Didaftarkan pada: </Text>
          {dayjs.unix(customerData?.createdAt.seconds).format("DD MMMM YYYY")}
        </Text>
        <Text fontWeight="bold" color="green" onPress={handleWhatsapp}>
          Hubungi Pelanggan ini via WhatsApp
        </Text>
        <View style={{ borderWidth: 0.5, marginVertical: spacing.sm }} />

        <Text fontWeight="bold" size="md">
          Dokumen Jaminan
        </Text>
        {renderImageDocs("KTP", "doc_ktp")}
        {renderImageDocs("SIM", "doc_sim")}
        {renderImageDocs("NPWP", "doc_npwp")}
        {renderImageDocs("Orangnya", "doc_person")}
        <Button
          isLoading={isLoading}
          title="Hapus Data Pelanggan ini"
          onPress={() => {
            Alert.alert(
              "Konfirmasi Hapus",
              "Apakah Anda yakin ingin menghapus data pelanggan ini? Tindakan ini tidak dapat dibatalkan.",
              [
                {
                  text: "Batal",
                  onPress: () => {},
                },
                {
                  text: "Yakin",
                  onPress: () => handleDeleteCustomer(),
                },
              ]
            );
          }}
          event="error"
          icon="trash-can"
        />
      </ScrollView>
      {!hasChanges(originalCustomerData, customerData) && (
        <Animated.View
          layout={LinearTransition}
          entering={FadeIn}
          exiting={FadeOut}
          style={{ backgroundColor: Colors[colorScheme ?? "light"].background }}
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
        images={[
          { uri: images?.doc_ktp },
          { uri: images?.doc_sim },
          { uri: images?.doc_npwp },
          { uri: images?.doc_person },
        ]}
        imageIndex={visibleIndex !== null ? visibleIndex : 0}
        visible={visibleIndex !== null}
        onRequestClose={() => setIsVisibleIndex(null)}
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
  imageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  imagePreview: {
    width: "100%",
    height: 200,
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
