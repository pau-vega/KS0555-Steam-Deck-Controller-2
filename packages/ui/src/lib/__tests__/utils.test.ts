import { describe, expect, it } from "vitest"

import { cn } from "../utils"

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar")
  })
  it("handles undefined/null", () => {
    expect(cn("foo", undefined, null, "bar")).toBe("foo bar")
  })
  it("handles conditional classes", () => {
    expect(cn("base", { active: true, inactive: false })).toBe("base active")
  })
  it("deduplicates Tailwind via tailwind-merge", () => {
    expect(cn("p-4", "p-8")).toBe("p-8")
  })
  it("returns empty string for no input", () => {
    expect(cn()).toBe("")
  })
})
