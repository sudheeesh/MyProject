import AudioRecord from "react-native-audio-record";
import SoundPlayer from "react-native-sound-player";
import RNFS from "react-native-fs";
import { Buffer } from "buffer";
global.Buffer = Buffer;

const CASP_ENDPOINT = "wss://whitecel.com/test/twilio/media";
console.log("✅ IncomingCallHandler ready (background streaming mode)");

// --- µ-Law Decode & Encode ---
function decodeULawToPCM(ulawBuffer) {
  const MULAW_BIAS = 132;
  const decoded = new Int16Array(ulawBuffer.length);
  for (let i = 0; i < ulawBuffer.length; i++) {
    let uByte = 255 - ulawBuffer[i];
    let sign = uByte & 0x80;
    let exponent = (uByte >> 4) & 0x07;
    let mantissa = uByte & 0x0F;
    let magnitude = ((mantissa << 4) + 8) << (exponent + 3);
    magnitude = magnitude - MULAW_BIAS;
    decoded[i] = sign ? -magnitude : magnitude;
  }
  return Buffer.from(decoded.buffer);
}

function encodePCMToULaw(pcmBuffer) {
  const result = Buffer.alloc(pcmBuffer.length / 2);
  for (let i = 0, j = 0; i < pcmBuffer.length; i += 2, j++) {
    const sample = pcmBuffer.readInt16LE(i);
    const sign = (sample >> 8) & 0x80;
    let magnitude = sign ? -sample : sample;
    if (magnitude > 32635) magnitude = 32635;
    magnitude += 132;
    let exponent = 7;
    for (
      let expMask = 0x4000;
      (magnitude & expMask) === 0 && exponent > 0;
      exponent--, expMask >>= 1
    );
    let mantissa = (magnitude >> ((exponent === 0) ? 4 : (exponent + 3))) & 0x0F;
    result[j] = ~(sign | (exponent << 4) | mantissa);
  }
  return result;
}

// --- WAV Wrapper ---
function makeWavFromPCM(pcmBuffer) {
  const dataSize = pcmBuffer.length;
  const header = Buffer.alloc(44);

  header.write("RIFF", 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(8000, 24);
  header.writeUInt32LE(8000 * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(dataSize, 40);

  return Buffer.concat([header, pcmBuffer]);
}

// --- Streaming Playback ---
let pcmQueue = Buffer.alloc(0);
let isPlaying = false;

async function enqueueAudio(base64ULaw) {
  const ulawBuffer = Buffer.from(base64ULaw, "base64");
  const pcmChunk = decodeULawToPCM(ulawBuffer);
  pcmQueue = Buffer.concat([pcmQueue, pcmChunk]);
  if (!isPlaying) processAudioQueue();
}

async function processAudioQueue() {
  isPlaying = true;
  try {
    while (pcmQueue.length >= 16000) {
      const slice = pcmQueue.subarray(0, 16000);
      pcmQueue = pcmQueue.subarray(16000);

      const wavBuffer = makeWavFromPCM(slice);
      const filePath = `${RNFS.CachesDirectoryPath}/chunk-${Date.now()}.wav`;
      await RNFS.writeFile(filePath, wavBuffer.toString("base64"), "base64");

      console.log("🎧 Playing chunk:", filePath);
      try {
        await SoundPlayer.playUrl(`file://${filePath}`);
        await new Promise(res => setTimeout(res, 250));
      } catch (err) {
        console.warn("⚠️ Playback failed:", err.message);
      }
    }
  } finally {
    isPlaying = false;
  }
}

// --- Incoming Call Handler (FCM version) ---
const handleIncomingCall = async (data) => {
  const caller = data?.caller || "Unknown";
  console.log("📞 Background call detected:", caller);

  try {
    const ws = new WebSocket(CASP_ENDPOINT);
    global.caspSocket = ws;

    ws.onopen = async () => {
      console.log("🔌 Connected to CASP (AI stream)");

      ws.send(
        JSON.stringify({
          event: "start",
          start: {
            streamSid: `CASP-${Date.now()}`,
            mediaFormat: {
              encoding: "audio/ulaw",
              sampleRate: 8000,
              channels: 1,
            },
          },
        })
      );

      try {
        AudioRecord.init({
          sampleRate: 8000,
          channels: 1,
          bitsPerSample: 16,
          audioSource: 6,
          bufferSize: 4096,
        });
        AudioRecord.start();
        console.log("🎙️ Mic streaming → CASP (background)");

        AudioRecord.on("data", (chunk) => {
          try {
            if (ws.readyState === WebSocket.OPEN) {
              const pcm = Buffer.from(chunk, "base64");
              const ulaw = encodePCMToULaw(pcm);
              ws.send(
                JSON.stringify({
                  event: "media",
                  streamSid: "CASPStream",
                  media: { payload: ulaw.toString("base64") },
                })
              );
            }
          } catch (err) {
            console.warn("⚠️ Mic chunk send error:", err);
          }
        });
      } catch (micErr) {
        console.error("🎙️ AudioRecord init error:", micErr.message);
      }
    };

    ws.onmessage = async (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.event === "media" && msg.media?.payload) {
          await enqueueAudio(msg.media.payload);
        }
      } catch (err) {
        console.error("⚠️ Message parse/playback error:", err);
      }
    };

    ws.onerror = (err) => {
      console.error("🚨 CASP WebSocket error:", err.message);
    };

    ws.onclose = async () => {
      console.log("🔒 CASP closed — cleaning up");
      try { AudioRecord.stop(); } catch {}
      pcmQueue = Buffer.alloc(0);
    };
  } catch (error) {
    console.error("💥 CASP session start failed:", error);
  }
};

export default handleIncomingCall;




