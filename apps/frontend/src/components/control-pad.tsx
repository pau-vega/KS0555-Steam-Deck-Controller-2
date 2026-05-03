import type { Direction } from "../types";
import "./control-pad.css";

const BUTTONS: { label: string; command: Direction; gridArea: string }[] = [
  { label: "▲", command: "F", gridArea: "1 / 2" },
  { label: "◀", command: "L", gridArea: "2 / 1" },
  { label: "■", command: "S", gridArea: "2 / 2" },
  { label: "▶", command: "R", gridArea: "2 / 3" },
  { label: "▼", command: "B", gridArea: "3 / 2" },
];

interface ControlPadProps {
  onCommand: (command: Direction) => void;
  disabled: boolean;
}

export function ControlPad({ onCommand, disabled }: ControlPadProps) {
  return (
    <div className="control-pad">
      {BUTTONS.map(({ label, command, gridArea }) => (
        <button
          key={command}
          className={`control-btn btn-${command.toLowerCase()}`}
          onClick={() => onCommand(command)}
          disabled={disabled}
          style={{ gridArea }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
