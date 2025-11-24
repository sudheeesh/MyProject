import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import Feather from "react-native-vector-icons/Feather";
import AssistantModal from "../modals/AssistantsModal"

export default function DrawerContent({ navigation }) {
  const [openModal, setOpenModal] = useState(false);
  const [assistants, setAssistants] = useState([
    { id: 1, name: "New Assistant" },
    { id: 2, name: "CallAssistant" },
    { id: 3, name: "VoiceAssistant" },
  ]);

  return (
    <View style={{ flex: 1, backgroundColor: "#000", padding: 20 }}>

      {/* Title */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ color: "#fff", fontSize: 20, fontWeight: "700" }}>Assistants</Text>

        <TouchableOpacity onPress={() => setOpenModal(true)}>
          <Feather name="plus" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ marginTop: 20 }}>
        {assistants.map((a) => (
          <TouchableOpacity
            key={a.id}
            style={{ paddingVertical: 12 }}
            onPress={() => navigation.navigate("AssistantDetails", { name: a.name })}
          >
            <Text style={{ color: "#ddd", fontSize: 16 }}>{a.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Modal */}
      <AssistantModal
        visible={openModal}
        onClose={() => setOpenModal(false)}
        onCreate={(newAssistant) => {
          setAssistants([...assistants, newAssistant]);
          setOpenModal(false);
        }}
      />
    </View>
  );
}
