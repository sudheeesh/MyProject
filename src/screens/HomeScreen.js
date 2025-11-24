// src/screens/HomeScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Modal,
  Pressable,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import Toast from "react-native-toast-message";
import { useSelector, useDispatch } from "react-redux";

import {
  getIntegrations,
  getDriveConfigs,
  getQnaConfigs,
  getBotConfigs,
  qnaQuery,
  setAuthToken,
  setXResource,
} from "../services/api";

import {
  setResource,
  setConfNames,
  setSelectedModel,
  setSearchData,
  selectResource,
  selectSelectedModel,
  selectConfNames,
} from "../store/slices/searchSlice";

export default function HomeScreen({ navigation }) {
  const dispatch = useDispatch();

  const storeResource = useSelector(selectResource);
  const storeModel = useSelector(selectSelectedModel);
  const confNames = useSelector(selectConfNames);

  const admin = useSelector((s) => s.admin);
  const token = admin?.token;
  const workspaceResource = admin?.resource;

  const [localResource, setLocalResource] = useState(
    workspaceResource || storeResource
  );

  const [query, setQuery] = useState("");
  const [selectedModel, setSelectedModelLocal] = useState(
    storeModel || "Gemini-2.0"
  );
  const [selectedTime] = useState("60 Days");
  const [loading, setLoading] = useState(false);
  const [loadingConfigs, setLoadingConfigs] = useState(false);

  const [showConfPicker, setShowConfPicker] = useState(false);
  const [activeConf, setActiveConf] = useState("Select");

  const searchState = useSelector((s) => s.search);

  useEffect(() => {
    setAuthToken(token);

    if (workspaceResource) {
      setXResource(workspaceResource);
      dispatch(setResource(workspaceResource));
      setLocalResource(workspaceResource);
      dispatch(setConfNames([workspaceResource]));
    }
  }, [token, workspaceResource, dispatch]);

  useEffect(() => {
    if (!searchState.searchData) {
      setQuery("");
      setSelectedModelLocal("Gemini-2.0");
    }
  }, [searchState.searchData]);

  useEffect(() => {
    const loadConfigs = async () => {
      if (!localResource) return;

      setLoadingConfigs(true);
      try {
        const [integrations, drive, qna, bot] = await Promise.allSettled([
          getIntegrations(localResource),
          getDriveConfigs(localResource),
          getQnaConfigs(localResource),
          getBotConfigs(localResource),
        ]);

        const confSet = new Set();

        const pushConf = (arr) => {
          if (!Array.isArray(arr)) return;
          arr.forEach((item) => {
            if (item?.conf_name) confSet.add(item.conf_name);
          });
        };

        if (integrations.value?.data) pushConf(integrations.value.data);
        if (drive.value?.data) pushConf(drive.value.data);
        if (qna.value?.data) pushConf(qna.value.data);
        if (bot.value?.data) pushConf(bot.value.data);

        if (confSet.size === 0) confSet.add(localResource);

        const finalList = [...confSet];

        dispatch(setConfNames(finalList));

        if (activeConf === "Select") {
          setActiveConf(finalList[0]);
        }
      } catch (err) {
        console.warn("CONFIG ERROR:", err);
      } finally {
        setLoadingConfigs(false);
      }
    };

    loadConfigs();
  }, [localResource]);

  // BUILD PAYLOAD
  const buildPayload = (text) => ({
    query: text,
    titles_only: false,
    web_search: false,
    timePeriod: "60 Days",
    search_folder: [],
    selected_files: [],
    allitems: [],
    conf_names: activeConf ? [activeConf] : [],
    audioFile: null,
    llm: selectedModel,
  });

  // CREATE SESSION
  const createSession = async () => {
    const prompt = query.trim();
    if (!prompt) return;

    setLoading(true);

    const payload = buildPayload(prompt);
    dispatch(setSearchData(payload));
    dispatch(setSelectedModel(selectedModel));

    console.log("🔥 FINAL PAYLOAD:", payload);

    try {
      setAuthToken(token);
      setXResource(localResource);

      const res = await qnaQuery(localResource, payload);

      console.log("🔥 RAW RESPONSE:", res.data);

      // CASE 1: array with chat_session_id
      if (Array.isArray(res.data) && res.data.length) {
        const first = res.data[0];
        if (first.chat_session_id) {
          navigation.navigate("ChatScreen", {
            sessionId: first.chat_session_id,
            configId: activeConf,
            initialSearchData: payload,
          });
          setQuery("");
          return;
        }
      }

      // CASE 2: object with session_id
      if (res.data?.session_id) {
        navigation.navigate("ChatScreen", {
          sessionId: res.data.session_id,
          configId: activeConf,
          initialSearchData: payload,
        });
        setQuery("");
        return;
      }

      Toast.show({
        type: "error",
        text1: "Backend did not return chat_session_id",
      });
    } catch (err) {
      console.log("CHAT ERROR:", err);
      Toast.show({ type: "error", text1: "Error creating chat" });
    } finally {
      setLoading(false);
    }
  };

  // SUGGESTION CLICK
  const onSuggestionPress = (text) => {
    setQuery(text);
    setTimeout(() => {
      createSession();
    }, 50);
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Feather name="menu" size={24} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setShowConfPicker(true)}
          style={styles.confBtn}
        >
          <Feather name="chevron-down" size={16} color="#fff" />
          <Text style={styles.confText}>{activeConf}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Account")}>
          <Feather name="settings" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* MODAL */}
      <Modal visible={showConfPicker} transparent animationType="fade">
        <Pressable
          onPress={() => setShowConfPicker(false)}
          style={styles.modalOverlay}
        >
          <View style={styles.modalBox}>
            {confNames.map((name, index) => (
              <TouchableOpacity
                key={index}
                style={styles.modalItem}
                onPress={() => {
                  setActiveConf(name);
                  dispatch(setConfNames([name]));
                  setShowConfPicker(false);
                }}
              >
                <Text style={styles.modalItemText}>{name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>

      <ScrollView>
        <Text style={styles.title}>How can I help you?</Text>

        {/* INPUT BOX */}
        <View style={styles.inputBox}>
          <TextInput
            placeholder="Type your query..."
            placeholderTextColor="#777"
            style={styles.input}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={createSession}
          />

          <TouchableOpacity onPress={createSession} style={styles.iconBox}>
            <Feather name="send" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* SUGGESTIONS */}
        <View style={styles.suggestions}>
          {[
            "Get me the status for today",
            "Send an email to Johny saying I am busy",
            "Write a report to Gaurav Vasistha about the Marketing leads",
          ].map((text, i) => (
            <TouchableOpacity
              key={i}
              style={styles.suggestionItem}
              onPress={() => onSuggestionPress(text)}
            >
              <Text style={styles.suggestionText}>{text}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* LOADING */}
        {loading && (
          <View style={styles.loaderView}>
            <ActivityIndicator color="#3b82f6" size="large" />
            <Text style={{ color: "#fff" }}>Creating chat...</Text>
          </View>
        )}
      </ScrollView>

      <Toast />
    </View>
  );
}

// STYLES
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", paddingTop: 52, paddingHorizontal: 20 },
  header: { flexDirection: "row", justifyContent: "space-between" },
  confBtn: {
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#111",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#333",
  },
  confText: { color: "#fff", marginLeft: 6 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: "80%",
    backgroundColor: "#111",
    padding: 20,
    borderRadius: 12,
    borderColor: "#333",
    borderWidth: 1,
  },
  modalItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: "#222",
  },
  modalItemText: { color: "#fff" },
  title: { color: "#fff", fontSize: 24, fontWeight: "800", marginVertical: 25 },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#333",
  },
  input: { flex: 1, color: "#fff", fontSize: 16 },
  iconBox: { padding: 8, backgroundColor: "#333", borderRadius: 8 },
  suggestions: { marginTop: 20 },
  suggestionItem: {
    padding: 12,
    backgroundColor: "#111",
    borderRadius: 10,
    borderColor: "#333",
    borderWidth: 1,
    marginBottom: 10,
  },
  suggestionText: { color: "#ccc" },
  loaderView: { marginTop: 20, alignItems: "center" },
});

