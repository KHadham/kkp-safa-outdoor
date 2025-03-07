// import dayjs from 'dayjs';

import dayjs from "dayjs";

export const deserializeParam = (param: string | undefined) =>
  param ? JSON.parse(param) : null;

export const getNumberOnly = (string = "") => string.replace(/\D+/g, "");

export const getNumberRemoveFirstZero = (string = "") => {
  const digitsOnly = string.replace(/\D+/g, "");
  return digitsOnly.replace(/^0+/, ""); // Remove leading zeros
};

export const percentage = (number: string | string[] | number | undefined) => {
  if (number !== undefined && number !== null) {
    return `${parseFloat(number.toString()).toFixed(2)}%`;
  }
  return null;
};

export const formatRupiah = (number: any) => {
  // const formatter = getNumberRemoveFirstZero(number);
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(number));
};
/**
 * Convert String To Title Case <-- like this comment
 */
export const toTitleCase = (input = "") => {
  const words = input.split(/[^a-zA-Z0-9]+/);

  const capitalizedWords = words.map((word) => {
    if (word.length > 0) {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }
    return "";
  });

  return capitalizedWords.join(" ");
};

export function getInitials(name = "") {
  const words = name.split(" ");
  return words
    .map((word) => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
}

export function isImageUrl(url: string) {
  const imagePattern = /\.(jpeg|jpg|png|gif|bmp|webp)$/i;
  return imagePattern.test(url);
}

export const numberToBool = (params: any) => {
  if (typeof params == "number") {
    return params === 1;
  } else return params;
};

export const sleep = (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(true), ms);
  });
};

export const isObjectEmpty = (obj) => {
  return Object.keys(obj).length === 0;
};

export const isDateTimeAlias = (string: string) => {
  if (typeof string == "string") {
    const keywords = ["tanggal", "waktu", "tahun", "saat", "bulan", "jam"];
    return keywords.some((keyword) => string.toLowerCase().includes(keyword));
  }
};

// export const formatDateAlias = (string: string) => {
//   return dayjs(string).format('dddd, DD-MMMM-YYYY / HH:MM');
// };

export const isEmptyOrNullValue = (string: string) => {
  return (
    string === "null" ||
    string == null ||
    (typeof string === "string" && string === "")
  );
};

export const removeSpecialChar = (string: string) => {
  return string
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .replace(/:/g, "")
    .trim();
};

export const normalizeBoolean = (value: any): boolean => {
  return value === true || value === "true";
};
export const formattedDate = (timestamp: {
  seconds: number;
  nanoseconds: number;
}) => {
  const date = new Date(timestamp.seconds * 1000);
  return date.toLocaleDateString();
};

export const hasChanges = (first: any, second: any) => {
  // Compare userObject with originalUserObject
  return JSON.stringify(first) == JSON.stringify(second);
};

export const diffDays = (date1: string, date2: string) => {
  return dayjs(date2, "DD-MM-YYYY").diff(dayjs(date1, "DD-MM-YYYY"), "day");
};