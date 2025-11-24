import { AppState } from "react-native";
import uuid from "react-native-uuid";
import { navigate } from "../navigation/NavigationService";

let ws = null;
let heartbeat = null;
let lastPong = Date.now();
let reconnectTimer = null;
let retryCount = 0;

let isIncomingUiShown = false;
let activeCallId = null;
let activeCaller = null;

// -------------------------------
// CONFIG — SET YOUR LOCAL IP HERE
// -------------------------------
const SIGNAL_HOST = "192.168.1.2";   // <— YOUR LAPTOP IP
const SIGNAL_PORT = "8080";

// -------------------------------
// PUBLIC: Initialize WS connection
// -------------------------------
export function setupVoipSignal(userId) {
  if (!userId) {
    console.error("❌ setupVoipSignal called with EMPTY userId");
    return;
  }

  const SIGNAL_URL = `ws://${SIGNAL_HOST}:${SIGNAL_PORT}/?user=${userId}`;

  // If already open/connecting, ignore
  if (ws && (ws.readyState === 0 || ws.readyState === 1)) {
    console.log("⚙️ WS already connected or connecting...");
    return;
  }

  console.log("🔗 Connecting WS:", SIGNAL_URL);

  try {
    ws = new WebSocket(SIGNAL_URL);
  } catch (e) {
    console.error("❌ Could not create WebSocket:", e.message);
    scheduleReconnect(userId);
    return;
  }

  ws.onopen = () => {
    console.log(`📡 WS connected as: ${userId}`);
    retryCount = 0;
    startHeartbeat();
  };

  ws.onerror = (err) => {
    console.warn("⚠️ WS Error:", err.message || err);
  };

  ws.onclose = () => {
    console.warn("🔌 WS closed");
    stopHeartbeat();
    scheduleReconnect(userId);
  };

  ws.onmessage = (e) => {
    try {
      const data = JSON.parse(e.data);

      // Handle heartbeat
      if (data.type === "pong") {
        lastPong = Date.now();
        return;
      }

      switch (data.event) {
        // -----------------------------
        // 📞 Someone is calling you
        // -----------------------------
        case "incoming_call":
          handleIncoming(data);
          break;

        // -----------------------------
        // 🎯 CASP session ready
        // -----------------------------
        case "call_ready":
          console.log("🎯 call_ready received:", data);

          navigate("VoiceCallScreen", {
            ws_url: data.ws_url,
            peer: data.by,  // who accepted
          });

          resetIncomingFlags();
          break;

        // -----------------------------
        // ❌ Caller rejected
        // -----------------------------
        case "call_rejected":
          console.log(`❌ Call rejected by ${data.by}`);

          if (isIncomingUiShown) {
            navigate("Main");
          }

          resetIncomingFlags();
          break;

        // Fallback for anything else
        default:
          console.log("📨 Unhandled message:", data);
      }
    } catch (err) {
      console.error("⚠️ WS parse error:", err);
    }
  };
}

// -------------------------------
// Handle Incoming Call
// -------------------------------
function handleIncoming(data) {
  console.log("📞 Incoming call from:", data.from);

  activeCallId = uuid.v4();
  activeCaller = data.from;
  isIncomingUiShown = true;

  if (AppState.currentState === "active") {
    navigate("IncomingCallScreen", {
      callId: activeCallId,
      caller: data.from,
    });
  } else {
    console.log("📱 App is background → Notification should handle UI");
  }
}

// -------------------------------
// Reconnect Logic
// -------------------------------
function scheduleReconnect(userId) {
  if (reconnectTimer) return;

  const delay = Math.min(30000, 1000 * Math.pow(2, retryCount++));

  console.log(`🔁 WS reconnect in ${delay / 1000}s`);

  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    setupVoipSignal(userId);
  }, delay);
}

// -------------------------------
// Heartbeat — Keeps Connection Alive
// -------------------------------
function startHeartbeat() {
  stopHeartbeat();
  heartbeat = setInterval(() => {
    if (ws?.readyState === 1) {
      ws.send(JSON.stringify({ type: "ping" }));

      if (Date.now() - lastPong > 30000) {
        console.log("⏱️ No pong → reconnect");
        ws.close();
      }
    }
  }, 10000);
}

function stopHeartbeat() {
  if (heartbeat) clearInterval(heartbeat);
  heartbeat = null;
}

// -------------------------------
// Public: Send signal to server
// -------------------------------
export function sendSignal(data) {
  if (ws?.readyState === 1) {
    ws.send(JSON.stringify(data));
  } else {
    console.warn("⚠️ WS not ready:", data);
  }
}

// -------------------------------
// Reset incoming call UI flags
// -------------------------------
function resetIncomingFlags() {
  isIncomingUiShown = false;
  activeCallId = null;
  activeCaller = null;
}
