// src/screens/VoiceCallScreen.jsx
import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Platform, PermissionsAndroid } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import AudioRecord from "react-native-audio-record";
import SoundPlayer from "react-native-sound-player";
import RNFS from "react-native-fs";
import { Buffer } from "buffer";

global.Buffer = Buffer;

export default function VoiceCallScreen({ route, navigation }) {
  const { ws_url, peer } = route.params;
  const caspRef = useRef(null);
  const audioChunks = useRef([]);
  const playing = useRef(false);

  const [connected, setConnected] = useState(false);

  useEffect(() => {
    init();
    return () => stopCall();
  }, []);

  async function init() {
    if (Platform.OS === "android") {
      await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
    }
    connectCASP();
  }

  function connectCASP() {
    console.log("🔌 Connecting CASP media WS:", ws_url);

    const ws = new WebSocket(ws_url);
    caspRef.current = ws;

    ws.onopen = () => {
      console.log("✅ CASP connected");
      ws.send(
        JSON.stringify({
          event: "start",
          start: {
            accountSid: "AC_DEMO",
            callSid: `CA_${Date.now()}`,
            streamSid: "CASPStream",
            mediaFormat: "audio/x-mulaw",
          }
        })
      );

      setTimeout(() => startMic(), 300);
      setConnected(true);
    };

    ws.onmessage = async (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.event === "media" && msg.media?.payload) {
          audioChunks.current.push(msg.media.payload);

          if (audioChunks.current.length >= 8 && !playing.current) {
            const batch = audioChunks.current.splice(0);
            await playBatch(batch);
          }
        }
      } catch (e) {
        console.log("⚠️ Parse failed:", e.message);
      }
    };

    ws.onerror = (err) => console.log("❌ CASP WS error:", err.message);
    ws.onclose = () => console.log("🔌 CASP disconnected");
  }

  function startMic() {
    AudioRecord.init({
      sampleRate: 8000,
      channels: 1,
      bitsPerSample: 16,
      audioSource: 6,
      bufferSize: 4096,
    });

    AudioRecord.start();

    AudioRecord.on("data", (data) => {
      if (caspRef.current?.readyState === 1) {
        caspRef.current.send(
          JSON.stringify({
            event: "media",
            streamSid: "CASPStream",
            media: { payload: data },
          })
        );
      }
    });
  }

  async function playBatch(chunks) {
    playing.current = true;

    try {
      const b64 = chunks.join("");
      const ulawBuf = Buffer.from(b64, "base64");

      const pcm = decodeULaw(ulawBuf);
      const wav = Buffer.concat([getHeader(pcm.length), Buffer.from(pcm)]);

      const file = `${RNFS.CachesDirectoryPath}/casp-${Date.now()}.wav`;
      await RNFS.writeFile(file, wav.toString("base64"), "base64");

      await SoundPlayer.playUrl(`file://${file}`);
    } catch (err) {
      console.log("⚠️ playback error:", err.message);
    }

    playing.current = false;
  }

  function decodeULaw(input) {
    const out = new Uint8Array(input.length * 2);
    for (let i = 0; i < input.length; i++) {
      const u = ~input[i] & 0xff;
      const sign = (u & 0x80) ? -1 : 1;
      const exponent = (u >> 4) & 0x07;
      const mantissa = u & 0x0f;
      let sample = ((mantissa << 4) + 33) << (exponent + 3);
      sample = sign * sample;
      out[i * 2] = sample & 0xff;
      out[i * 2 + 1] = (sample >> 8) & 0xff;
    }
    return out;
  }

  function getHeader(size) {
    const h = Buffer.alloc(44);
    h.write("RIFF", 0);
    h.writeUInt32LE(36 + size, 4);
    h.write("WAVE", 8);
    h.write("fmt ", 12);
    h.writeUInt32LE(16, 16);
    h.writeUInt16LE(1, 20);
    h.writeUInt16LE(1, 22);
    h.writeUInt32LE(8000, 24);
    h.writeUInt32LE(16000, 28);
    h.writeUInt16LE(2, 32);
    h.writeUInt16LE(16, 34);
    h.write("data", 36);
    h.writeUInt32LE(size, 40);
    return h;
  }

  function stopCall() {
    try { AudioRecord.stop(); } catch {}
    try { caspRef.current?.close(); } catch {}
    setConnected(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Talking with: {peer}</Text>

      <TouchableOpacity onPress={stopCall} style={[styles.button, { backgroundColor: "#ef4444" }]}>
        <Ionicons name="call" size={48} color="#fff" />
      </TouchableOpacity>

      <Text style={styles.status}>
        {connected ? "Live AI Call Active" : "Connecting..."}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", justifyContent: "center", alignItems: "center" },
  title: { color: "#fff", fontSize: 20, marginBottom: 20 },
  button: { padding: 25, borderRadius: 60, backgroundColor: "#2563eb" },
  status: { color: "#aaa", marginTop: 20 }
});
