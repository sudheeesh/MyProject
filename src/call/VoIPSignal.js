// src/call/VoIPSignal.js
// src/call/VoIPSignal.js
import { AppState } from "react-native";
import uuid from "react-native-uuid";
import { navigate } from "../navigation/NavigationService";

let ws = null;
let reconnectTimer = null;
let retryCount = 0;
let heartbeat = null;
let lastPong = Date.now();

let activeCallId = null;
let activeCaller = null;
let isIncomingUiShown = false;

// -------------------------------
// CONNECT TO SIGNAL SERVER
// -------------------------------
export function setupVoipSignal(userId) {
  const SIGNAL_URL = `ws://10.140.147.47:8080?user=${encodeURIComponent(userId)}`;

  if (ws && (ws.readyState === 0 || ws.readyState === 1)) {
    console.log("⚙️ Already connected or connecting...");
    return;
  }

  try {
    ws = new WebSocket(SIGNAL_URL);
  } catch (err) {
    console.error("❌ WebSocket creation failed:", err.message);
    scheduleReconnect(userId);
    return;
  }

  ws.onopen = () => {
    console.log(`📡 Connected as ${userId}`);
    retryCount = 0;
    startHeartbeat();
  };

  ws.onmessage = (e) => {
    try {
      const data = JSON.parse(e.data);

      // Pong response
      if (data.type === "pong") {
        lastPong = Date.now();
        return;
      }

      switch (data.event) {
        // -----------------------------
        // INCOMING CALL FROM SIGNAL SERVER
        // -----------------------------
        case "incoming_call":
          handleIncomingSignaling(data);
          break;

        // -----------------------------
        // CALL ACCEPTED BY REMOTE USER
        // -----------------------------
        case "call_accepted":
          console.log(`📞 Call accepted by ${data.by}`);
          navigate("VoiceCallScreen", {
            ws_url: data.ws_url,
            peer: data.by,
          });
          resetIncomingFlags();
          break;

        // -----------------------------
        // CALL REJECTED
        // -----------------------------
        case "call_rejected":
          console.log(`❌ Call rejected by ${data.by}`);
          if (isIncomingUiShown) navigate("Main");
          resetIncomingFlags();
          break;

        // -----------------------------
        // CALL READY → NAVIGATE TO CALL UI
        // -----------------------------
        case "call_ready":
          console.log("🎯 Call ready → navigating to call UI");
          navigate("VoiceCallScreen", {
            ws_url: data.ws_url,
            peer: data.by || "AI",
          });
          resetIncomingFlags();
          break;

        default:
          console.log("📨 Unhandled signaling event:", data);
      }
    } catch (err) {
      console.error("⚠️ Signaling parse error:", err);
    }
  };

  ws.onerror = (err) => {
    console.warn("⚠️ Signal WS error:", err?.message || err);
  };

  ws.onclose = () => {
    console.warn("🔌 Signal disconnected");
    stopHeartbeat();
    scheduleReconnect(userId);
  };
}

// -------------------------------
// HANDLE INCOMING CALL UI ENTRY
// -------------------------------
function handleIncomingSignaling(data) {
  console.log("📞 Incoming call from:", data.from);

  activeCallId = uuid.v4();
  activeCaller = data.from;

  if (AppState.currentState === "active") {
    isIncomingUiShown = true;
    navigate("IncomingCallScreen", {
      callId: activeCallId,
      caller: data.from,
      ws_url: data.ws_url,
    });
  } else {
    // Background → your Firebase notification should trigger UI automatically
    console.log("📱 App in background → FCM should wake UI");
  }
}

// -------------------------------
// RECONNECT / HEARTBEAT
// -------------------------------
function scheduleReconnect(userId) {
  if (reconnectTimer) return;

  const delay = Math.min(30000, 1000 * Math.pow(2, retryCount++));
  console.log(`🔁 Reconnecting in ${Math.round(delay / 1000)}s`);

  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    setupVoipSignal(userId);
  }, delay);
}

function startHeartbeat() {
  stopHeartbeat();
  heartbeat = setInterval(() => {
    if (!ws || ws.readyState !== 1) return;
    ws.send(JSON.stringify({ type: "ping" }));
    if (Date.now() - lastPong > 30000) {
      console.warn("⏱️ No pong in 30s → reconnecting...");
      ws.close();
    }
  }, 10000);
}

function stopHeartbeat() {
  if (heartbeat) clearInterval(heartbeat);
  heartbeat = null;
}

// -------------------------------
// SEND SIGNAL TO SERVER
// -------------------------------
export function sendSignal(data) {
  if (ws?.readyState === 1) {
    ws.send(JSON.stringify(data));
  } else {
    console.warn("⚠️ Tried sending signal but socket not ready:", data);
  }
}

// -------------------------------
// RESET INCOMING UI FLAGS
// -------------------------------
function resetIncomingFlags() {
  isIncomingUiShown = false;
  activeCallId = null;
  activeCaller = null;
}
