import React from "react";
import { View, TextInput, TouchableOpacity } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

export default function ChatInput({ onSend, query, setQuery }) {
  return (
    <View className="bg-neutral-900 flex-row items-center rounded-xl px-3 py-3 border border-neutral-800">
      <TouchableOpacity>
        <MaterialIcons name="more-vert" size={20} color="gray" />
      </TouchableOpacity>

      <TextInput
        placeholder="Type your query....."
        placeholderTextColor="#999"
        value={query}
        onChangeText={setQuery}
        className="flex-1 text-white px-3"
        onSubmitEditing={() => onSend(query)}
      />

      <TouchableOpacity onPress={() => onSend(query)}>
        <Ionicons name="send" size={22} color="#3b82f6" />
      </TouchableOpacity>
    </View>
  );
}
