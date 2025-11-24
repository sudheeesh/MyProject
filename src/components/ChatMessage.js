// src/components/ChatMessage.js
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import Markdown from "react-native-markdown-display";
import SourceCard from "./SourceCard";

export default function ChatMessage({ msg, isUser, onSourcePress }) {
  return (
    <View style={styles.block}>
      <View style={[styles.bubble, isUser ? styles.user : styles.bot]}>
        {!!msg.message && (
          <Markdown style={mdStyles}>{msg.message}</Markdown>
        )}
      </View>

      {msg.sources && msg.sources.length > 0 && (
        <View style={styles.sourcesWrap}>
          <Text style={styles.sourcesTitle}>
            {msg.sources.length} Sources
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {msg.sources.map((src, idx) => (
              <TouchableOpacity key={idx} onPress={() => onSourcePress(src)}>
                <SourceCard source={src} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  block: { marginBottom: 20 },
  bubble: {
    padding: 12,
    borderRadius: 12,
    maxWidth: "85%",
    marginBottom: 8,
  },
  user: {
    alignSelf: "flex-end",
    backgroundColor: "#2563eb",
  },
  bot: {
    alignSelf: "flex-start",
    backgroundColor: "#111",
    borderWidth: 1,
    borderColor: "#333",
  },
  sourcesWrap: { marginTop: 8 },
  sourcesTitle: { color: "#ccc", marginBottom: 6 },
});

const mdStyles = {
  body: { color: "#fff", fontSize: 15, lineHeight: 20 },
};
