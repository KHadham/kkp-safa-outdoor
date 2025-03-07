import Button from "./Button";
import Text from "./Text";

import { shadowGenerator } from "@/utils/uiHandler";
import React, { useEffect, useState } from "react";
import { StyleSheet, Pressable, View, ModalProps } from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import { corner, sizes, spacing } from "@/constants/measure";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { widthByScreen } from "@/utils/dimension";
import Animated, { LinearTransition } from "react-native-reanimated";
import Icon from "@expo/vector-icons/MaterialCommunityIcons";
import ReactNativeModal from "react-native-modal";
// import * as DocumentPicker from "expo-document-picker";

interface HeaderProps extends ModalProps {
  title: string;
  visible: boolean;
  onClose?: () => void;
  onConfirm?: (file: any) => void;
  isLoading?: boolean;
  eventMessage?: string;
}

const App: React.FC<HeaderProps> = ({
  title,
  visible,
  onClose,
  onConfirm,
  isLoading,
  eventMessage,
  ...restProps
}) => {
  const [file, setFile] = useState<any>(null);
  const [isCanceling, setisCanceling] = useState<boolean>(false);

  useEffect(() => {
    if (visible) {
      setFile(null);
    }
  }, [visible]);

  const pickImage = async (fromCamera = false) => {
    try {
      const result = fromCamera
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            // aspect: [4, 3],
            quality: 0.3,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            // aspect: [4, 3],
            quality: 0.3,
          });

      if (!result.canceled) {
        setFile(result.assets[0]);
      }
    } catch (error) {
      console.error("Failed to pick image:", error);
    }
  };

  const pickDocument = async () => {
    // try {
    //   const result = await DocumentPicker.getDocumentAsync({
    //     type: ["image/*", "application/pdf"], // Accept only images or PDFs
    //     multiple: false,
    //   });
    //   if (!result.canceled && result.assets && result.assets.length > 0) {
    //     setFile(result.assets[0]);
    //   }
    // } catch (error) {
    //   console.error("Failed to pick document:", error);
    // }
  };

  const mainView = () => {
    if (eventMessage) {
      return (
        <View style={styles.modalView}>
          <Text
            size="md"
            fontWeight="bold"
            style={{ marginBottom: spacing.md }}
          >
            {eventMessage}
          </Text>
          <Button
            title="Tutup"
            event="error"
            onPress={() => {
              setisCanceling(false);
              onClose?.();
              setFile(null);
            }}
          />
        </View>
      );
    } else if (isCanceling && file !== null) {
      return (
        <Animated.View layout={LinearTransition} style={styles.modalView}>
          <Text style={styles.modalText} fontWeight="bold" size="lg">
            Yakin Batal ?
          </Text>
          <Text style={styles.modalText} fontWeight="bold">
            Kalau batal file ini akan dihapus
          </Text>
          {file.uri && file.mimeType?.startsWith("image/") && (
            <Image
              source={{ uri: file.uri }}
              style={styles.image}
              contentFit="contain"
            />
          )}
          <View
            style={{
              flexDirection: "row",
              gap: spacing.sm,
              marginTop: spacing.md,
            }}
          >
            <Button
              isLoading={isLoading}
              title="Batal"
              event="error"
              onPress={() => {
                setisCanceling(false);
                onClose?.();
                setFile(null);
              }}
              containerStyle={{ flex: 1 }}
            />
            <Button
              isLoading={isLoading}
              title="Kirim"
              onPress={() => {
                onConfirm?.(file);
                setisCanceling(false);
              }}
              containerStyle={{ flex: 1 }}
            />
          </View>
        </Animated.View>
      );
    } else {
      return (
        <View style={styles.modalView}>
          {file ? (
            file.mimeType?.startsWith("image/") ? (
              <Image
                source={{ uri: file.uri }}
                style={styles.image}
                contentFit="contain"
              />
            ) : (
              <Text style={{ marginBottom: spacing.sm }} size="sm">
                File: {file.name}
              </Text>
            )
          ) : (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: spacing.md,
              }}
            >
              <Text fontWeight="bold" size="md">
                Ambil File Dari
              </Text>
              <Icon name="close" size={sizes.xl} onPress={() => onClose?.()} />
            </View>
          )}

          {file ? (
            <Button
              isLoading={isLoading}
              title="Kirim File"
              onPress={() => {
                onConfirm?.(file);
                setisCanceling(false);
              }}
            />
          ) : (
            <View
              style={{
                gap: spacing.sm,
              }}
            >
              <Button
                icon="file-document"
                title="Dokumen"
                onPress={pickDocument}
              />
              <Button
                icon="file-image"
                title="Galeri"
                onPress={() => pickImage(false)}
              />
              <Button
                icon="camera"
                title="Kamera"
                onPress={() => pickImage(true)}
              />
            </View>
          )}
        </View>
      );
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.centeredView}>
        <ReactNativeModal {...restProps} isVisible={visible} onShow={() => {}}>
          <Animated.View layout={LinearTransition} style={styles.centeredView}>
            <Pressable
              onPress={() => {
                if (file) {
                  setisCanceling(true);
                } else {
                  setFile(null);
                  onClose?.();
                }
              }}
              style={[{ backgroundColor: "" }, StyleSheet.absoluteFill]}
            />
            {mainView()}
          </Animated.View>
        </ReactNativeModal>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  image: {
    width: widthByScreen(85),
    height: widthByScreen(85),
    alignSelf: "center",
  },
  centeredView: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    margin:-20
  },
  modalView: {
    justifyContent: "flex-end",

    backgroundColor: "white",
    width: "100%",
    padding: spacing.md,
    borderTopLeftRadius: corner.lg,
    borderTopRightRadius: corner.lg,
    ...shadowGenerator(6),
  },
  modalText: {
    marginBottom: 15,
  },
});

export default App;
