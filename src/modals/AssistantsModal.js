import React from "react";
import { Modal, View, Text, TouchableOpacity, ScrollView } from "react-native";

const templates = [
  { id: "gmail", title: "Gmail" },
  { id: "drive", title: "Google Drive" },
  { id: "outlook", title: "Outlook" },
  { id: "sharepoint", title: "SharePoint" },
  { id: "teams", title: "Microsoft Teams" },
  { id: "flipkart", title: "Flipkart" },
  { id: "library", title: "Library" },
];

export default function AssistantModal({ visible, onClose, onCreate }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={{
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.6)",
        justifyContent: "center",
        padding: 20,
      }}>
        <View style={{
          backgroundColor: "#111",
          borderRadius: 14,
          padding: 20
        }}>
          <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700", marginBottom: 16 }}>
            Create Assistant
          </Text>

          <ScrollView style={{ maxHeight: 400 }}>
            {templates.map((t) => (
              <TouchableOpacity
                key={t.id}
                style={{
                  padding: 14,
                  backgroundColor: "#222",
                  marginBottom: 10,
                  borderRadius: 10,
                }}
                onPress={() =>
                  onCreate({
                    id: Math.random(),
                    name: t.title + " Assistant",
                  })
                }
              >
                <Text style={{ color: "#fff", fontSize: 16 }}>{t.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity
            onPress={onClose}
            style={{
              marginTop: 12,
              padding: 12,
              backgroundColor: "#333",
              borderRadius: 8,
            }}
          >
            <Text style={{ textAlign: "center", color: "#fff" }}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
