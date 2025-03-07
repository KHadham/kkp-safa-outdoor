import { View, DimensionValue, useColorScheme } from "react-native";
import React from "react";
import { corner, sizes } from "@/constants/measure";
import Text from "./Text";
import { Colors } from "@/constants/Colors";

interface HeaderProps {
  value: number | string;
  color?: string;
}

const ProgressBar: React.FC<HeaderProps> = ({
  value,
  color = '',
}) => {
  const colorScheme = useColorScheme();

  return (
    <View>
      <View
        style={{
          backgroundColor: Colors[colorScheme ?? "light"].border,
          width: "100%",
          height: sizes.md,
          borderRadius: corner.md,
        }}
      />
      <View
        style={{
          backgroundColor: color,
          width: `${value}%` as DimensionValue,
          height: sizes.md,
          position: "absolute",
          borderRadius: corner.md,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text size="xs" color={"white"}>
          {value !== null &&
            (Number(value) < 15 ? Number(value).toFixed() : value + " %")}
        </Text>
      </View>
      {(value == null || value == "0.00") && (
        <Text
          size="xs"
          style={{ position: "absolute", width: "100%", textAlign: "center" }}
        >
          Belum ada proses
        </Text>
      )}
    </View>
  );
};

export default ProgressBar;
