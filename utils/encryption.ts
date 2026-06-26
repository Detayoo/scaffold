import CryptoJS from "crypto-js";
import { CONFIG } from "@/config";

export const encrypt = (text: string) => {
  return CryptoJS.AES.encrypt(text, `${CONFIG.SECRET_KEY}`).toString();
};

export const decrypt = (text: string) => {
  try {
    const decrypted = CryptoJS.AES.decrypt(text, `${CONFIG.SECRET_KEY}`);
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch {
    if (typeof window !== "undefined") {
      localStorage.clear();
      window.location.replace("/");
    }
    return null;
  }
};
