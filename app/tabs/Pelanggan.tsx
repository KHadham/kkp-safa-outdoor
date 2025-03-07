import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  useColorScheme,
  RefreshControl,
} from "react-native";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { useNavigation, useRouter } from "expo-router";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { Button, Text } from "@/components";
import Icons from "@expo/vector-icons/MaterialCommunityIcons";
import { Image } from "expo-image";
import { sizes, spacing } from "@/constants/measure";
import { Colors } from "@/constants/Colors";
import dayjs from "dayjs";
import { shadowGenerator } from "@/utils/uiHandler";

export default function TabTwoScreen() {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const router = useRouter(); // Initialize the router

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setisLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
    const unsubscribe = navigation.addListener("focus", () => fetchCustomers());
    return unsubscribe;
  }, [navigation]);

  // Fetch customers from Firestore

  const fetchCustomers = async () => {
    setisLoading(true);
    try {
      const db = getFirestore();
      const querySnapshot = await getDocs(collection(db, "customers"));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCustomers(data as Customer[]);
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setisLoading(false);
    }
  };

  const customerPlaceholder = (item: Customer) => {
    return (
      <TouchableOpacity
        style={{ alignItems: "center" }}
        onPress={() =>
          router.push({
            pathname: "/pelanggan/history",
            params: { id: item.id },
          })
        }
      >
        <Image
          style={styles.image}
          placeholder={"https://placehold.co/400?text=belum-ada-foto"}
          source={{
            uri:
              item?.doc_person ||
              item?.doc_npwp ||
              item?.doc_ktp ||
              item?.doc_sim,
          }}
        />
        <Text
          style={[
            {
              backgroundColor:
                item.rentCount > 0
                  ? Colors[colorScheme ?? "light"].success_bg
                  : Colors[colorScheme ?? "light"].error_bg,
            },
            styles.rentCount,
          ]}
        >
          {item?.rentStatus
            ? "Lagi Sewa"
            : item.rentCount > 0
            ? `Sewa ${item.rentCount}x`
            : "Belum sewa"}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item }: { item: Customer }) => (
    <View
      style={[
        styles.itemContainer,
        {
          backgroundColor: Colors[colorScheme ?? "light"].background,
          borderColor: Colors[colorScheme ?? "light"].border,
        },
      ]}
    >
      {customerPlaceholder(item)}
      <TouchableOpacity
        style={{ flex: 1 }}
        onPress={() =>
          router.push({
            pathname: "/pelanggan/detail",
            params: {
              customer: JSON.stringify(item),
              doc_ktp: encodeURIComponent(item?.doc_ktp || ""),
              doc_npwp: encodeURIComponent(item?.doc_npwp || ""),
              doc_sim: encodeURIComponent(item?.doc_sim || ""),
              doc_person: encodeURIComponent(item?.doc_person || ""),
            },
          })
        }
      >
        <Text fontWeight="bold">{item.fullName}</Text>
        <Text fontWeight="light" size="sm">
          {item.address}
        </Text>
        <Text fontWeight="light" size="sm">
          {item.phone}
        </Text>
        {item?.lastRent && (
          <Text fontWeight="light" size="xs">
            Terakhir sewa :{" "}
            {dayjs.unix(item?.lastRent?.seconds).format("DD MMMM YYYY")}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );

  if (!customers) return null;

  return (
    <>
      <ParallaxScrollView
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => fetchCustomers()}
            tintColor={Colors[colorScheme ?? "light"].primary}
            colors={[Colors[colorScheme ?? "light"].primary]}
          />
        }
        headerBackgroundColor={{
          light: Colors.light.success_bg,
          dark: Colors.dark.success_bg,
        }}
        headerImage={
          <Icons
            color={Colors[colorScheme ?? "light"].success}
            name="account-multiple"
            size={200}
          />
        }
        headerText={"Pelanggan"}
      >
        <FlatList
          ItemSeparatorComponent={() => <View style={{ margin: spacing.xs }} />}
          scrollEnabled={false}
          data={customers}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
        />
        <Button
          isLoading={isLoading}
          title="Tambah Data"
          onPress={() =>
            router.push({
              pathname: "/pelanggan/create",
            })
          }
        />
      </ParallaxScrollView>
    </>
  );
}

const styles = StyleSheet.create({
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
  },
  rentCount: {
    padding: spacing.xxs,
    width: "100%",
    textAlign: "center",
    position: "absolute",
    bottom: 0,
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
