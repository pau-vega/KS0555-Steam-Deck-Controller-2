import { useState, useEffect, useCallback, useRef } from "react"

import type { Direction } from "./types"

import { ControlPad } from "./components/control-pad"
import { StatusBar } from "./components/status-bar"
import { useBluetooth } from "./hooks/use-bluetooth"
import { useGamepad } from "./hooks/use-gamepad"

const DIRECTION_LABELS: Record<Direction, string> = {
  F: "Forward",
  B: "Backward",
  L: "Left",
  R: "Right",
  S: "Stop",
}

export function App() {
  const [lastCommand, setLastCommand] = useState<Direction>("S")
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const { connected: bleConnected, connecting, connect, send } = useBluetooth()
  const { direction, gamepadConnected } = useGamepad()
  const prevDirection = useRef<Direction>("S")

  const sendCommand = useCallback(
    (cmd: Direction) => {
      send(cmd)
      setLastCommand(cmd)
    },
    [send],
  )

  useEffect(() => {
    if (direction !== prevDirection.current) {
      sendCommand(direction)
      prevDirection.current = direction
    }
  }, [direction, sendCommand])

  const handleConnect = () => {
    setConnectionError(null)
    connect().catch((err: unknown) => setConnectionError(String(err)))
  }

  return (
    <div className="flex flex-col items-center gap-6 p-8 w-full max-w-sm">
      <h1>🤖 Robot Controller</h1>
      <StatusBar bleConnected={bleConnected} gamepadConnected={gamepadConnected} connecting={connecting} />
      {!bleConnected && (
        <>
          <button
            className="px-6 py-3 rounded-xl bg-accent text-white font-medium text-lg disabled:opacity-50 cursor-pointer"
            onClick={handleConnect}
            disabled={connecting}
          >
            {connecting ? "Connecting..." : "Connect Bluetooth"}
          </button>
          {connectionError && (
            <p className="text-sm text-error-text text-center" role="alert">
              {connectionError}
            </p>
          )}
        </>
      )}
      <ControlPad onCommand={sendCommand} disabled={!bleConnected} />
      <div className="text-lg p-3 bg-surface rounded-lg border border-border">
        Last command: <strong className="text-accent text-xl">{lastCommand}</strong>
      </div>
      <div className="text-center">
        <span className="text-sm text-muted">Current direction: </span>
        <span className="text-accent font-bold">{DIRECTION_LABELS[direction]}</span>
      </div>
    </div>
  )
}
