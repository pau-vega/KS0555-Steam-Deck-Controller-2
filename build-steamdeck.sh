#!/bin/bash
set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "=== Steam Deck AppImage Build ==="
echo ""

# --- Check platform ---
if [ ! -f /etc/os-release ] || ! grep -qi "steamos\|arch" /etc/os-release 2>/dev/null; then
  echo -e "${YELLOW}Warning: not detected as SteamOS/Arch. Proceeding anyway.${NC}"
fi

IS_STEAMOS=false
grep -qi "steamos" /etc/os-release 2>/dev/null && IS_STEAMOS=true

# --- Workaround: Homebrew pkg-config conflicts ---
if command -v brew &>/dev/null; then
  BREW_PREFIX="$(brew --prefix 2>/dev/null || true)"
  if [ -n "${BREW_PREFIX}" ]; then
    echo -e "${YELLOW}Homebrew detected at ${BREW_PREFIX}${NC}"
    echo -e "${YELLOW}Setting PKG_CONFIG_PATH to prefer system pkg-config${NC}"
    export PKG_CONFIG_PATH="/usr/lib/pkgconfig:/usr/share/pkgconfig:/usr/lib/x86_64-linux-gnu/pkgconfig${PKG_CONFIG_PATH:+:${PKG_CONFIG_PATH}}"
    export PATH="$(echo "$PATH" | tr ':' '\n' | grep -v "${BREW_PREFIX}" | tr '\n' ':' | sed 's/:$//')"
    echo -e "${YELLOW}Filtered Homebrew out of PATH for this build${NC}"
  fi
fi

# --- System deps ---
DEPS=(webkit2gtk-4.1 librsvg patchelf fuse2)

if command -v pacman &>/dev/null; then
  MISSING=()
  for pkg in "${DEPS[@]}"; do
    pacman -Qi "$pkg" &>/dev/null || MISSING+=("$pkg")
  done

  if [ ${#MISSING[@]} -gt 0 ]; then
    echo -e "${YELLOW}Missing deps: ${MISSING[*]}${NC}"
    if $IS_STEAMOS; then
      echo "Disabling read-only filesystem..."
      sudo steamos-readonly disable
    fi
    echo "Installing via pacman..."
    sudo pacman -S --needed "${MISSING[@]}"
    if $IS_STEAMOS; then
      echo "Re-enabling read-only filesystem..."
      sudo steamos-readonly enable
    fi
  else
    echo -e "${GREEN}All system deps found.${NC}"
  fi
elif command -v apt-get &>/dev/null; then
  DEPS_APT=(libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf libfuse2)
  echo "Debian/Ubuntu detected. Installing: ${DEPS_APT[*]}"
  sudo apt-get update
  sudo apt-get install -y "${DEPS_APT[@]}"
else
  echo -e "${RED}No supported package manager found. Install deps manually:${NC}"
  echo "  arch:  sudo pacman -S webkit2gtk-4.1 librsvg patchelf fuse2"
  echo "  ubuntu: sudo apt install libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf libfuse2"
  exit 1
fi

# --- Install custom tauri-cli (truly portable AppImage) ---
TAURI_CLI_SRC="https://github.com/tauri-apps/tauri"
TAURI_CLI_BRANCH="feat/truly-portable-appimage"

if cargo install --list 2>/dev/null | grep -q "^tauri-cli"; then
  echo -e "${GREEN}tauri-cli already installed.${NC}"
else
  echo -e "${YELLOW}Installing tauri-cli from ${TAURI_CLI_BRANCH}...${NC}"
  echo "  (one-time compile, may take a few minutes)"
  cargo install tauri-cli --git "${TAURI_CLI_SRC}" --branch "${TAURI_CLI_BRANCH}"
fi

# --- Build ---
echo ""
echo -e "${GREEN}Building AppImage (new sharun format)...${NC}"
pnpm build
(cd apps/frontend/src-tauri && cargo tauri build \
  --config '{"bundle":{"linux":{"appimage":{"useNewFormat":true}}}}')

echo ""
echo -e "${GREEN}Done. AppImage should be in apps/frontend/src-tauri/target/release/bundle/appimage/${NC}"
