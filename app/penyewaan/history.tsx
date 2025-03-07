import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  useColorScheme,
  RefreshControl,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Header, Text } from "@/components";
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
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function CustomerDetail() {
  const db = getFirestore(app);

  const colorScheme = useColorScheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [isLoading, setisLoading] = useState(false);

  const [history, setHistory] = useState<any[]>([]);

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
            toolIds: data.toolIds,
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
      <View style={styles.row}>
        <Text fontWeight="bold" color={Colors[colorScheme ?? "light"].primary}>
          {item.customerName}
        </Text>
        <Text fontWeight="bold"> Sewa {item.rentLength} hari </Text>
      </View>
      <View>
        <View style={styles.row}>
          <Text>{dayjs.unix(item.rentDate?.seconds).format("dddd")}</Text>
          <View
            style={{
              borderWidth: 1,
              flex: 0.8,
              borderStyle: "dashed",
              borderColor: "red",
            }}
          />
          <Text>{dayjs.unix(item.rentReturn?.seconds).format("dddd")}</Text>
        </View>
        <View style={styles.row}>
          <Text>
            <MaterialCommunityIcons name="calendar-start" size={20} />
            {dayjs.unix(item.rentDate?.seconds).format("DD-MM-YYYY")}
          </Text>
          <Text
            color={
              dayjs(item.rentReturn?.seconds * 1000).diff(
                dayjs(item.rentDate?.seconds * 1000),
                "day"
              ) > parseInt(item.rentLength)
                ? "red"
                : Colors[colorScheme ?? "light"].text
            }
          >
            <MaterialCommunityIcons name="calendar-end" size={20} />
            {dayjs.unix(item.rentReturn?.seconds).format("DD-MM-YYYY")}
          </Text>
        </View>
      </View>
      {dayjs(item.rentReturn?.seconds * 1000).diff(
        dayjs(item.rentDate?.seconds * 1000),
        "day"
      ) > parseInt(item.rentLength) && (
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text color="red">
            {`(Terlambat ${dayjs(item.rentReturn?.seconds * 1000).diff(
              dayjs(item.rentDate?.seconds * 1000),
              "day"
            )} Hari)`}
          </Text>
        </View>
      )}

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
                  {formatRupiah(item3.totalPrice)} x {item?.rentLength} Hari
                </Text>
                <View
                  style={{
                    borderWidth: 1,
                    flex: 0.8,
                    borderStyle: "dashed",
                    borderColor: "red",
                  }}
                />
                <Text
                  color={Colors[colorScheme ?? "light"].success}
                  fontWeight="bold"
                >
                  {formatRupiah(
                    Number(item3.totalPrice) * Number(item?.rentLength)
                  )}
                </Text>
              </View>
            </View>
          ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <Header
        title={"Riwayat Sewa"}
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
          flex: 1,
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
