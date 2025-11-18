import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  PermissionsAndroid,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { mediaDevices, RTCPeerConnection } from "react-native-webrtc";
import AudioRecord from "react-native-audio-record";
import SoundPlayer from "react-native-sound-player";
import RNFS from "react-native-fs";
import { Buffer } from "buffer";

global.Buffer = Buffer;

const SIGNAL_SERVER = "ws://10.146.30.47:8080"; // your signaling server
const CASP_ENDPOINT = "wss://whitecel.com/test/twilio/media";

export default function VoiceCallScreen({ route }) {
  const params = route?.params || {};
  const userId = params.userId || "demoUser";
  const remoteUser = params.remoteUser || "testUser";

  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  const wsRef = useRef(null); // signaling socket
  const caspRef = useRef(null); // CASP socket
  const pcRef = useRef(null);
  const localStream = useRef(null);
  const audioChunks = useRef([]);
  const playing = useRef(false);

  useEffect(() => {
    const setup = async () => {
      if (Platform.OS === "android") {
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
        );
      }

      // No expo Audio.setAudioModeAsync here. Native modules above handle audio.
    };

    setup();
    initSignaling();

    return () => {
      stopCall();
    };
  }, []);

  // -----------------------------
  // Signaling setup (simple)
  // -----------------------------
  const initSignaling = () => {
    try {
      const socket = new WebSocket(`${SIGNAL_SERVER}?user=${userId}`);
      wsRef.current = socket;

      socket.onopen = () => console.log(`✅ Connected to signaling as ${userId}`);

      socket.onmessage = async (event) => {
        const msg = JSON.parse(event.data);

        // adapt these branches to your server's message format
        if (msg.type === "incoming_call") {
          console.log("📞 Incoming call from:", msg.from);
          await startCall(msg.from, true);
        }

        if (msg.type === "webrtc_signal" && pcRef.current) {
          const { data } = msg;
          if (data.signal === "offer") {
            await pcRef.current.setRemoteDescription(data.sdp);
            const answer = await pcRef.current.createAnswer();
            await pcRef.current.setLocalDescription(answer);
            safeSend(
              JSON.stringify({
                type: "webrtc_signal",
                to: msg.from,
                data: { signal: "answer", sdp: answer },
              })
            );
          } else if (data.signal === "answer") {
            await pcRef.current.setRemoteDescription(data.sdp);
          } else if (data.signal === "ice") {
            try {
              await pcRef.current.addIceCandidate(data.candidate);
            } catch (err) {
              console.warn("ICE candidate add error:", err);
            }
          }
        }
      };

      socket.onerror = (err) => console.error("⚠️ Signaling error:", err.message);
      socket.onclose = () => console.log("🔌 Signaling disconnected");
    } catch (err) {
      console.error("Signaling init failed:", err.message);
    }
  };

  const safeSend = (data) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(data);
    } else {
      console.log("⏳ Waiting for signaling socket to open...");
      wsRef.current?.addEventListener?.("open", () => {
        wsRef.current.send(data);
      });
    }
  };

  // -----------------------------
  // Start WebRTC + CASP AI
  // -----------------------------
  const startCall = async (target, isReceiver = false) => {
    try {
      setLoading(true);

      const stream = await mediaDevices.getUserMedia({ audio: true });
      localStream.current = stream;

      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });
      pcRef.current = pc;

      stream.getTracks().forEach((t) => pc.addTrack(t, stream));

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          safeSend(
            JSON.stringify({
              type: "webrtc_signal",
              to: target,
              data: { signal: "ice", candidate: event.candidate },
            })
          );
        }
      };

      if (!isReceiver) {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        safeSend(
          JSON.stringify({
            type: "webrtc_signal",
            to: target,
            data: { signal: "offer", sdp: offer },
          })
        );
        console.log("📨 Sent offer to", target);
      }

      await connectCASP();
      setConnected(true);
    } catch (err) {
      console.error("Call start error:", err);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // Connect CASP WebSocket (AI)
  // -----------------------------
  const connectCASP = () => {
    const ws = new WebSocket(CASP_ENDPOINT);
    caspRef.current = ws;

    ws.onopen = () => {
      console.log("✅ Connected to CASP AI");

      const startPayload = {
        event: "start",
        start: {
          accountSid: "AC_DEMO_SID",
          callSid: `CA_${Date.now()}`,
          streamSid: "CASPStream",
          mediaFormat: "audio/x-mulaw",
        },
      };

      ws.send(JSON.stringify(startPayload));
      console.log("📤 Sent CASP start payload");

      setTimeout(() => startMicStreamToCASP(), 400);
    };

    ws.onmessage = async (event) => {
      if (typeof event.data === "string") {
        const msg = JSON.parse(event.data);

        if (msg.event === "transcript") {
          console.log("🗣️ AI Transcript:", msg.media?.text);
        }

        if (msg.event === "media" && msg.media?.payload) {
          audioChunks.current.push(msg.media.payload);
          if (audioChunks.current.length >= 8 && !playing.current) {
            // take a batch and play
            const batch = audioChunks.current.splice(0);
            await playAudioChunks(batch);
          }
        }
      }
    };

    ws.onerror = (err) => console.error("⚠️ CASP socket error:", err.message);
    ws.onclose = () => console.log("🔌 CASP disconnected");
  };

  // -----------------------------
  // Mic stream to CASP (u-law or base64 pcm depending on server)
  // -----------------------------
  const startMicStreamToCASP = () => {
    AudioRecord.init({
      sampleRate: 8000,
      channels: 1,
      bitsPerSample: 16,
      audioSource: 6,
      bufferSize: 4096,
    });

    AudioRecord.start();
    console.log("🎙️ Mic stream started → CASP");

    AudioRecord.on("data", (data) => {
      if (caspRef.current?.readyState === WebSocket.OPEN) {
        // your server expected base64 PCM or u-law — adapt as needed.
        caspRef.current.send(
          JSON.stringify({
            event: "media",
            streamSid: "CASPStream",
            media: { payload: data },
          })
        );
      }
    });
  };

  // --- Utilities: decode µ-law -> PCM16 and WAV header creation ---

  const decodeULawToPCM16 = (ulawBuffer) => {
    // returns Uint8Array with 16-bit PCM little-endian bytes
    const out = new Uint8Array(ulawBuffer.length * 2);
    for (let i = 0; i < ulawBuffer.length; i++) {
      const u = ulawBuffer[i];
      const sample = muLawDecodeSample(u); // -32768..32767
      out[i * 2] = sample & 0xff;
      out[i * 2 + 1] = (sample >> 8) & 0xff;
    }
    return out;
  };

  const muLawDecodeSample = (uVal) => {
    // standard mu-law decode
    const MULAW_MAX = 0x1fff;
    const MULAW_BIAS = 33;
    uVal = ~uVal & 0xff;
    const sign = (uVal & 0x80) ? -1 : 1;
    const exponent = (uVal >> 4) & 0x07;
    const mantissa = uVal & 0x0f;
    let magnitude = (mantissa << 4) + MULAW_BIAS;
    magnitude = magnitude << (exponent + 3);
    const sample = sign * (magnitude - MULAW_BIAS);
    // clamp
    if (sample > 32767) return 32767;
    if (sample < -32768) return -32768;
    return sample;
  };

  const createWavHeader = (dataSize) => {
    const header = Buffer.alloc(44);
    header.write("RIFF", 0);
    header.writeUInt32LE(36 + dataSize, 4);
    header.write("WAVE", 8);
    header.write("fmt ", 12);
    header.writeUInt32LE(16, 16);
    header.writeUInt16LE(1, 20); // PCM
    header.writeUInt16LE(1, 22); // channels
    header.writeUInt32LE(8000, 24); // sampleRate
    header.writeUInt32LE(8000 * 2, 28); // byteRate
    header.writeUInt16LE(2, 32); // block align
    header.writeUInt16LE(16, 34); // bits per sample
    header.write("data", 36);
    header.writeUInt32LE(dataSize, 40);
    return header;
  };

  // -----------------------------
  // Playback: write WAV and play via SoundPlayer
  // -----------------------------
  const playAudioChunks = async (chunks) => {
    playing.current = true;
    try {
      // join base64 ulaw chunks
      const base64Audio = chunks.join("");
      const ulawBuf = Buffer.from(base64Audio, "base64");
      const pcmBytes = decodeULawToPCM16(ulawBuf); // Uint8Array
      const wavHeader = createWavHeader(pcmBytes.length);
      const wavBuffer = Buffer.concat([wavHeader, Buffer.from(pcmBytes)]);
      const filePath = `${RNFS.CachesDirectoryPath}/casp-${Date.now()}.wav`;

      await RNFS.writeFile(filePath, wavBuffer.toString("base64"), "base64");
      console.log("🎧 Playing CASP chunk:", filePath);

      try {
        await SoundPlayer.playUrl(`file://${filePath}`);
        // give it a tiny break to avoid overlapping calls
        await new Promise((res) => setTimeout(res, 120));
      } catch (err) {
        console.warn("⚠️ Playback failed:", err?.message || err);
      }
    } catch (err) {
      console.error("❌ playAudioChunks error:", err);
    } finally {
      playing.current = false;
    }
  };

  // -----------------------------
  // Stop / Cleanup
  // -----------------------------
  const stopCall = () => {
    try {
      AudioRecord.stop();
    } catch (e) {}
    try {
      pcRef.current?.close();
    } catch (e) {}
    try {
      caspRef.current?.close();
    } catch (e) {}
    try {
      wsRef.current?.close();
    } catch (e) {}
    setConnected(false);
    console.log("🛑 Call + CASP stopped");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AI Voice Call Demo</Text>

      {loading ? (
        <ActivityIndicator color="#fff" size="large" />
      ) : (
        <TouchableOpacity
          onPress={connected ? stopCall : () => startCall(remoteUser)}
          style={[styles.button, connected && { backgroundColor: "#ef4444" }]}
        >
          <Ionicons
            name={connected ? "stop-circle" : "call-outline"}
            size={48}
            color="#fff"
          />
        </TouchableOpacity>
      )}

      <Text style={styles.status}>
        {connected ? "Talking to AI..." : "Tap to start voice call"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", alignItems: "center", justifyContent: "center" },
  title: { color: "#fff", fontSize: 22, fontWeight: "bold", marginBottom: 40 },
  button: { backgroundColor: "#2563eb", borderRadius: 50, padding: 24 },
  status: { color: "#bbb", marginTop: 20, fontSize: 16 },
});
