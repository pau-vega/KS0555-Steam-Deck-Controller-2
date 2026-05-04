interface StatusBarProps {
  wsConnected: boolean;
  gamepadConnected: boolean;
  connecting?: boolean;
}

export function StatusBar({ wsConnected, gamepadConnected, connecting }: StatusBarProps) {
  return (
    <div className="flex gap-4 w-full justify-center">
      <div className={`px-3 py-1 rounded-full text-sm font-medium ${wsConnected ? 'bg-success text-success-text' : 'bg-error text-error-text'}`}>
        {connecting ? '⏳ Connecting...' : wsConnected ? '✓' : '✗'} Backend
      </div>
      <div className={`px-3 py-1 rounded-full text-sm font-medium ${gamepadConnected ? 'bg-success text-success-text' : 'bg-error text-error-text'}`}>
        {gamepadConnected ? '✓' : '✗'} Gamepad
      </div>
    </div>
  );
}
