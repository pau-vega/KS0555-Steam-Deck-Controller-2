import { WebSocketServer, WebSocket } from "ws";
import { SerialPort } from "serialport";

const WS_PORT = parseInt(process.env.WS_PORT || "8080", 10);
const SERIAL_PORT = process.env.SERIAL_PORT || "/dev/rfcomm0";
const BAUD_RATE = parseInt(process.env.BAUD_RATE || "9600", 10);

let serialPort: SerialPort | null = null;
let wsClient: WebSocket | null = null;

function connectSerial() {
  console.log(`[serial] Connecting to ${SERIAL_PORT} at ${BAUD_RATE} baud...`);

  try {
    serialPort = new SerialPort({
      path: SERIAL_PORT,
      baudRate: BAUD_RATE,
    });

    serialPort.on("open", () => {
      console.log("[serial] ✓ Connected");
    });

    serialPort.on("error", (err: Error) => {
      console.error(`[serial] ✗ Error: ${err.message}`);
      scheduleReconnect();
    });

    serialPort.on("close", () => {
      console.log("[serial] Disconnected");
      scheduleReconnect();
    });

    serialPort.on("data", (data: Buffer) => {
      const message = data.toString().trim();
      if (message && wsClient?.readyState === WebSocket.OPEN) {
        wsClient.send(JSON.stringify({ type: "serial_data", data: message }));
      }
    });
  } catch (err) {
    console.error(`[serial] ✗ Failed to open: ${(err as Error).message}`);
    scheduleReconnect();
  }
}

function scheduleReconnect() {
  serialPort = null;
  const delay = 3000;
  console.log(`[serial] Reconnecting in ${delay}ms...`);
  setTimeout(connectSerial, delay);
}

function sendToSerial(command: string) {
  if (!serialPort?.isOpen) {
    console.warn(`[serial] Not open, cannot send: ${command}`);
    return;
  }
  serialPort.write(command, (err) => {
    if (err) {
      console.error(`[serial] Write error: ${err.message}`);
    } else {
      console.log(`[serial] → ${command}`);
    }
  });
}

const VALID_COMMANDS = new Set(["F", "B", "L", "R", "S"]);

const wss = new WebSocketServer({ port: WS_PORT });

wss.on("connection", (ws) => {
  console.log("[ws] ✓ Client connected");
  wsClient = ws;

  ws.send(JSON.stringify({
    type: "status",
    serialConnected: serialPort?.isOpen ?? false,
  }));

  ws.on("message", (raw: Buffer) => {
    try {
      const msg = JSON.parse(raw.toString());
      if (msg.type === "command" && VALID_COMMANDS.has(msg.command)) {
        console.log(`[ws] Command: ${msg.command}`);
        sendToSerial(msg.command);
      }
    } catch {
      console.warn("[ws] Invalid message received");
    }
  });

  ws.on("close", () => {
    console.log("[ws] Client disconnected — sending STOP");
    wsClient = null;
    sendToSerial("S");
  });

  ws.on("error", (err) => {
    console.error(`[ws] Error: ${err.message}`);
  });
});

wss.on("listening", () => {
  console.log(`[ws] Server listening on ws://localhost:${WS_PORT}`);
});

wss.on("error", (err) => {
  console.error(`[ws] Server error: ${err.message}`);
});

connectSerial();

process.on("SIGINT", () => {
  console.log("\n[app] Shutting down...");
  sendToSerial("S");
  serialPort?.close();
  wss.close();
  process.exit(0);
});
