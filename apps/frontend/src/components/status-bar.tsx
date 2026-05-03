import "./status-bar.css";

interface StatusBarProps {
  wsConnected: boolean;
  gamepadConnected: boolean;
}

export function StatusBar({ wsConnected, gamepadConnected }: StatusBarProps) {
  return (
    <div className="status-bar">
      <div className={`status-item ${wsConnected ? "status-ok" : "status-bad"}`}>
        {wsConnected ? "✓" : "✗"} WebSocket
      </div>
      <div className={`status-item ${gamepadConnected ? "status-ok" : "status-bad"}`}>
        {gamepadConnected ? "✓" : "✗"} Gamepad
      </div>
    </div>
  );
}
