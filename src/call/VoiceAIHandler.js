import AudioRecord from "react-native-audio-record";
import { Audio } from "expo-av";
import { Buffer } from "buffer";
global.Buffer = Buffer;

const CASP_ENDPOINT = "wss://whitecel.com/test/twilio/media";

export async function startAIIncomingCall(number) {
  console.log("🎧 Starting AI voice session for", number);

  const ws = new WebSocket(CASP_ENDPOINT);
  global.caspSocket = ws;

  ws.onopen = async () => {
    console.log("✅ CASP connected (incoming call)");

    ws.send(JSON.stringify({
      event: "start",
      start: {
        streamSid: `CASP-${Date.now()}`,
        mediaFormat: { encoding: "audio/L16", sampleRate: 8000, channels: 1 },
      },
    }));

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: false,
      playThroughEarpieceAndroid: false,
    });

    AudioRecord.init({
      sampleRate: 8000,
      channels: 1,
      bitsPerSample: 16,
      audioSource: 6,
      bufferSize: 4096,
    });

    AudioRecord.start();
    console.log("🎙️ Mic streaming → CASP...");

    AudioRecord.on("data", (data) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          event: "media",
          streamSid: "CASPStream",
          media: { payload: data },
        }));
      }
    });
  };

  ws.onmessage = async (event) => {
    try {
      const msg = JSON.parse(event.data);
      if (msg.event === "media" && msg.media?.payload) {
        await playAIResponse(msg.media.payload);
      }
    } catch (err) {
      console.error("AI stream error:", err);
    }
  };

  ws.onclose = () => console.log("🔌 CASP disconnected");
  ws.onerror = (err) => console.error("⚠️ CASP error:", err.message);
}

async function playAIResponse(base64Audio) {
  const sound = new Audio.Sound();
  try {
    await sound.loadAsync({
      uri: `data:audio/wav;base64,${base64Audio}`,
    });
    await sound.playAsync();
  } catch (err) {
    console.error("Playback error:", err);
  }
}