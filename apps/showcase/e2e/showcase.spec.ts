import { expect, test } from "@playwright/test"

test.describe("Showcase app", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
  })

  test.describe("Smoke tests", () => {
    test("loads with tab bar showing all 6 tabs", async ({ page }) => {
      const tabs = ["Forms", "Overlays", "Navigation", "Feedback", "Data Display", "Layout"]

      for (const tab of tabs) {
        await expect(page.getByRole("tab", { name: tab })).toBeVisible()
      }
    })

    test("default Forms tab is active with form components", async ({ page }) => {
      await expect(page.getByRole("tab", { name: "Forms", selected: true })).toBeVisible()
      await expect(page.getByRole("tabpanel")).toBeVisible()
    })
  })

  test.describe("Tab navigation", () => {
    test("Overlays tab shows dialog, hover card, popover, and tooltip", async ({ page }) => {
      await page.getByRole("tab", { name: "Overlays" }).click()

      await expect(page.getByRole("button", { name: "Open Dialog" })).toBeVisible()
      await expect(page.getByRole("button", { name: "@nextjs" })).toBeVisible()
      await expect(page.getByRole("button", { name: "Open Popover" })).toBeVisible()
      await expect(page.getByRole("button", { name: "Hover me" })).toBeVisible()
    })

    test("Navigation tab shows breadcrumbs, pagination, and tabs", async ({ page }) => {
      await page.getByRole("tab", { name: "Navigation" }).click()

      await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toBeVisible()
      await expect(page.getByRole("navigation", { name: "pagination" })).toBeVisible()
      await expect(page.getByRole("tab", { name: "Account" })).toBeVisible()
    })

    test("Feedback tab shows alerts, badges, progress, and empty state", async ({ page }) => {
      await page.getByRole("tab", { name: "Feedback" }).click()

      await expect(page.getByText("New update available")).toBeVisible()
      await expect(page.getByText("Security warning")).toBeVisible()
      await expect(page.getByText("Default")).toBeVisible()
      await expect(page.getByText("Uploading…")).toBeVisible()
      await expect(page.getByText("No files found")).toBeVisible()
    })

    test("Data Display tab shows accordion, avatar, and table", async ({ page }) => {
      await page.getByRole("tab", { name: "Data Display" }).click()

      await expect(page.getByRole("button", { name: "Is it accessible?" })).toBeVisible()
      await expect(page.getByRole("button", { name: "Is it styled?" })).toBeVisible()
      await expect(page.getByText("INV001")).toBeVisible()
      await expect(page.getByText("INV004")).toBeVisible()
    })

    test("Layout tab shows card and separators", async ({ page }) => {
      await page.getByRole("tab", { name: "Layout" }).click()

      await expect(page.getByText("Observability Plus is replacing Monitoring")).toBeVisible()
      await expect(page.getByText("Horizontal")).toBeVisible()
    })
  })

  test.describe("Interactive flows", () => {
    test("Dialog opens and closes", async ({ page }) => {
      await page.getByRole("tab", { name: "Overlays" }).click()
      await page.getByRole("button", { name: "Open Dialog" }).click()

      await expect(page.getByRole("heading", { name: "Edit profile" })).toBeVisible()
      await expect(page.getByRole("textbox", { name: "Name", exact: true })).toBeVisible()
      await expect(page.getByRole("textbox", { name: "Username" })).toBeVisible()

      await page.getByRole("button", { name: "Close" }).first().click()
      await expect(page.getByRole("heading", { name: "Edit profile" })).toBeHidden()
    })

    test("Accordion expands and collapses", async ({ page }) => {
      await page.getByRole("tab", { name: "Data Display" }).click()

      await page.getByRole("button", { name: "Is it accessible?" }).click()
      await expect(page.getByText("Yes. It adheres to the WAI-ARIA design pattern.")).toBeVisible()

      await page.getByRole("button", { name: "Is it accessible?" }).click()
      await expect(page.getByText("Yes. It adheres to the WAI-ARIA design pattern.")).toBeHidden()
    })

    test("Collapsible reveals hidden content", async ({ page }) => {
      await page.getByRole("tab", { name: "Data Display" }).click()

      await page.getByRole("button", { name: "Toggle" }).click()
      await expect(page.getByText("@radix-ui/colors")).toBeVisible()
      await expect(page.getByText("@stitches/react")).toBeVisible()
    })
  })
})
