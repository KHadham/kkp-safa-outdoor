import React, { useRef, useState } from "react";
import {
  StyleSheet,
  View,
  FlatListProps,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Modal, { ModalProps } from "react-native-modal";
import Animated, {
  FadeIn,
  FadeOut,
  FadingTransition,
} from "react-native-reanimated";
import Text from "./Text";
import { Colors } from "@/constants/Colors";
import { corner, sizes, spacing } from "@/constants/measure";
import { heightByScreen } from "@/utils/dimension";
import Icon from "@expo/vector-icons/MaterialCommunityIcons";

// import { Selection } from "@/restapi/types";
import Button from "./Button";

interface AppProps<ItemT> extends Partial<ModalProps> {
  onSelect?: (item: ItemT | string) => void;
  selected?: any;
  isVisible: boolean;
  onClose?: () => void;
  onPlus?: () => void;
  title?: string;
  data: ItemT[] | string[];
  onSuccess?: () => void;
  renderItem?: (item: { item: ItemT; index: number }) => JSX.Element;
}

const App = <ItemT extends string[]>({
  onSelect,
  selected,
  isVisible = false,
  onClose,
  onPlus,
  title = "Default Title",
  data,
  onSuccess,
  renderItem,
  ...restProps
}: AppProps<ItemT>) => {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const [filteredData, setFilteredData] = useState(data);
  const [isLoading, setisLoading] = useState(false);
  // Default Render Item
  const defaultRenderItem = ({ item }: { item: any }) => {
    const isSelected = Array.isArray(selected)
      ? selected.some((selectedItem) => selectedItem.id === item.id)
      : selected === item ||
        selected?.id === item.id ||
        selected === item?.fullName;

    return (
      <TouchableOpacity
        key={item.id || item}
        onPress={() => {
          onSelect?.(item);
          setisLoading(true);
          setTimeout(() => {
            setisLoading(false);
            closeModal();
          }, 350);
        }}
        style={[
          styles.modalItem,
          {
            borderColor: isSelected
              ? Colors[colorScheme ?? "light"].success
              : Colors[colorScheme ?? "light"].border,
            backgroundColor: isSelected
              ? Colors[colorScheme ?? "light"].success_bg
              : Colors[colorScheme ?? "light"].background,
          },
        ]}
      >
        {item.id == undefined ? (
          <Text size="sm">{item}</Text>
        ) : (
          <Text size="sm">
            {item?.fullName ||
              `${item?.category} ${item?.sizes} \n ${item?.toolsName}`}
          </Text>
        )}
        {isSelected && isLoading && (
          <ActivityIndicator
            size="small"
            color={Colors[colorScheme ?? "light"].text}
          />
        )}
      </TouchableOpacity>
    );
  };

  const flatListRef = useRef<FlatList>(null);

  const closeModal = () => {
    onClose?.();
    setFilteredData(data);
  };

  return (
    <Modal
      useNativeDriver
      isVisible={isVisible}
      {...restProps}
      onBackButtonPress={closeModal}
      onBackdropPress={closeModal}
      style={styles.modal}
      // onModalShow={() => scrollToSelected()}
      onModalHide={() => {
        setFilteredData(data);
      }}
    >
      <View
        style={[
          styles.modalContent,
          {
            maxHeight:
              heightByScreen(100) -
              (insets.top === 0 ? spacing.lg : insets.top),
            paddingVertical: insets.bottom === 0 ? spacing.md : insets.bottom,
            paddingHorizontal: insets.left === 0 ? spacing.md : insets.left,
          },
        ]}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text
            fontWeight="bold"
            size="md"
            color={Colors[colorScheme ?? "light"].text}
          >
            {title}
          </Text>
          <Icon
            name="plus"
            size={sizes.xl}
            color={Colors[colorScheme ?? "light"].primary}
            onPress={() => {
              onPlus?.();
              onClose?.();
            }}
          />
        </View>

        <Animated.FlatList
          entering={FadeIn}
          exiting={FadeOut}
          showsVerticalScrollIndicator={false}
          ref={flatListRef}
          layout={FadingTransition}
          contentContainerStyle={{
            gap: spacing.xs,
          }}
          data={data as unknown as ArrayLike<ItemT>}
          renderItem={renderItem || defaultRenderItem}
        />
        {/* Optional button for "onSuccess" */}
        <Button
          title="Hapus Pilihan"
          onPress={() => {
            onSelect?.("");
            onClose?.();
          }}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: "flex-end",
    margin: 0,
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: corner.lg,
    borderTopRightRadius: corner.lg,
    width: "100%",
    gap: spacing.md,
  },
  modalItem: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    padding: spacing.xs,
    borderRadius: corner.md,
    gap: spacing.xs,
  },
});

export default App;
