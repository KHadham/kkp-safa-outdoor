import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  useColorScheme,
  RefreshControl,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Button, Header, Text } from "@/components";
import { corner, spacing } from "@/constants/measure";
import dayjs from "dayjs";
import { formatRupiah } from "@/utils";
import { Colors } from "@/constants/Colors";
import {
  collection,
  getDocs,
  getFirestore,
  query,
  where,
} from "firebase/firestore";
import { app } from "@/firebaseConfig";
import { shadowGenerator } from "@/utils/uiHandler";
import Icons from "@expo/vector-icons/MaterialCommunityIcons";

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
        where("toolIds", "array-contains", uid)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const rentals = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            customerId: data.customerId,
            customerName: data.customerName,
            itemsRentals: data.itemsRentals,
            rentDate: data.rentDate,
            rentReturn: data.rentReturn,
            rentLength: data.rentLength,
            rentNominal: data.rentNominal,
            rentPerDay: data.rentPerDay,
            status: data.status,
            items: data.items,
            createdBy: data.createdBy,
            createdById: data.createdById,
            createdAt: data.createdAt,
            updatedBy: data.updatedBy,
            updatedById: data.updatedById,
            updatedAt: data.updatedAt,
            destination: data.destination,
            toolIds: data.toolIds,
            rentActualReturn: data.rentActualReturn,
            rentLateLength: data.rentLateLength,
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
        ...shadowGenerator(5),
        padding: spacing.sm,
        margin: spacing.md,
        borderRadius: corner.sm,
        gap: spacing.xs,
        backgroundColor: Colors[colorScheme ?? "light"].background,
      }}
    >
      <View>
        <View style={styles.row}>
          <Text fontWeight="bold" size="md">
            {item?.customerName}
          </Text>
          <View style={styles.row}>
            <Icons name="map-marker" size={20} color={"red"} />
            <Text fontWeight="bold" size="md">
              {item?.destination}
            </Text>
          </View>
        </View>
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

        <View
          style={{
            borderTopWidth: 1,
            borderColor: Colors[colorScheme ?? "light"].border,
            marginVertical: spacing.xs,
          }}
        />
        <View style={styles.row}>
          <Text>Dicatat oleh</Text>
          <Text>Diperbaharui oleh</Text>
        </View>

        <View style={styles.row}>
          <View>
            <Text fontWeight="light" size="xs">
              {item?.createdBy}
            </Text>
            <Text fontWeight="light" size="xs">
              {dayjs.unix(item?.createdAt?.seconds).format("dddd, DD-MM-YYYY")}
            </Text>
          </View>
          <View>
            <Text fontWeight="light" size="xs">
              {item?.updatedBy}
            </Text>
            <Text fontWeight="light" size="xs" style={{ textAlign: "right" }}>
              {dayjs.unix(item?.updatedAt?.seconds).format("dddd, DD-MM-YYYY")}
            </Text>
          </View>
        </View>
      </View>

      {item?.items?.filter &&
        item?.items
          .filter((item2) => item2.toolId === id) // Filter items by toolId
          .map((item3) => (
            <View
              key={item3.toolId}
              style={{
                borderWidth: 1,
                borderRadius: corner.sm,
                padding: spacing.xs,
                borderColor: Colors[colorScheme ?? "light"].border,
              }}
            >
              <Text
                fontWeight="bold"
                color={Colors[colorScheme ?? "light"].primary}
              >
                {item3.toolName}
              </Text>
              <View style={styles.row}>
                <Text
                  color={Colors[colorScheme ?? "light"].success}
                  fontWeight="bold"
                >
                  {formatRupiah(item3.price)} x {item?.rentLength} Hari
                </Text>
                <Text
                  color={Colors[colorScheme ?? "light"].success}
                  fontWeight="bold"
                >
                  {formatRupiah(item3.totalPrice)}
                </Text>
              </View>
            </View>
          ))}
      {item?.status == "selesai" && (
        <Button
          disabled
          isLoading={isLoading}
          title="Sewa selesai pada"
          subTitle={dayjs
            .unix(item?.rentActualReturn?.seconds)
            .format("dddd, DD-MM-YYYY")}
          onPress={() => {}}
          event="success"
          icon="check"
        />
      )}
      {item?.status == "batal" && (
        <Button
          disabled
          isLoading={isLoading}
          title="Dibatalkan"
          onPress={() => {}}
          event="error"
          icon="cancel"
        />
      )}
      {item?.status == "berlangsung" && (
        <Button
          disabled
          isLoading={isLoading}
          title="Sewa sedang berlangsung"
          onPress={() => {}}
          event="warning"
          icon="alert"
        />
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Header
        title={"Riwayat Alat"}
        subtitle={`Id Inventaris: ${id.slice(-5)}`}
      />
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
            <Icons
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
