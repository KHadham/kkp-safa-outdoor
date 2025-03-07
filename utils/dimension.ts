import { Dimensions } from "react-native";

const WINDOW = Dimensions.get("window");

export const isPortrait = () => {
  const { width, height } = Dimensions.get("window");
  return width <= height;
};

export function heightByScreen(size: number) {
  return (size * (isPortrait() ? WINDOW.height : WINDOW.width)) / 100;
}

export function widthByScreen(size: number) {
  return (size * (isPortrait() ? WINDOW.width : WINDOW.height)) / 100;
}
