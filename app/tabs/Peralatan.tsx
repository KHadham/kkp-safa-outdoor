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
import { spacing } from "@/constants/measure";
import { Colors } from "@/constants/Colors";
import { shadowGenerator } from "@/utils/uiHandler";
import { Tool } from "@/types/Tools";
import { app, auth } from "@/firebaseConfig";
import { formatRupiah } from "@/utils";
import Toast from "react-native-toast-message";

export default function TabTwoScreen() {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const db = getFirestore(app);

  const router = useRouter(); // Initialize the router

  const [customers, setCustomers] = useState<Tool[]>([]);
  const [isLoading, setisLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<Tool[]>([]);

  useEffect(() => {
    fetchCustomers();
    const unsubscribe = navigation.addListener("focus", () => fetchCustomers());
    return unsubscribe;
  }, [navigation]);

  // Fetch customers from Firestore

  const fetchCustomers = async () => {
    setisLoading(true);
    try {
      const db = getFirestore(app);
      const q = query(collection(db, "tools"), orderBy("createdAt", "desc")); // Sort by createdAt in descending order
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCustomers(data as Tool[]);
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setisLoading(false);
    }
  };

  const toggleSelection = (item: Tool) => {
    setSelectedItems((prev) =>
      prev.find((selected) => selected.id === item.id)
        ? prev.filter((selected) => selected.id !== item.id)
        : [...prev, item]
    );
  };

  const handleDuplicate = async () => {
    if (!selectedItems || selectedItems.length === 0) return;

    try {
      // Use Promise.all to ensure sequential execution of addDoc for each item
      await Promise.all(
        selectedItems.map(async (item) => {
          const { id, imageUrl, updatedAt, updatedBy, ...dataToAdd } = item;
          await addDoc(collection(db, "tools"), {
            ...dataToAdd,
            toolsAvailability: true,
            toolsCondition: "Baik",
            rentCount: 0,
            imageUrl: [],
            createdAt: new Date(),
            createdBy: auth?.currentUser?.displayName,
          });
        })
      );

      await fetchCustomers();
      setSelectedItems([]); // Clear selection after duplication
      Toast.show({
        type: "success",
        text1: "Berhasil salin data",
      });
    } catch (error) {
      console.log("error", error);
      Toast.show({
        type: "error",
        text1: "Error saat salin data",
      });
    }
  };

  const customerPlaceholder = (item: Tool) => {
    return (
      <TouchableOpacity
        style={{
          alignItems: "center",
          borderRightWidth: 1,
          borderColor: Colors[colorScheme ?? "light"].border,
        }}
        onLongPress={() => toggleSelection(item)}
        onPress={() => selectedItems.length > 0 && toggleSelection(item)}
      >
        {item.rentCount > 0 && (
          <Text
            style={{
              backgroundColor: Colors[colorScheme ?? "light"].info_bg,
              position: "absolute",
              top: 0,
              left: 0,
              zIndex: 10,
              width: "100%",
              textAlign: "center",
            }}
            fontWeight="bold"
            color={Colors[colorScheme ?? "light"].text}
            size="xs"
          >
            disewa {item.rentCount > 99 ? "99+" : item.rentCount}x
          </Text>
        )}
        <Image
          style={styles.image}
          placeholder={"https://placehold.co/400?text=belum-ada-foto"}
          source={{
            uri: item?.imageUrl?.[0],
          }}
        />
        <Text
          style={[
            {
              backgroundColor: Colors[colorScheme ?? "light"].info_bg,
            },
            styles.rentCount,
          ]}
        >
          <Text fontWeight="bold" size="xs">
            {item.category}-{item.sizes}
          </Text>
        </Text>
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item }: { item: Tool }) => {
    const isSelected = selectedItems.some(
      (selected) => selected.id === item.id
    );
    return (
      <View
        style={[
          styles.itemContainer,
          {
            backgroundColor: Colors[colorScheme ?? "light"].background,
            borderColor: isSelected
              ? Colors[colorScheme ?? "light"].error
              : Colors[colorScheme ?? "light"].border,
          },
        ]}
      >
        {customerPlaceholder(item)}
        {isSelected && (
          <Icons
            name="checkbox-marked-outline"
            color={Colors[colorScheme ?? "light"].error}
            size={35}
            style={{ position: "absolute", left: 0 }}
          />
        )}
        <TouchableOpacity
          style={{ flex: 1, padding: spacing.xs }}
          onLongPress={() => toggleSelection(item)}
          onPress={() => {
            isSelected
              ? toggleSelection(item)
              : router.navigate({
                  pathname: "/peralatan/detail",
                  params: {
                    details: JSON.stringify(item),
                    imageUrl: !item.imageUrl
                      ? [""]
                      : encodeURIComponent(
                          JSON.stringify(
                            item.imageUrl.map((image) =>
                              encodeURIComponent(image)
                            )
                          )
                        ),
                  },
                });
          }}
        >
          <Text
            fontWeight="bold"
            color={Colors[colorScheme ?? "light"].primary}
            isLoading={isLoading && isSelected}
          >
            {item.toolsName}
          </Text>
          <Text fontWeight="bold" isLoading={isLoading && isSelected}>
            {formatRupiah(item.toolsRentPrice)} / hari
          </Text>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text
              fontWeight="bold"
              size="xs"
              color={!item?.toolsAvailability ? "red" : "black"}
            >
              {!item?.toolsAvailability
                ? "SEDANG DISEWA"
                : `Kondisi : ${item?.toolsCondition?.toUpperCase()}`}
            </Text>
            <Text fontWeight="light" size="xs">
              {item.id.slice(-5)}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  if (!customers) return null;

  return (
    <>
      <ParallaxScrollView
        headerBackgroundColor={{
          light: Colors.light.warning_bg,
          dark: Colors.dark.warning_bg,
        }}
        headerImage={
          <Icons
            color={Colors[colorScheme ?? "light"].warning}
            name="tools"
            size={200}
          />
        }
        headerText={"Alat-alat"}
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
          data={customers}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
        />
        {selectedItems.length > 0 ? (
          <Button
            isLoading={isLoading}
            title="Salin Data"
            onPress={handleDuplicate}
          />
        ) : (
          <Button
            isLoading={isLoading}
            title="Tambah Alat"
            onPress={() =>
              router.push({
                pathname: "/peralatan/create",
              })
            }
          />
        )}
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
