// components/SourceModal.js
import React from "react";
import { Modal, View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";

export default function SourceModal({ visible, item, onClose }) {
  if (!item) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.bg}>
        <View style={styles.box}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>{item.title}</Text>

            <Text style={styles.label}>Content</Text>
            <Text style={styles.text}>{item.content}</Text>

            <Text style={styles.label}>Record Content</Text>
            <Text style={styles.text}>{item.record_content}</Text>

            <Text style={styles.label}>File Name</Text>
            <Text style={styles.text}>{item.file_names}</Text>

            <Text style={styles.label}>Last Modified</Text>
            <Text style={styles.text}>{item.last_modified}</Text>

            <Text style={styles.label}>Score</Text>
            <Text style={styles.text}>{item.score}</Text>
          </ScrollView>

          <TouchableOpacity onPress={onClose} style={styles.btn}>
            <Text style={{ color: "#fff", fontWeight: "600" }}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    padding: 20,
  },
  box: {
    backgroundColor: "#111",
    padding: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#333",
    maxHeight: "90%",
  },
  title: { color: "#fff", fontSize: 20, fontWeight: "700", marginBottom: 12 },
  label: { color: "#777", marginTop: 10, marginBottom: 4, fontWeight: "600" },
  text: { color: "#eee", lineHeight: 20 },
  btn: {
    marginTop: 20,
    padding: 12,
    backgroundColor: "#2563eb",
    borderRadius: 8,
    alignItems: "center",
  },
});
