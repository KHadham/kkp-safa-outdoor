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
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { Button, Header, ImagePicker, Input, Text } from "@/components";
import EnhancedImageViewing from "react-native-image-viewing";
import { Image } from "expo-image";
import { corner, sizes, spacing } from "@/constants/measure";
import dayjs from "dayjs";
import { diffDays, formatRupiah, getNumberOnly, hasChanges } from "@/utils";
import { Colors } from "@/constants/Colors";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { app, auth } from "@/firebaseConfig";
import Toast from "react-native-toast-message";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
} from "react-native-reanimated";
import Icons from "@expo/vector-icons/MaterialCommunityIcons";
import {
  deleteObject,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes,
} from "firebase/storage";
import { heightByScreen, widthByScreen } from "@/utils/dimension";
import * as yup from "yup";
import ReactNativeModal from "react-native-modal";

export default function CustomerDetail() {
  const db = getFirestore(app);
  const storage = getStorage(app);
  const navigation = useNavigation();

  const colorScheme = useColorScheme();

  const [generatedId, setGeneratedId] = useState<string>("");
  const [selectedImageKey, setSelectedImageKey] = useState<number | null>(null);
  const [visibleIndex, setIsVisibleIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showModalDetail, setshowModalDetail] = useState<boolean>(false);
  const [Data, setData] = useState<RentalHistory | any>({});
  const [customerList, setcustomerList] = useState<Customer[]>([]);
  const [itemList, setitemList] = useState<Tool[]>([]);

  const [images, setImages] = useState<any>([]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      fetchCustomers();
      fetchTools();
    });
    return unsubscribe;
  }, [navigation]);

  const fetchTools = async () => {
    setIsLoading(true);
    try {
      const q = query(
        collection(db, "tools"),
        where("toolsAvailability", "==", true)
      );
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setitemList(data as Tool[]);
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const q = query(
        collection(db, "customers"),
        where("rentStatus", "==", false)
      );
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setcustomerList(data as Customer[]);
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (key: string, value: any) => {
    setData((prevData: any) => ({
      ...prevData,
      [key]: value,
    }));
  };

  const validationSchema = yup.object().shape({
    // toolsName: yup.string().required("Nama Alat Wajib Di isi"),
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

  const handleBulkCreate = async () => {
    setIsLoading(true);
    try {
      const newCustomerData = {
        createdAt: Timestamp.now(),
        createdBy: auth?.currentUser?.displayName,
        createdById: auth?.currentUser?.uid,
        customerId: Data?.customerDetail?.id,
        destination: Data?.destination,
        customerName: Data?.customerDetail?.fullName,
        rentDate: Timestamp.fromDate(
          dayjs(Data?.rentDate, "DD-MM-YYYY").toDate()
        ),
        rentLength: diffDays(Data?.rentDate, Data?.rentReturn).toString(),
        rentNominal: Data?.items?.reduce(
          (a: number, b: { toolsRentPrice: number }) =>
            a + b.toolsRentPrice * diffDays(Data?.rentDate, Data?.rentReturn),
          0
        ),
        rentPerDay: Data?.items?.reduce(
          (a: number, b: { toolsRentPrice: number }) => a + b.toolsRentPrice,
          0
        ),
        rentReturn: Timestamp.fromDate(
          dayjs(Data?.rentReturn, "DD-MM-YYYY").toDate()
        ),
        toolIds: Data?.items?.map((item: any) => item.id) || [],
        status: dayjs(Data?.rentDate, "DD-MM-YYYY").isSame(dayjs(), "day")
          ? "berlangsung"
          : "booking",
        items: Data?.items?.map((item: any) => ({
          toolId: item.id,
          toolName: item.toolsName,
          price: item.toolsRentPrice,
          totalPrice:
            item.toolsRentPrice * diffDays(Data?.rentDate, Data?.rentReturn),
        })),
        toolsId: Data?.items?.map((item: any) => item.id),
      };

      const docRef = await addDoc(collection(db, "rentals"), newCustomerData);
      const customerRef = doc(db, "customers", Data?.customerDetail?.id);

      await updateDoc(customerRef, {
        rentStatus: true,
        rentCount: Number(Data?.customerDetail?.rentCount) + 1,
        rentIncome:
          Number(Data?.customerDetail?.rentIncome) +
          Number(
            Data?.items?.reduce(
              (a: number, b: { toolsRentPrice: number }) =>
                a +
                b.toolsRentPrice * diffDays(Data?.rentDate, Data?.rentReturn),
              0
            )
          ),
      });

      for (const item of Data?.items) {
        const toolRef = doc(db, "tools", item.id);
        await updateDoc(toolRef, {
          toolsAvailability: false, // Decrease availability by 1
          rentCount: Number(item?.rentCount ?? 0) + 1,
          rentProfit:
            Number(item?.rentProfit ?? 0) +
            item.toolsRentPrice * diffDays(Data?.rentDate, Data?.rentReturn),
        });
      }

      Toast.show({
        type: "success",
        text1: "Berhasil menambahkan data",
      });
      setshowModalDetail(false);
      router.back();
      setGeneratedId(docRef.id);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error saat menambahkan data",
        text2: "Pastikan semua kolom harus diisi",
      });
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

  if (!customerList) return null;
  return (
    <View style={styles.container}>
      <Header
        title={"Buat Sewa"}
        // subtitle=""
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
        <Input
          onPlus={() => router.navigate("/pelanggan/create")}
          editable={!isLoading}
          label="Pelanggan"
          value={Data?.customerDetail?.fullName}
          data={customerList}
          onSelect={(text) => handleInputChange("customerDetail", text)}
        />
        <Input
          editable={!isLoading && generatedId == ""}
          label="Tujuan"
          value={Data?.destination}
          onChangeText={(text) => handleInputChange("destination", text)}
        />
        <Input
          editable={!isLoading && generatedId == ""}
          label="Tanggal Sewa"
          type="date"
          value={Data?.rentDate}
          onChangeText={(text) => handleInputChange("rentDate", text)}
        />
        <Input
          editable={!isLoading && generatedId == ""}
          label="Tanggal Kembali"
          type="date"
          value={Data?.rentReturn}
          onChangeText={(text) => {
            handleInputChange("rentReturn", text);
          }}
        />
        {Data?.rentReturn && Data?.rentDate && (
          <Text fontWeight="bold" style={{ marginBottom: spacing.xxs }}>
            sewa {diffDays(Data?.rentDate, Data?.rentReturn)} hari
          </Text>
        )}
        <Animated.FlatList
          layout={LinearTransition}
          ListHeaderComponent={
            <Text fontWeight="bold" style={{ marginBottom: spacing.xxs }}>
              Peralatan yang mau di sewa
            </Text>
          }
          scrollEnabled={false}
          data={Data?.items}
          ItemSeparatorComponent={() => (
            <View style={{ marginTop: spacing.md }} />
          )}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => {
            return (
              <Animated.View
                key={index}
                layout={LinearTransition}
                style={{
                  flexDirection: "row",
                  gap: spacing.sm,
                  alignItems: "center",
                }}
              >
                <Input
                  editable={false}
                  value={
                    item?.category + "-" + item?.sizes + " | " + item?.toolsName
                  }
                  successMessage={"id: " + item?.id.slice(-5)}
                />
                <Animated.View layout={LinearTransition}>
                  <Icons
                    name="close"
                    color={Colors.light.error}
                    size={sizes.lg}
                    onPress={() => {
                      setData((prevData: any) => ({
                        ...prevData,
                        items: prevData?.items?.filter(
                          (_: any, i: number) => i !== index
                        ),
                      }));
                    }}
                  />
                </Animated.View>
              </Animated.View>
            );
          }}
          ListFooterComponent={
            <View style={{ marginTop: spacing.md }}>
              <Input
                onPlus={() => router.navigate("/peralatan/create")}
                placeholder="Pilih Alat"
                value={Data?.items}
                data={itemList}
                onSelect={(selected) => {
                  console.log("Data?.items", Data);
                  setData((prevData: any) => {
                    const items = prevData?.items || [];
                    const itemExists = items.some(
                      (item: any) => item.id === selected.id
                    );

                    // If item exists, remove it; otherwise, add it
                    const updatedItems = itemExists
                      ? items.filter((item: any) => item.id !== selected.id)
                      : [...items, selected];

                    return {
                      ...prevData,
                      items: updatedItems,
                    };
                  });
                }}
              />
            </View>
          }
        />
        <Animated.View
          layout={LinearTransition}
          entering={FadeIn}
          exiting={FadeOut}
          style={{
            backgroundColor: Colors[colorScheme ?? "light"].background,
          }}
        >
          <Button
            disabled={isLoading || Data?.items === undefined}
            isLoading={isLoading}
            containerStyle={{ marginTop: spacing.md }}
            title="Konfirmasi Sewa"
            onPress={() => setshowModalDetail(true)}
          />
        </Animated.View>
      </ScrollView>

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
      {/* MODAL */}
      <ReactNativeModal
        isVisible={showModalDetail}
        onBackdropPress={() => {
          setshowModalDetail(false);
        }}
        onBackButtonPress={() => {
          setshowModalDetail(false);
        }}
        style={styles.modal}
      >
        <ScrollView style={styles.modalContent} stickyHeaderIndices={[0]}>
          <Header
            title="Konfirmasi Sewa"
            subtitle="Pastikan data disini sudah benar"
            leftIcon="chevron-down"
            onLeftPress={() => setshowModalDetail(false)}
          />
          <View
            style={{
              padding: spacing.md,
              borderRadius: corner.sm,
              gap: spacing.xs,
              backgroundColor: Colors[colorScheme ?? "light"].background,
            }}
          >
            <Text
              fontWeight="bold"
              color={Colors[colorScheme ?? "light"].primary}
            >
              {Data?.customerDetail?.fullName}
            </Text>
            <Text fontWeight="bold">
              Sewa {diffDays(Data?.rentDate, Data?.rentReturn)} hari, ke{" "}
              {Data.destination}
            </Text>
            <View>
              <View style={styles.row}>
                <Text>{dayjs(Data.rentDate, "DD-MM-YYYY").format("dddd")}</Text>
                <Text>
                  {dayjs(Data.rentReturn, "DD-MM-YYYY").format("dddd")}
                </Text>
              </View>
              <View style={styles.row}>
                <Text>{Data.rentDate}</Text>
                <Text color={Colors[colorScheme ?? "light"].text}>
                  {Data.rentReturn}
                </Text>
              </View>
            </View>
            {Data?.items?.map((item: any, index: number) => (
              <View
                key={index}
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
                  {item.toolsName} {item.category}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text
                    color={Colors[colorScheme ?? "light"].error}
                    fontWeight="bold"
                  >
                    {formatRupiah(item.toolsRentPrice)} x{" "}
                    {diffDays(Data?.rentDate, Data?.rentReturn) + " hari"}
                  </Text>
                  <Text
                    color={Colors[colorScheme ?? "light"].success}
                    fontWeight="bold"
                  >
                    {formatRupiah(
                      item.toolsRentPrice *
                        diffDays(Data?.rentDate, Data?.rentReturn)
                    )}
                  </Text>
                </View>
              </View>
            ))}
            <Text
              fontWeight="bold"
              color={Colors[colorScheme ?? "light"].success}
              style={{ textAlign: "right" }}
            >
              Total{" "}
              {formatRupiah(
                Data?.items?.reduce(
                  (a: number, b: { toolsRentPrice: number }) =>
                    a +
                    b.toolsRentPrice *
                      diffDays(Data?.rentDate, Data?.rentReturn),
                  0
                )
              )}
            </Text>
          </View>
          <Button
            isLoading={isLoading}
            containerStyle={{ margin: spacing.md }}
            title="Buat Sewa"
            onPress={() => handleBulkCreate()}
          />
        </ScrollView>
        <Toast />
      </ReactNativeModal>
    </View>
  );
}

const styles = StyleSheet.create({
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: corner.lg,
    borderTopRightRadius: corner.lg,
    width: "100%",
    gap: spacing.sm,
  },
  modal: {
    justifyContent: "flex-end",
    margin: 0,
  },
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
