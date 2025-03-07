import { widthByScreen } from "@/utils/dimension";
import { MutableRefObject, SetStateAction } from "react";
import {
  LayoutAnimation,
  LayoutAnimationProperty,
  Platform,
  UIManager,
} from "react-native";
// import { Matrix } from 'react-native-color-matrix-image-filters';
import Icon from "@expo/vector-icons/MaterialCommunityIcons";

export const handleHorizontalScroll = (event: {
  nativeEvent: { contentOffset: { x: any } };
}) => {
  return new Promise((resolve) => {
    const x = event?.nativeEvent?.contentOffset?.x;
    return resolve(Math.floor(Math.floor(x) / Math.floor(widthByScreen(100))));
  });
};

export const scrollToIndexHorizontal = (
  index: SetStateAction<number>,
  ref: MutableRefObject<any>
) => {
  if (ref?.current) {
    const realIndex = typeof index === "function" ? index(ref?.current) : index;
    if (ref?.current?.scrollTo !== undefined) {
      ref?.current?.scrollTo({
        x: (realIndex - 1) * widthByScreen(100),
        animated: true,
      });
    } else {
      ref?.current?.scrollToIndex({ index: realIndex });
    }
  }
};
export const LayoutAnimationHandler = ({
  property = "opacity",
  duration = 300,
}: {
  property?: LayoutAnimationProperty;
  duration?: number;
} = {}) => {
  // // revert
  if (Platform.OS === "android") {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }
  LayoutAnimation.configureNext({
    duration: duration,
    create: { type: "easeOut", springDamping: 0.7, property },
    update: {
      type: "easeOut",
      springDamping: 0.7,
      property,
      duration: duration,
    },
    delete: { type: "easeOut", springDamping: 0.7, property },
  });
};

/**
 * Convert a hexadecimal color value to RGB format.
 * @param {string} hex - The hexadecimal color value (e.g., "#RRGGBB").
 * @returns {{ r: number, g: number, b: number }} - An object containing the RGB values.
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  // Remove the '#' character from the hex if present
  hex = hex.replace("#", "");

  // Split the hex into its RGB components
  const r: number = parseInt(hex.slice(0, 2), 16);
  const g: number = parseInt(hex.slice(2, 4), 16);
  const b: number = parseInt(hex.slice(4, 6), 16);

  return { r, g, b };
}

// export function hexToMatrix(hexColor: string) {
//   // Function to convert hex to RGB
//   const r = parseInt(hexColor.slice(1, 3), 16) / 255;
//   const g = parseInt(hexColor.slice(3, 5), 16) / 255;
//   const b = parseInt(hexColor.slice(5, 7), 16) / 255;

//   const matrix: Matrix = [
//     r,
//     0,
//     0,
//     0,
//     0, // red
//     0,
//     g,
//     0,
//     0,
//     0, // green
//     0,
//     0,
//     b,
//     0,
//     0, // blue
//     1,
//     0,
//     1,
//     0,
//     0, // alpha
//   ];

//   return matrix;
// }

/**
 * Convert a hexadecimal or RGB color value to a transparent version.
 * @param {string} color - The hexadecimal or RGB color value.
 * @param {number} transparency - The transparency value, ranging from 0 to 1.
 * @returns {string} - The transparent color in the format "rgb(r, g, b, a)".
 */
export function toTransparent(color: string, transparency: number): string {
  // Check if the input color is in hexadecimal format
  const isHexColor = color.startsWith("#");

  // Extract the RGB values from the input color
  let r: number, g: number, b: number;
  if (isHexColor) {
    // Convert hexadecimal color to RGB
    const hexColor = color.replace("#", "");
    r = parseInt(hexColor.slice(0, 2), 16);
    g = parseInt(hexColor.slice(2, 4), 16);
    b = parseInt(hexColor.slice(4, 6), 16);
  } else {
    // Parse RGB values from the input color
    const rgbMatch = color.match(
      /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*\d*\.\d+)?\)/
    );
    if (!rgbMatch) {
      throw new Error(
        "Invalid input color format. Expected hex or RGB color string."
      );
    }
    r = parseInt(rgbMatch[1]);
    g = parseInt(rgbMatch[2]);
    b = parseInt(rgbMatch[3]);
  }

  // Clamp the transparency value between 0 and 1
  const alpha = Math.max(0, Math.min(1, transparency));

  // Return the transparent color in "rgb(r, g, b, a)" format
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * @param {string} color - The hexadecimal or RGB color value.
 */

export function isColorDark(color: string) {
  // Helper function to calculate relative luminance
  function calculateRelativeLuminance(hexColor: string) {
    const r = parseInt(hexColor.slice(1, 3), 16) / 255;
    const g = parseInt(hexColor.slice(3, 5), 16) / 255;
    const b = parseInt(hexColor.slice(5, 7), 16) / 255;

    const gammaCorrect = (c: number) => {
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    };

    return (
      0.2126 * gammaCorrect(r) +
      0.7152 * gammaCorrect(g) +
      0.0722 * gammaCorrect(b)
    );
  }

  const threshold = 0.5; // Adjust this threshold as needed

  const relativeLuminance = calculateRelativeLuminance(color);

  return relativeLuminance <= threshold;
}

export function shadowGenerator(intensity: number) {
  if (intensity >= 1 && intensity <= 24) {
    const depth = intensity - 1;

    // Interpolation functions based on provided reference
    function interpolate(
      i: number,
      a: number,
      b: number,
      a2: number,
      b2: number
    ) {
      return ((i - a) * (b2 - a2)) / (b - a) + a2;
    }

    const y = depth === 0 ? 1 : Math.floor(depth * 0.5);
    const opacity = interpolate(depth, 0, 23, 0.18, 0.58).toFixed(2);
    const radius = interpolate(depth, 0, 23, 1.0, 16.0).toFixed(2);
    const elevation = intensity;

    return {
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: y,
      },
      shadowOpacity: parseFloat(opacity),
      shadowRadius: parseFloat(radius),
      elevation,
      zIndex:10
    };
  } else {
    return {}; // Return an empty object for unsupported intensities
  }
}

export const mapFileTypeToIcon = (
  assetDetailId: string
): keyof typeof Icon.glyphMap => {
  if (!assetDetailId) return "file-outline";

  const lowerCaseId = assetDetailId.toLowerCase();

  if (lowerCaseId.includes("pdf")) return "file-pdf-box";
  if (lowerCaseId.includes("excel") || lowerCaseId.includes("xls"))
    return "file-excel-box";
  if (lowerCaseId.includes("jpeg") || lowerCaseId.includes("jpg"))
    return "file-jpg-box";
  if (lowerCaseId.includes("png")) return "file-png-box";
  if (
    lowerCaseId.includes("word") ||
    lowerCaseId.includes("doc") ||
    lowerCaseId.includes("docx")
  )
    return "file-word-box";
  if (lowerCaseId.includes("ppt")) return "file-powerpoint-box";

  return "file-outline"; // Default icon
};

export const mapFileTypeToColor = (assetDetailId: string) => {
  if (!assetDetailId) return "file-outline";

  const lowerCaseId = assetDetailId.toLowerCase();

  if (lowerCaseId.includes("pdf")) return "red";
  if (lowerCaseId.includes("excel") || lowerCaseId.includes("xls"))
    return "green";
  if (
    lowerCaseId.includes("jpeg") ||
    lowerCaseId.includes("jpg") ||
    lowerCaseId.includes("png")
  )
    return "purple";
  if (
    lowerCaseId.includes("word") ||
    lowerCaseId.includes("doc") ||
    lowerCaseId.includes("docx")
  )
    return "blue";
  if (lowerCaseId.includes("ppt")) return "yellow";

  return "blue"; // Default icon
};
