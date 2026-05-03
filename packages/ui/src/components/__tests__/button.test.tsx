import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { Button } from "../button"

describe("Button", () => {
  it("renders with default variant", () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole("button", { name: /click me/i })).toBeInTheDocument()
  })

  it("applies outline variant class", () => {
    render(<Button variant="outline">Outline</Button>)
    expect(screen.getByRole("button", { name: /outline/i })).toHaveClass("border-border")
  })

  it("is disabled when disabled prop is set", () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByRole("button", { name: /disabled/i })).toBeDisabled()
  })

  it("calls onClick when clicked", async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click</Button>)
    await user.click(screen.getByRole("button", { name: /click/i }))
    expect(handleClick).toHaveBeenCalledOnce()
  })

  it("does not call onClick when disabled", async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    render(
      <Button disabled onClick={handleClick}>
        Disabled
      </Button>,
    )
    await user.click(screen.getByRole("button", { name: /disabled/i }))
    expect(handleClick).not.toHaveBeenCalled()
  })
})
