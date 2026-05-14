import { renderHook, act } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

import { useGamepad } from "./use-gamepad"

vi.stubGlobal("__TAURI_INTERNALS__", {})

const { listenerCallbacks, mockUnlistenDirection, mockUnlistenConnected, mockUnlistenDisconnected } = vi.hoisted(() => {
  const callbacks: Record<string, (payload: unknown) => void> = {}
  return {
    listenerCallbacks: callbacks,
    mockUnlistenDirection: vi.fn(),
    mockUnlistenConnected: vi.fn(),
    mockUnlistenDisconnected: vi.fn(),
  }
})

vi.mock("@tauri-apps/api/event", () => ({
  listen: vi.fn((event: string, callback: (event: { payload: unknown }) => void) => {
    listenerCallbacks[event] = (payload: unknown) => callback({ payload })
    const unlistenMap: Record<string, ReturnType<typeof vi.fn>> = {
      "gamepad-direction": mockUnlistenDirection,
      "gamepad-connected": mockUnlistenConnected,
      "gamepad-disconnected": mockUnlistenDisconnected,
    }
    return Promise.resolve(unlistenMap[event] ?? vi.fn())
  }),
}))

describe("useGamepad", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Object.keys(listenerCallbacks).forEach((key) => delete listenerCallbacks[key])
  })

  it("starts with stop direction and disconnected", () => {
    const { result } = renderHook(() => useGamepad())
    expect(result.current.direction).toBe("S")
    expect(result.current.gamepadConnected).toBe(false)
  })

  it("gamepad-direction event updates direction", async () => {
    const { result } = renderHook(() => useGamepad())
    await act(async () => {})

    act(() => {
      listenerCallbacks["gamepad-direction"]!({ direction: "F" })
    })
    expect(result.current.direction).toBe("F")

    act(() => {
      listenerCallbacks["gamepad-direction"]!({ direction: "L" })
    })
    expect(result.current.direction).toBe("L")
  })

  it("gamepad-connected event sets connected", async () => {
    const { result } = renderHook(() => useGamepad())
    await act(async () => {})

    act(() => {
      listenerCallbacks["gamepad-connected"]!({ name: "Steam Deck Controller" })
    })
    expect(result.current.gamepadConnected).toBe(true)
  })

  it("gamepad-disconnected event resets state", async () => {
    const { result } = renderHook(() => useGamepad())
    await act(async () => {})

    act(() => {
      listenerCallbacks["gamepad-connected"]!({ name: "Steam Deck Controller" })
    })
    expect(result.current.gamepadConnected).toBe(true)

    act(() => {
      listenerCallbacks["gamepad-disconnected"]!({ name: "Steam Deck Controller" })
    })
    expect(result.current.gamepadConnected).toBe(false)
    expect(result.current.direction).toBe("S")
  })

  it("cleanup calls all unlisteners", async () => {
    const { unmount } = renderHook(() => useGamepad())
    await act(async () => {})
    unmount()
    expect(mockUnlistenDirection).toHaveBeenCalled()
    expect(mockUnlistenConnected).toHaveBeenCalled()
    expect(mockUnlistenDisconnected).toHaveBeenCalled()
  })

  it("multiple direction changes work", async () => {
    const { result } = renderHook(() => useGamepad())
    await act(async () => {})

    act(() => {
      listenerCallbacks["gamepad-direction"]!({ direction: "F" })
    })
    expect(result.current.direction).toBe("F")

    act(() => {
      listenerCallbacks["gamepad-direction"]!({ direction: "R" })
    })
    expect(result.current.direction).toBe("R")

    act(() => {
      listenerCallbacks["gamepad-direction"]!({ direction: "S" })
    })
    expect(result.current.direction).toBe("S")
  })

  it("exposes gamepadName from connected event", async () => {
    const { result } = renderHook(() => useGamepad())
    await act(async () => {})

    act(() => {
      listenerCallbacks["gamepad-connected"]!({ name: "8BitDo Ultimate 2" })
    })
    expect(result.current.gamepadName).toBe("8BitDo Ultimate 2")
    expect(result.current.gamepadConnected).toBe(true)
  })

  it("clears gamepadName on disconnect", async () => {
    const { result } = renderHook(() => useGamepad())
    await act(async () => {})

    act(() => {
      listenerCallbacks["gamepad-connected"]!({ name: "Xbox Controller" })
    })
    expect(result.current.gamepadName).toBe("Xbox Controller")

    act(() => {
      listenerCallbacks["gamepad-disconnected"]!({ name: "Xbox Controller" })
    })
    expect(result.current.gamepadName).toBe(null)
    expect(result.current.gamepadConnected).toBe(false)
  })

  it("gamepadName starts null", () => {
    const { result } = renderHook(() => useGamepad())
    expect(result.current.gamepadName).toBe(null)
  })

  it("isDeck remains in return for backward compat", () => {
    const { result } = renderHook(() => useGamepad())
    expect(result.current.isDeck).toBe(false)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })
})
