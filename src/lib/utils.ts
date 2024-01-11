import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const isNumber = (input: unknown): input is number =>
  typeof input === "number";

export const isString = (input: unknown): input is string =>
  typeof input === "string";

export const safeJsonParse = <T>(str: string) => {
  try {
    return JSON.parse(str) as T;
  } catch {
    return undefined;
  }
};
