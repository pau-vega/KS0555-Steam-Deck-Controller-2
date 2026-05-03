#!/bin/bash
INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command')

# Block npm commands (but not npx, which is fine)
if echo "$COMMAND" | grep -qE '(^|[;&|]\s*)npm\s+(install|ci|run|start|test|build|add|remove|uninstall|update|init|publish|exec|ls|outdated|prune|dedupe|audit|fund|pack|link|unlink|rebuild|cache|config|set|get|version|view|search|login|logout|whoami|token|profile|access|owner|deprecate|dist-tag|prefix|root|explore|help|completion|doctor|ping|bugs|repo|star|stars|unstar|team|shrinkwrap)(\s|$|;|&|\|)'; then
  echo "Blocked: use pnpm instead of npm. This is a pnpm monorepo." >&2
  exit 2
fi

# Block bare "npm install" / "npm i" with no subcommand args
if echo "$COMMAND" | grep -qE '(^|[;&|]\s*)npm\s+(i|install)\s*($|;|&|\|)'; then
  echo "Blocked: use 'pnpm install' instead of 'npm install'." >&2
  exit 2
fi

# Block yarn commands
if echo "$COMMAND" | grep -qE '(^|[;&|]\s*)yarn(\s|$|;|&|\|)'; then
  echo "Blocked: use pnpm instead of yarn. This is a pnpm monorepo." >&2
  exit 2
fi

exit 0
