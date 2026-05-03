"use client"

import { Button } from "@monorepo-template/ui/components/button"
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from "@monorepo-template/ui/components/button-group"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@monorepo-template/ui/components/card"
import { Checkbox } from "@monorepo-template/ui/components/checkbox"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@monorepo-template/ui/components/combobox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@monorepo-template/ui/components/dropdown-menu"
import { Field, FieldGroup, FieldLabel } from "@monorepo-template/ui/components/field"
import { Input } from "@monorepo-template/ui/components/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@monorepo-template/ui/components/input-group"
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@monorepo-template/ui/components/input-otp"
import { RadioGroup, RadioGroupItem } from "@monorepo-template/ui/components/radio-group"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@monorepo-template/ui/components/select"
import { Slider } from "@monorepo-template/ui/components/slider"
import { Switch } from "@monorepo-template/ui/components/switch"
import { Textarea } from "@monorepo-template/ui/components/textarea"
import { Toggle } from "@monorepo-template/ui/components/toggle"
import { ToggleGroup, ToggleGroupItem } from "@monorepo-template/ui/components/toggle-group"
import {
  AlignCenterIcon,
  AlignLeftIcon,
  AlignRightIcon,
  BellIcon,
  BoldIcon,
  CreditCardIcon,
  DownloadIcon,
  EyeIcon,
  FileCodeIcon,
  FileIcon,
  FileTextIcon,
  FolderIcon,
  FolderOpenIcon,
  FolderSearchIcon,
  HelpCircleIcon,
  ItalicIcon,
  KeyboardIcon,
  LanguagesIcon,
  LayoutIcon,
  LogOutIcon,
  MailIcon,
  MonitorIcon,
  MoreHorizontalIcon,
  MoreVerticalIcon,
  MoonIcon,
  PaletteIcon,
  PlusIcon,
  SaveIcon,
  SearchIcon,
  SettingsIcon,
  ShieldIcon,
  SunIcon,
  UnderlineIcon,
  UserIcon,
} from "lucide-react"
import * as React from "react"

import { Example, ExampleWrapper } from "@/components/example"

const FRAMEWORKS = ["Next.js", "SvelteKit", "Nuxt.js", "Remix", "Astro"] as const

const ROLE_ITEMS = [
  { label: "Developer", value: "developer" },
  { label: "Designer", value: "designer" },
  { label: "Manager", value: "manager" },
  { label: "Other", value: "other" },
]

export function FormsExamples() {
  return (
    <ExampleWrapper>
      <FormExample />
      <ButtonExample />
      <ButtonGroupExample />
      <CheckboxExample />
      <InputGroupExample />
      <InputOTPExample />
      <RadioGroupExample />
      <SliderExample />
      <SwitchExample />
      <ToggleExample />
      <ToggleGroupExample />
    </ExampleWrapper>
  )
}

function FormExample() {
  const [notifications, setNotifications] = React.useState({
    email: true,
    sms: false,
    push: true,
  })
  const [theme, setTheme] = React.useState("light")

  return (
    <Example title="Form">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>User Information</CardTitle>
          <CardDescription>Please fill in your details below</CardDescription>
          <CardAction>
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
                <MoreVerticalIcon />
                <span className="sr-only">More options</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>File</DropdownMenuLabel>
                  <DropdownMenuItem>
                    <FileIcon />
                    New File
                    <DropdownMenuShortcut>⌘N</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <FolderIcon />
                    New Folder
                    <DropdownMenuShortcut>⇧⌘N</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <FolderOpenIcon />
                      Open Recent
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent>
                        <DropdownMenuGroup>
                          <DropdownMenuLabel>Recent Projects</DropdownMenuLabel>
                          <DropdownMenuItem>
                            <FileCodeIcon />
                            Project Alpha
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileCodeIcon />
                            Project Beta
                          </DropdownMenuItem>
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                              <MoreHorizontalIcon />
                              More Projects
                            </DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                              <DropdownMenuSubContent>
                                <DropdownMenuItem>
                                  <FileCodeIcon />
                                  Project Gamma
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <FileCodeIcon />
                                  Project Delta
                                </DropdownMenuItem>
                              </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                          </DropdownMenuSub>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                          <DropdownMenuItem>
                            <FolderSearchIcon />
                            Browse...
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <SaveIcon />
                    Save
                    <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <DownloadIcon />
                    Export
                    <DropdownMenuShortcut>⇧⌘E</DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuLabel>View</DropdownMenuLabel>
                  <DropdownMenuCheckboxItem
                    checked={notifications.email}
                    onCheckedChange={(checked) =>
                      setNotifications({
                        ...notifications,
                        email: checked === true,
                      })
                    }
                  >
                    <EyeIcon />
                    Show Sidebar
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={notifications.sms}
                    onCheckedChange={(checked) =>
                      setNotifications({
                        ...notifications,
                        sms: checked === true,
                      })
                    }
                  >
                    <LayoutIcon />
                    Show Status Bar
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <PaletteIcon />
                      Theme
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent>
                        <DropdownMenuGroup>
                          <DropdownMenuLabel>Appearance</DropdownMenuLabel>
                          <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
                            <DropdownMenuRadioItem value="light">
                              <SunIcon />
                              Light
                            </DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="dark">
                              <MoonIcon />
                              Dark
                            </DropdownMenuRadioItem>
                            <DropdownMenuRadioItem value="system">
                              <MonitorIcon />
                              System
                            </DropdownMenuRadioItem>
                          </DropdownMenuRadioGroup>
                        </DropdownMenuGroup>
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Account</DropdownMenuLabel>
                  <DropdownMenuItem>
                    <UserIcon />
                    Profile
                    <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <CreditCardIcon />
                    Billing
                  </DropdownMenuItem>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <SettingsIcon />
                      Settings
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent>
                        <DropdownMenuGroup>
                          <DropdownMenuLabel>Preferences</DropdownMenuLabel>
                          <DropdownMenuItem>
                            <KeyboardIcon />
                            Keyboard Shortcuts
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <LanguagesIcon />
                            Language
                          </DropdownMenuItem>
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                              <BellIcon />
                              Notifications
                            </DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                              <DropdownMenuSubContent>
                                <DropdownMenuGroup>
                                  <DropdownMenuLabel>Notification Types</DropdownMenuLabel>
                                  <DropdownMenuCheckboxItem
                                    checked={notifications.push}
                                    onCheckedChange={(checked) =>
                                      setNotifications({
                                        ...notifications,
                                        push: checked === true,
                                      })
                                    }
                                  >
                                    <BellIcon />
                                    Push Notifications
                                  </DropdownMenuCheckboxItem>
                                  <DropdownMenuCheckboxItem
                                    checked={notifications.email}
                                    onCheckedChange={(checked) =>
                                      setNotifications({
                                        ...notifications,
                                        email: checked === true,
                                      })
                                    }
                                  >
                                    <MailIcon />
                                    Email Notifications
                                  </DropdownMenuCheckboxItem>
                                </DropdownMenuGroup>
                              </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                          </DropdownMenuSub>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                          <DropdownMenuItem>
                            <ShieldIcon />
                            Privacy &amp; Security
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <HelpCircleIcon />
                    Help &amp; Support
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <FileTextIcon />
                    Documentation
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem variant="destructive">
                    <LogOutIcon />
                    Sign Out
                    <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardAction>
        </CardHeader>
        <CardContent>
          <form>
            <FieldGroup>
              <div className="grid grid-cols-2 gap-4">
                <Field>
                  <FieldLabel htmlFor="small-form-name">Name</FieldLabel>
                  <Input id="small-form-name" placeholder="Enter your name" required />
                </Field>
                <Field>
                  <FieldLabel htmlFor="small-form-role">Role</FieldLabel>
                  <Select items={ROLE_ITEMS} defaultValue={null}>
                    <SelectTrigger id="small-form-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {ROLE_ITEMS.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <Field>
                <FieldLabel htmlFor="small-form-framework">Framework</FieldLabel>
                <Combobox items={FRAMEWORKS}>
                  <ComboboxInput id="small-form-framework" placeholder="Select a framework" required />
                  <ComboboxContent>
                    <ComboboxEmpty>No frameworks found.</ComboboxEmpty>
                    <ComboboxList>
                      {(item) => (
                        <ComboboxItem key={item} value={item}>
                          {item}
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </Field>
              <Field>
                <FieldLabel htmlFor="small-form-comments">Comments</FieldLabel>
                <Textarea id="small-form-comments" placeholder="Add any additional comments" />
              </Field>
              <Field orientation="horizontal">
                <Button type="submit">Submit</Button>
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full">
            Save draft
          </Button>
        </CardFooter>
      </Card>
    </Example>
  )
}

function ButtonExample() {
  return (
    <Example title="Button">
      <div className="flex flex-wrap gap-2">
        <Button>Default</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="link">Link</Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button size="xs">Extra Small</Button>
        <Button size="sm">Small</Button>
        <Button size="default">Default</Button>
        <Button size="lg">Large</Button>
        <Button size="icon">
          <PlusIcon />
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button disabled>Disabled</Button>
        <Button>
          <DownloadIcon data-icon="inline-start" />
          With Icon
        </Button>
      </div>
    </Example>
  )
}

function ButtonGroupExample() {
  return (
    <Example title="Button Group">
      <div className="flex flex-col gap-4">
        <ButtonGroup>
          <Button variant="outline">Previous</Button>
          <Button variant="outline">Current</Button>
          <Button variant="outline">Next</Button>
        </ButtonGroup>
        <ButtonGroup>
          <ButtonGroupText>
            <SearchIcon />
          </ButtonGroupText>
          <Input placeholder="Search…" className="rounded-none border-x-0 shadow-none focus-visible:ring-0" />
          <Button>Search</Button>
        </ButtonGroup>
        <ButtonGroup orientation="vertical">
          <Button variant="outline">
            <AlignLeftIcon />
            Left
          </Button>
          <ButtonGroupSeparator />
          <Button variant="outline">
            <AlignCenterIcon />
            Center
          </Button>
          <ButtonGroupSeparator />
          <Button variant="outline">
            <AlignRightIcon />
            Right
          </Button>
        </ButtonGroup>
      </div>
    </Example>
  )
}

function CheckboxExample() {
  const [checked, setChecked] = React.useState<boolean>(true)

  return (
    <Example title="Checkbox">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Checkbox id="cb-1" checked={checked} onCheckedChange={(v) => setChecked(v === true)} />
          <FieldLabel htmlFor="cb-1">Accept terms and conditions</FieldLabel>
        </div>
        <div className="flex items-center gap-3">
          <Checkbox id="cb-2" defaultChecked={false} />
          <FieldLabel htmlFor="cb-2">Subscribe to newsletter</FieldLabel>
        </div>
        <div className="flex items-center gap-3">
          <Checkbox id="cb-3" disabled />
          <FieldLabel htmlFor="cb-3">Disabled option</FieldLabel>
        </div>
      </div>
    </Example>
  )
}

function InputGroupExample() {
  return (
    <Example title="Input Group">
      <div className="flex flex-col gap-3">
        <InputGroup>
          <InputGroupAddon align="inline-start">
            <InputGroupText>
              <SearchIcon />
            </InputGroupText>
          </InputGroupAddon>
          <InputGroupInput placeholder="Search…" />
        </InputGroup>
        <InputGroup>
          <InputGroupAddon align="inline-start">
            <InputGroupText>https://</InputGroupText>
          </InputGroupAddon>
          <InputGroupInput placeholder="example.com" />
          <InputGroupAddon align="inline-end">
            <InputGroupButton size="xs">Go</InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        <InputGroup>
          <InputGroupAddon align="inline-start">
            <InputGroupText>$</InputGroupText>
          </InputGroupAddon>
          <InputGroupInput placeholder="0.00" type="number" />
          <InputGroupAddon align="inline-end">
            <InputGroupText>USD</InputGroupText>
          </InputGroupAddon>
        </InputGroup>
      </div>
    </Example>
  )
}

function InputOTPExample() {
  return (
    <Example title="Input OTP">
      <div className="flex flex-col gap-4">
        <InputOTP maxLength={6}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </div>
    </Example>
  )
}

function RadioGroupExample() {
  return (
    <Example title="Radio Group">
      <RadioGroup defaultValue="comfortable">
        <div className="flex items-center gap-3">
          <RadioGroupItem value="default" id="rg-1" />
          <FieldLabel htmlFor="rg-1">Default</FieldLabel>
        </div>
        <div className="flex items-center gap-3">
          <RadioGroupItem value="comfortable" id="rg-2" />
          <FieldLabel htmlFor="rg-2">Comfortable</FieldLabel>
        </div>
        <div className="flex items-center gap-3">
          <RadioGroupItem value="compact" id="rg-3" />
          <FieldLabel htmlFor="rg-3">Compact</FieldLabel>
        </div>
      </RadioGroup>
    </Example>
  )
}

function SliderExample() {
  const [value, setValue] = React.useState([40])
  const [range, setRange] = React.useState([20, 80])

  return (
    <Example title="Slider">
      <FieldGroup>
        <Field>
          <FieldLabel>Single value: {value[0]}</FieldLabel>
          <Slider
            defaultValue={value}
            onValueChange={(v) => setValue(Array.isArray(v) ? [...v] : [v])}
            min={0}
            max={100}
          />
        </Field>
        <Field>
          <FieldLabel>
            Range: {range[0]} – {range[1]}
          </FieldLabel>
          <Slider
            defaultValue={range}
            onValueChange={(v) => setRange(Array.isArray(v) ? [...v] : [v])}
            min={0}
            max={100}
          />
        </Field>
        <Field>
          <FieldLabel>Disabled</FieldLabel>
          <Slider defaultValue={[60]} disabled />
        </Field>
      </FieldGroup>
    </Example>
  )
}

function SwitchExample() {
  const [checked, setChecked] = React.useState(true)

  return (
    <Example title="Switch">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Switch id="sw-sm" size="sm" />
          <FieldLabel htmlFor="sw-sm">Small</FieldLabel>
        </div>
        <div className="flex items-center gap-3">
          <Switch id="sw-default" checked={checked} onCheckedChange={setChecked} />
          <FieldLabel htmlFor="sw-default">Default — {checked ? "On" : "Off"}</FieldLabel>
        </div>
        <div className="flex items-center gap-3">
          <Switch id="sw-disabled" disabled />
          <FieldLabel htmlFor="sw-disabled">Disabled</FieldLabel>
        </div>
      </div>
    </Example>
  )
}

function ToggleExample() {
  return (
    <Example title="Toggle">
      <div className="flex flex-wrap gap-2">
        <Toggle aria-label="Bold">
          <BoldIcon />
        </Toggle>
        <Toggle aria-label="Italic" variant="outline">
          <ItalicIcon />
        </Toggle>
        <Toggle aria-label="Underline" defaultPressed>
          <UnderlineIcon />
        </Toggle>
        <Toggle aria-label="Disabled" disabled>
          <EyeIcon />
        </Toggle>
      </div>
    </Example>
  )
}

function ToggleGroupExample() {
  return (
    <Example title="Toggle Group">
      <div className="flex flex-col gap-4">
        <ToggleGroup defaultValue={["center"]}>
          <ToggleGroupItem value="left" aria-label="Align left">
            <AlignLeftIcon />
          </ToggleGroupItem>
          <ToggleGroupItem value="center" aria-label="Align center">
            <AlignCenterIcon />
          </ToggleGroupItem>
          <ToggleGroupItem value="right" aria-label="Align right">
            <AlignRightIcon />
          </ToggleGroupItem>
        </ToggleGroup>
        <ToggleGroup variant="outline">
          <ToggleGroupItem value="bold" aria-label="Bold">
            <BoldIcon />
          </ToggleGroupItem>
          <ToggleGroupItem value="italic" aria-label="Italic">
            <ItalicIcon />
          </ToggleGroupItem>
          <ToggleGroupItem value="underline" aria-label="Underline">
            <UnderlineIcon />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </Example>
  )
}
