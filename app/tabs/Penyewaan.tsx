import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  useColorScheme,
  RefreshControl,
} from "react-native";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { useNavigation, useRouter } from "expo-router";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { Button, Text } from "@/components";
import Icons from "@expo/vector-icons/MaterialCommunityIcons";
import { Image } from "expo-image";
import { corner, spacing } from "@/constants/measure";
import { Colors } from "@/constants/Colors";
import { shadowGenerator } from "@/utils/uiHandler";
import { Tool } from "@/types/Tools";
import { app, auth } from "@/firebaseConfig";
import { formatRupiah } from "@/utils";
import Toast from "react-native-toast-message";
import dayjs from "dayjs";

export default function TabTwoScreen() {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const db = getFirestore(app);

  const router = useRouter(); // Initialize the router

  const [rentalData, setCustomers] = useState<RentalHistory[]>([]);
  const [isLoading, setisLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
    const unsubscribe = navigation.addListener("focus", () => fetchCustomers());
    return unsubscribe;
  }, [navigation]);

  const fetchCustomers = async () => {
    setisLoading(true);
    try {
      const q = query(collection(db, "rentals"), orderBy("createdAt", "desc")); // Sort by createdAt in descending order
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCustomers(data as RentalHistory[]);
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setisLoading(false);
    }
  };

  const renderItem = ({ item }: { item: RentalHistory }) => (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: "/penyewaan/detail",
          params: {
            details: JSON.stringify(item),
            items: !item.items
              ? [""]
              : encodeURIComponent(
                  JSON.stringify(item.items.map((tool) => JSON.stringify(tool)))
                ),
          },
        })
      }
    >
      <View
        style={{
          borderWidth: 1,
          borderBottomWidth: 0,
          borderColor: Colors[colorScheme ?? "light"].border,
          padding: spacing.xs,
          backgroundColor:
            item.status == "selesai"
              ? Colors[colorScheme ?? "light"].success_bg
              : item.status == "berlangsung"
              ? Colors[colorScheme ?? "light"].warning_bg
              : Colors[colorScheme ?? "light"].error_bg,
        }}
      >
        <View style={styles.row}>
          <View style={styles.row}>
            <Text fontWeight="light" size="xs">
              {dayjs.unix(item.rentDate?.seconds).format("dddd, DD-MM-YYYY")}
            </Text>
            <Text fontWeight="light" size="xs">
              {" "}
              -{" "}
            </Text>
            <Text fontWeight="light" size="xs">
              {dayjs.unix(item.rentReturn?.seconds).format("dddd, DD-MM-YYYY")}
            </Text>
          </View>
          <Text fontWeight="light" size="xs">
            id: {item.id.slice(-5)}
          </Text>
        </View>
      </View>
      <View
        style={{
          padding: spacing.sm,
          gap: spacing.xs,
          backgroundColor: Colors[colorScheme ?? "light"].background,
          borderWidth: 1,
          borderColor: Colors[colorScheme ?? "light"].border,
        }}
      >
        <View style={styles.row}>
          <Text
            fontWeight="bold"
            color={Colors[colorScheme ?? "light"].primary}
          >
            {item.customerName}
          </Text>
          <View style={styles.row}>
            <Icons name="map-marker" size={20} color="red" />
            <Text
              fontWeight="bold"
              color={Colors[colorScheme ?? "light"].success}
            >
              {item.destination}
            </Text>
          </View>
        </View>
        <View style={styles.row}>
          <Text
            fontWeight="bold"
            color={Colors[colorScheme ?? "light"].success}
          >
            {formatRupiah(item.rentNominal)}
          </Text>
          <Text
            fontWeight="bold"
            color={
              item.status == "selesai"
                ? Colors[colorScheme ?? "light"].success
                : item.status == "berlangsung"
                ? Colors[colorScheme ?? "light"].warning
                : Colors[colorScheme ?? "light"].error
            }
          >
            {item.status.toUpperCase()}
          </Text>
        </View>

        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text>
            Sewa {item.rentLength} hari{" "}
            {dayjs(item.rentReturn?.seconds * 1000).diff(
              dayjs(item.rentDate?.seconds * 1000),
              "day"
            ) > parseInt(item.rentLength) && (
              <Text color="red">{`(Terlambat ${dayjs(
                item.rentReturn?.seconds * 1000
              ).diff(
                dayjs(item.rentDate?.seconds * 1000),
                "day"
              )} Hari)`}</Text>
            )}
          </Text>
          <Text>{item.items.length} Barang</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (!rentalData) return null;

  return (
    <>
      <ParallaxScrollView
        headerBackgroundColor={{
          light: Colors.light.error_bg,
          dark: Colors.dark.error_bg,
        }}
        headerImage={
          <Icons
            color={Colors[colorScheme ?? "light"].error}
            name="receipt"
            size={200}
          />
        }
        headerText={"Penyewaan"}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => fetchCustomers()}
            tintColor={Colors[colorScheme ?? "light"].primary}
            colors={[Colors[colorScheme ?? "light"].primary]}
          />
        }
      >
        <FlatList
          ItemSeparatorComponent={() => <View style={{ margin: spacing.xs }} />}
          scrollEnabled={false}
          data={rentalData}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
        />
        <Button
          isLoading={isLoading}
          title="Buat Sewa"
          onPress={() =>
            router.push({
              pathname: "/penyewaan/create",
            })
          }
        />
      </ParallaxScrollView>
    </>
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
  image: {
    width: 100,
    height: 100,
  },
  fab: {
    position: "absolute",
    zIndex: 10,
    bottom: spacing.md,
    right: spacing.lg,
    borderRadius: 100,
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.xs,
  },
  rentCount: {
    width: "100%",
    textAlign: "center",
    position: "absolute",
    bottom: 0,
  },
  toolId: {
    padding: spacing.xxs,
    width: "100%",
    textAlign: "center",
    position: "absolute",
    top: 0,
  },
  headerImage: {
    color: "#808080",
    bottom: -90,
    left: -35,
    position: "absolute",
  },
  loadingText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
  },
  listContainer: {
    flex: 1,
  },
  itemContainer: {
    flexDirection: "row",
    alignContent: "center",
    gap: spacing.sm,
    ...shadowGenerator(5),
    borderWidth: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  itemEmail: {
    fontSize: 14,
    color: "#666",
  },
});
