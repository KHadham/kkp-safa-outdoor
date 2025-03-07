import React, { forwardRef, useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  StyleProp,
  TextInputProps,
  useColorScheme,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { corner, spacing } from "@/constants/measure";
import Text from "./Text";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
} from "react-native-reanimated";
import dayjs from "dayjs";
// importdayjs.extend(customParseFormat)
import customParseFormat from "dayjs/plugin/customParseFormat";
import ModalList from "./ModalList";
// import { Selection } from "@/restapi/types";
import { Colors } from "@/constants/Colors";

dayjs.extend(customParseFormat);

type InputType = "text" | "password" | "area" | "date";

interface InputProps extends TextInputProps {
  data?: [] | string[] | any;
  onSelect?: (data: Selection | string | any) => void;
  label?: string;
  errorMessage?: string | null;
  successMessage?: string;
  value: string;
  onChangeText?: (text: string) => void;
  onClear?: () => void;
  onPlus?: () => void;
  type?: InputType;
  leftIcon?: keyof typeof MaterialCommunityIcons.glyphMap;
  rightIcon?: keyof typeof MaterialCommunityIcons.glyphMap;
  rightAction?: () => void;
  leftAction?: () => void;
  editable?: boolean;
  required?: boolean;
  isActive?: boolean;
  maximumDate?: string;
}

interface InputTypeConfig {
  style: StyleProp<ViewStyle>; // Styles for the container
  secureTextEntry: boolean;
  multiline: boolean;
  numberOfLines: number;
  LeftIcon: keyof typeof MaterialCommunityIcons.glyphMap | null;
  LeftAction: (() => void) | null;
  RightIcon: keyof typeof MaterialCommunityIcons.glyphMap | null;
  RightAction: (() => void) | null;
}

const inputTypeMap: Record<InputType, InputTypeConfig> = {
  text: {
    style: { height: 50, paddingHorizontal: spacing.xs } as ViewStyle, // Correctly typed ViewStyle
    secureTextEntry: false,
    multiline: false,
    numberOfLines: 1,
    LeftIcon: null,
    LeftAction: null,
    RightIcon: null,
    RightAction: null,
  },
  password: {
    style: { height: 50, paddingHorizontal: spacing.xs } as ViewStyle,
    secureTextEntry: true,
    multiline: false,
    numberOfLines: 1,
    LeftIcon: "lock",
    LeftAction: null,
    RightIcon: "eye",
    RightAction: () => {},
  },
  date: {
    style: { height: 50, paddingHorizontal: spacing.xs } as ViewStyle,
    secureTextEntry: false,
    multiline: false,
    numberOfLines: 1,
    LeftIcon: "calendar",
    LeftAction: null,
    RightIcon: "calendar",
    RightAction: () => {},
  },
  area: {
    style: { height: 100, paddingHorizontal: spacing.xs } as ViewStyle,
    secureTextEntry: false,
    multiline: true,
    numberOfLines: 4,
    LeftIcon: null,
    LeftAction: null,
    RightIcon: null,
    RightAction: null,
  },
};

const Input = forwardRef<TextInput, InputProps>(
  (
    {
      onSelect,
      data,
      label,
      errorMessage,
      successMessage,
      value,
      onChangeText = () => {},
      onClear,
      onPlus,
      type = "text",
      leftIcon,
      rightIcon, // right icon is not used
      rightAction,
      leftAction,
      editable = true,
      required = false,
      isActive = true,
      maximumDate,
      ...props
    },
    ref
  ) => {
    const colorScheme = useColorScheme();

    const [isSelectVisible, setisSelectVisible] = useState(false);
    const [secureTextEntry, setSecureTextEntry] = useState(true);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [isFocused, setIsFocused] = useState(false); // Track focus state

    const typeConfig = inputTypeMap[type];

    const handleRightIconPress = () => {
      if (type === "password") {
        setSecureTextEntry((prev) => !prev);
      } else if (type === "date") {
        setShowDatePicker(true);
      } else if (rightAction) {
        rightAction();
      }
    };

    const RenderRightIcon = () => {
      if (isFocused && value && type !== "password") {
        return (
          <TouchableOpacity
            onPress={() => {
              onChangeText("");
              onClear?.();
            }}
          >
            <MaterialCommunityIcons
              name="close"
              size={20}
              color={Colors[colorScheme ?? "light"].error}
            />
          </TouchableOpacity>
        );
      } else if (props.onPress || data !== undefined) {
        return (
          <MaterialCommunityIcons
            name={"chevron-down"}
            size={20}
            color={
              !editable
                ? Colors[colorScheme ?? "light"].text_light
                : Colors[colorScheme ?? "light"].disabled
            }
          />
        );
      } else {
        return (
          (typeConfig.RightIcon || rightIcon) && (
            <TouchableOpacity
              disabled={!editable}
              onPress={handleRightIconPress}
            >
              <MaterialCommunityIcons
                name={
                  secureTextEntry
                    ? typeConfig.RightIcon ?? rightIcon
                    : "eye-off"
                }
                size={20}
                color={
                  !editable
                    ? Colors[colorScheme ?? "light"].text_light
                    : Colors[colorScheme ?? "light"].disabled
                }
              />
            </TouchableOpacity>
          )
        );
      }
    };

    if (!isActive) {
      return null;
    }

    return (
      <Animated.View
        layout={LinearTransition}
        style={styles.container}
        exiting={FadeOut}
        entering={FadeIn}
      >
        {label && (
          <Text fontWeight="bold" style={styles.label}>
            {label}{" "}
            {required && (
              <Text color={Colors[colorScheme ?? "light"].error}> *</Text>
            )}
          </Text>
        )}
        <TouchableOpacity
          onPress={
            editable
              ? type == "date"
                ? () => setShowDatePicker(true)
                : data !== undefined
                ? () => setisSelectVisible(true)
                : props.onPress
              : undefined
          }
          // layout={LinearTransition}
        >
          <Animated.View
            layout={LinearTransition}
            exiting={FadeOut}
            entering={FadeIn}
            style={[
              {
                flexDirection: "row",
                borderRadius: corner.md,
                paddingHorizontal: spacing.xs,
                borderColor: Colors[colorScheme ?? "light"].border,
                borderWidth: 1,
              },
              styles.inputContainer,
              typeConfig.style,
              isFocused && {
                borderColor: Colors[colorScheme ?? "light"].primary,
                borderWidth: 2,
              },
              editable
                ? { backgroundColor: Colors[colorScheme ?? "light"].background }
                : { backgroundColor: Colors[colorScheme ?? "light"].disabled },
            ]}
          >
            {leftIcon && (
              <TouchableOpacity onPress={leftAction}>
                <MaterialCommunityIcons
                  name={leftIcon}
                  size={20}
                  color="gray"
                />
              </TouchableOpacity>
            )}
            <TextInput
              pointerEvents="box-none"
              ref={ref}
              style={[
                styles.input,
                {
                  color: editable
                    ? Colors[colorScheme ?? "light"].text
                    : Colors[colorScheme ?? "light"].text_light,
                },
              ]}
              value={value}
              onChangeText={onChangeText}
              secureTextEntry={
                type === "password"
                  ? secureTextEntry
                  : typeConfig.secureTextEntry
              }
              textAlignVertical={type == "area" ? "top" : "center"}
              multiline={typeConfig.multiline}
              numberOfLines={typeConfig.numberOfLines}
              placeholderTextColor={
                editable
                  ? Colors[colorScheme ?? "light"].text
                  : Colors[colorScheme ?? "light"].text_light
              }
              onFocus={() => setIsFocused(true)} // Set focus state to true
              onBlur={() => setIsFocused(false)}
              placeholder={props.placeholder || "Masukan " + label}
              editable={
                props.onPress == undefined &&
                data == undefined &&
                type !== "date" &&
                editable
              }
              {...props}
            />
            {RenderRightIcon()}
          </Animated.View>
        </TouchableOpacity>

        {showDatePicker && type === "date" && (
          <DateTimePicker
            minimumDate={new Date()}
            maximumDate={
              maximumDate
                ? dayjs(maximumDate, "DD-MM-YYYY").toDate()
                : undefined
            }
            value={value ? dayjs(value, "DD-MM-YYYY").toDate() : new Date()}
            mode="date"
            onChange={(event, date) => {
              if (event.type === "set" && date) {
                onChangeText(dayjs(date).format("DD-MM-YYYY"));
              } else if (event.type === "dismissed") {
                setShowDatePicker(false);
              }
              setShowDatePicker(false); // Hide the picker in either case
            }}
          />
        )}

        {errorMessage && (
          <Text style={styles.errorMessage}>{errorMessage}</Text>
        )}
        {successMessage && (
          <Text style={styles.successMessage}>{successMessage}</Text>
        )}
        {data !== undefined && (
          <ModalList
            onPlus={onPlus}
            selected={value}
            title={props.placeholder || `Pilih ${label}`}
            data={data as Selection[]}
            onClose={() => setisSelectVisible(false)}
            isVisible={isSelectVisible}
            onSelect={onSelect}
          />
        )}
      </Animated.View>
    );
  }
);

Input.displayName = "Input";

const styles = StyleSheet.create({
  modalItem: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    padding: spacing.xs,
    borderRadius: corner.md,
    gap: spacing.xs,
  },
  container: { flexGrow: 1, flexShrink: 0 },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: corner.md,
    paddingHorizontal: spacing.xs,
    // ...shadowGenerator(5),
    backgroundColor: "white",
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: "80%",
  },
  errorMessage: {
    color: "red",
    fontSize: 12,
    marginTop: 5,
  },
  successMessage: {
    color: "green",
    fontSize: 12,
    marginTop: 5,
  },
});

export default Input;
