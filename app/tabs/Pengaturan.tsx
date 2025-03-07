import {
  StyleSheet,
  Image,
  Platform,
  View,
  FlatList,
  TouchableOpacity,
  useColorScheme,
  KeyboardAvoidingView,
} from "react-native";

// import { View } from '@/components/View';
import { onAuthStateChanged, signOut, updateProfile } from "firebase/auth";
import { useEffect, useState } from "react";
import { app, auth } from "@/firebaseConfig";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { Button, ImagePicker, Input, Text } from "@/components";
import dayjs from "dayjs";
import { spacing } from "@/constants/measure";
import Icon from "@expo/vector-icons/MaterialCommunityIcons";
import { Colors } from "@/constants/Colors";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import Toast from "react-native-toast-message";
import { hasChanges } from "@/utils";

export default function TabTwoScreen() {
  const colorScheme = useColorScheme();
  const db = getFirestore(app);
  const storage = getStorage(app);

  const [isLoading, setisLoading] = useState(false);
  const [modalPicker, setmodalPicker] = useState(false);
  const [userObject, setuserObject] = useState<any>({});
  const [originalUserObject, setOriginalUserObject] = useState<any>({}); // Store the original data
  const [rentalsCount, setRentalsCount] = useState<number>(0);

  const getRentalsCountByUid = async (uid: string) => {
    try {
      // Create a reference to the 'rentals' collection
      const rentalsRef = collection(db, "rentals");
      const rentalsQuery = query(rentalsRef, where("createdById", "==", uid));

      // Execute the query
      const querySnapshot = await getDocs(rentalsQuery);
      // Get the total count of matching documents
      const count = querySnapshot.size;
      setRentalsCount(count);
      return count;
    } catch (error) {
      console.error("Error getting rentals count:", error);
    }
  };

  const updateDisplayName = async (newDisplayName: string) => {
    const user = auth.currentUser;

    if (user) {
      try {
        await updateProfile(user, {
          displayName: newDisplayName,
        });
        console.log("Display name updated successfully");
      } catch (error) {
        console.error("Error updating display name:", error);
      }
    } else {
      console.log("No user is currently signed in.");
    }
  };

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      readUserData(user.uid);
      getRentalsCountByUid(user.uid);
    } else {
      console.log("No user is currently authenticated");
    }
  }, []);

  const logout = async () => {
    setisLoading(true);
    try {
      await signOut(auth);
      console.log("User logged out successfully");
    } catch (error) {
      console.error("Error logging out:", error);
    } finally {
      setisLoading(false);
    }
  };

  const readUserData = async (uid: string) => {
    setisLoading(true);
    try {
      const docRef = doc(db, "userDetail", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setuserObject(data);
        setOriginalUserObject(data); // Save the original data for comparison
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error reading user data:", error);
    } finally {
      setisLoading(false);
    }
  };

  const handleEditPhoto = async (imageData: any) => {
    setisLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("No user is currently authenticated");
      }

      const { uri, fileName } = imageData;

      // Get the current photo URL from the user object
      const currentPhotoURL = userObject.photoProfile;

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
      const storageRef = ref(
        storage,
        `profilePictures/${user.uid}/${fileName}`
      );
      await uploadBytes(storageRef, blob);

      // Get the Download URL
      const downloadURL = await getDownloadURL(storageRef);
      console.log("New profile photo URL:", downloadURL);

      // Update Firestore with the new photo URL
      const userRef = doc(db, "userDetail", user.uid);
      await updateDoc(userRef, { photoProfile: downloadURL });

      // Update local state
      setuserObject((prev: any) => ({ ...prev, photoProfile: downloadURL }));

      console.log("Profile photo updated successfully");
    } catch (error) {
      console.error("Error updating profile photo:", error);
    } finally {
      setisLoading(false);
      setmodalPicker(false);
    }
  };

  const userDetails = [
    {
      label: "Nama Lengkap",
      value: userObject?.fullName,
      key: "fullName",
      disabled: false,
    },
    {
      label: "Alamat",
      value: userObject?.address,
      key: "address",
      disabled: false,
      type: "area",
    },
    {
      label: "Email",
      value: auth.currentUser?.email,
      key: "email",
      disabled: true,
    },
    {
      label: "Total Catatan Sewa",
      value: `${rentalsCount} catatan`,
      key: "rentalsCount",
      disabled: true,
    },
    {
      label: "Tanggal Mendaftar",
      value: dayjs.unix(userObject?.createdAt?.seconds).format("DD MMMM YYYY"),
      key: "createdAt",
      disabled: true,
    },
    {
      label: "Terakhir Update",
      value: dayjs.unix(userObject?.updatedAt?.seconds).format("DD MMMM YYYY"),
      key: "updatedAt",
      disabled: true,
    },
  ];

  const handleBulkUpdate = async () => {
    if (!hasChanges(originalUserObject, userObject)) {
      Toast.show({
        type: "info",
        text1: "Tidak ada perubahan untuk disimpan",
      });
      return;
    }

    setisLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("No user is currently authenticated");
      }

      // Collect all updated data into an object
      const updatedData = {
        fullName: userObject.fullName,
        address: userObject.address,
        updatedAt: new Date(),
        // Add any other fields you want to update here
      };
      updateDisplayName(userObject.fullName);
      // Update the Firestore document with the bulk data
      const userRef = doc(db, "userDetail", user.uid);
      await updateDoc(userRef, updatedData);

      // Optionally, update the local state (userObject) to reflect the changes
      setuserObject((prev: any) => ({
        ...prev,
        ...updatedData,
      }));

      Toast.show({
        type: "success",
        text1: "Data berhasil diperbarui",
      });
    } catch (error) {
      console.error("Error updating user data:", error);
    } finally {
      setisLoading(false);
    }
  };

  const handleInputChange = (key: string, value: string) => {
    setuserObject((prevData: any) => ({
      ...prevData,
      [key]: value,
    }));
  };

  const renderItem = ({
    item,
  }: {
    item: {
      label: string;
      value: string;
      key: string;
      disabled?: boolean;
      type?: any;
    };
  }) => {
    return (
      <KeyboardAvoidingView
        style={styles.detailItem}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <Input
          label={item.label}
          value={item.value}
          onChangeText={(text) => handleInputChange(item.key, text)}
          editable={!isLoading && !item?.disabled}
          type={item?.type}
        />
      </KeyboardAvoidingView>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        ListHeaderComponent={
          <View style={styles.profileContainer}>
            <View style={{}}>
              <Image
                source={{
                  uri: userObject.photoProfile,
                }}
                style={styles.profileImage}
              />
              <Icon
                name="pencil-circle-outline"
                style={styles.editButton}
                onPress={() => setmodalPicker(true)}
                size={30}
                color={Colors[colorScheme ?? "light"].text_light}
              />
            </View>
          </View>
        }
        keyboardShouldPersistTaps="always"
        data={userDetails}
        keyExtractor={(item) => item.label}
        renderItem={renderItem}
        contentContainerStyle={styles.detailsContainer}
        ItemSeparatorComponent={() => <View style={{ borderBottomWidth: 1 }} />}
        ListFooterComponent={
          <Button
            containerStyle={{ marginTop: spacing.sm }}
            event="error"
            title="Logout"
            icon="logout"
            onPress={logout}
            isLoading={isLoading}
          />
        }
      />
      <ImagePicker
        isLoading={isLoading}
        title={"Ganti Profil Foto"}
        visible={modalPicker}
        onClose={() => setmodalPicker(false)}
        onConfirm={handleEditPhoto}
      />
      <Button
        disabled={hasChanges(originalUserObject, userObject)}
        containerStyle={{ margin: spacing.md }}
        title="Simpan Perubahan"
        onPress={handleBulkUpdate}
        isLoading={isLoading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  profileContainer: {
    alignItems: "center",
    // marginBottom: 20,
  },
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    // alignItems: "center",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginTop: 30,
    marginBottom: 20,
  },
  detailsContainer: {
    backgroundColor: "#ffffff",
    padding: spacing.md,
  },
  detailItem: {
    paddingVertical: spacing.sm,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#495057",
  },

  editButton: {
    position: "absolute",
    zIndex: 10,
    bottom: 10,
    right: 0,
    backgroundColor: "#007bff",
    borderRadius: 999,
  },
});
