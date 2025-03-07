import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  FlatList,
  Touchable,
  TouchableOpacity,
  useColorScheme,
  RefreshControl,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Button, Header, Text } from "@/components";
import EnhancedImageViewing from "react-native-image-viewing";
import { Image } from "expo-image";
import ImageViewer from "react-native-image-zoom-viewer";
import { widthByScreen } from "@/utils/dimension";
import { corner, spacing } from "@/constants/measure";
import dayjs from "dayjs";
import { diffDays, formatRupiah } from "@/utils";
import { Colors } from "@/constants/Colors";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  where,
} from "firebase/firestore";
import { app } from "@/firebaseConfig";
import { shadowGenerator } from "@/utils/uiHandler";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function CustomerDetail() {
  const db = getFirestore(app);

  const colorScheme = useColorScheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [isLoading, setisLoading] = useState(false);

  const [history, setHistory] = useState<RentalHistory[]>([]);

  const readData = async (uid: string) => {
    setisLoading(true);
    try {
      const q = query(
        collection(db, "rentals"),
        where("customerId", "==", uid)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const rentals = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            customerId: data.customerId,
            itemsRentals: data.itemsRentals,
            rentDate: data.rentDate,
            rentReturn: data.rentReturn,
            rentLength: data.rentLength,
            rentNominal: data.rentNominal,
            rentPerDay: data.rentPerDay,
            status: data.status,
            items: data.items,
            destination: data.destination,
            customerName: data.customerName,
            toolIds: data.toolIds,
            rentActualReturn: data.rentActualReturn,
            rentLateLength: data.rentLateLength,
            rentStatus: data.rentStatus,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            createdBy: data.createdBy,
            updatedBy: data.updatedBy,
            phone: data.phone,
            createdById: data.createdById,
            updatedById: data.updatedById,
          };
        });
        setHistory(rentals);
      } else {
        console.log("No rentals found for this customer.");
      }
    } catch (error) {
      console.error("Error reading user data:", error);
    } finally {
      setisLoading(false);
    }
  };

  useEffect(() => {
    readData(id);
  }, []);

  const renderItem = ({ item }: { item: RentalHistory }) => (
    <View
      style={{
        borderWidth: 1,
        borderColor: Colors[colorScheme ?? "light"].border,
        padding: spacing.sm,
        margin: spacing.md,
        borderRadius: corner.sm,
        gap: spacing.xs,
        backgroundColor: Colors[colorScheme ?? "light"].background,
      }}
    >
      <View>
        <Text fontWeight="bold" size="md">
          {item?.customerName}
        </Text>
        <Text size="md">
          <MaterialCommunityIcons name="map-marker" size={20} color="red" />
          {item?.destination}
        </Text>
      </View>
      <View>
        <View style={styles.row}>
          <Text fontWeight="light" size="xs">
            {dayjs.unix(item?.rentDate?.seconds).format("dddd, DD-MM-YYYY")}
          </Text>
          <Text fontWeight="light" size="xs">
            {dayjs.unix(item?.rentReturn?.seconds).format("dddd, DD-MM-YYYY")}
          </Text>
        </View>
        {item?.rentActualReturn && (
          <View style={styles.row}>
            <Text fontWeight="light" size="xs">
              Dikembalikan pada{" "}
              {dayjs
                .unix(item?.rentActualReturn?.seconds)
                .format("dddd, DD-MM-YYYY")}
            </Text>
            {item?.rentLateLength && (
              <Text fontWeight="bold" size="xs" color="red">
                Telat {item?.rentLateLength} Hari
              </Text>
            )}
          </View>
        )}

        <View style={styles.row}>
          <Text fontWeight="light" size="xs">
            Dicatat oleh
          </Text>
          <Text fontWeight="light" size="xs">
            {item?.createdBy}
          </Text>
        </View>

        {item?.updatedBy && (
          <View style={styles.row}>
            <Text fontWeight="light" size="xs">
              Diperbarui oleh
            </Text>
            <Text fontWeight="light" size="xs">
              {item?.updatedBy}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.row}>
        <Text color={Colors[colorScheme ?? "light"].success} fontWeight="bold">
          {formatRupiah(item?.rentPerDay)} x {item?.rentLength} hari ={" "}
        </Text>
        <Text color={Colors[colorScheme ?? "light"].success} fontWeight="bold">
          {formatRupiah(item?.rentNominal)}
        </Text>
      </View>
      {item?.items?.map &&
        item?.items.map((item1) => (
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
                {formatRupiah(item1.price)} x {item?.rentLength} hari
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
      {item?.status == "selesai" ? (
        <Button
          disabled
          isLoading={isLoading}
          title="sudah selesai"
          onPress={() => {}}
          event="success"
          icon="check"
        />
      ) : item?.status == "booking" ? (
        <Button
          disabled
          isLoading={isLoading}
          title={
            "Booking" +
            diffDays(
              dayjs.unix(item?.rentDate?.seconds).format("DD-MM-YYYY"),
              dayjs().format("DD-MM-YYYY")
            ) +
            " Hari lagi"
          }
          onPress={() => {}}
          event="info"
          icon="book-clock"
        />
      ) : item?.status == "batal" ? (
        <Button
          disabled
          isLoading={isLoading}
          title="Dibatalkan"
          onPress={() => {}}
          event="error"
          icon="cancel"
        />
      ) : (
        <Button
          disabled
          isLoading={isLoading}
          title="Berlangsung"
          onPress={() => {}}
          event="warning"
          icon="alert-circle-outline"
        />
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title={"Riwayat Sewa"} subtitle={`userId: ${id.slice(-5)}`} />
      <FlatList
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => readData(id)}
            tintColor={Colors[colorScheme ?? "light"].primary}
          />
        }
        data={history}
        renderItem={renderItem}
        contentContainerStyle={{
          backgroundColor: Colors[colorScheme ?? "light"].background,
        }}
        ListEmptyComponent={
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <MaterialCommunityIcons
              name="close-circle"
              size={50}
              color={Colors[colorScheme ?? "light"].error}
            />
            <Text>Belum Ada Data Sewa</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
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
