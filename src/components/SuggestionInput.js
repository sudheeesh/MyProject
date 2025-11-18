import React from "react";
import { TouchableOpacity, Text } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

export default function SuggestionButton({ text }) {
  const icon = text.includes("email")
    ? "mail-outline"
    : text.includes("report")
    ? "send-outline"
    : "calendar-outline";

  return (
    <TouchableOpacity className="flex-row items-center bg-neutral-900 border border-neutral-800 rounded-full px-4 py-2 mb-2 w-[90%]">
      <Ionicons name={icon} size={18} color="#fff" />
      <Text className="text-white ml-2">{text}</Text>
    </TouchableOpacity>
  );
}
