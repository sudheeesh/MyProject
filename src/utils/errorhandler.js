import Toast from "react-native-toast-message";
import { AxiosError } from "axios";

export const handleErrorResponse = (error, fallbackMessage = "Something went wrong") => {
  let message = fallbackMessage;

  if (typeof error === "string") {
    message = error;
  } else if (error instanceof AxiosError) {
    const detail = error.response?.data?.detail;
    if (Array.isArray(detail)) {
      message = detail.map((d) => `${d.loc?.join(" ")} - ${d.msg}`).join(", ");
    } else if (detail) {
      message = detail;
    } else if (error.message) {
      message = error.message;
    }
  }

  Toast.show({
    type: "error",
    text1: message.charAt(0).toUpperCase() + message.slice(1),
  });
};