"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@monorepo-template/ui/components/avatar"
import { Button } from "@monorepo-template/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@monorepo-template/ui/components/dialog"
import { Field, FieldGroup, FieldLabel } from "@monorepo-template/ui/components/field"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@monorepo-template/ui/components/hover-card"
import { Input } from "@monorepo-template/ui/components/input"
import { Kbd, KbdGroup } from "@monorepo-template/ui/components/kbd"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@monorepo-template/ui/components/popover"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@monorepo-template/ui/components/tooltip"
import { CalendarIcon, SearchIcon, TrashIcon } from "lucide-react"

import { Example, ExampleWrapper } from "@/components/example"

export function OverlaysExamples() {
  return (
    <ExampleWrapper>
      <DialogExample />
      <HoverCardExample />
      <PopoverExample />
      <TooltipExample />
    </ExampleWrapper>
  )
}

function DialogExample() {
  return (
    <Example title="Dialog">
      <div className="flex flex-wrap gap-2">
        <Dialog>
          <DialogTrigger render={<Button variant="outline" />}>Open Dialog</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit profile</DialogTitle>
              <DialogDescription>
                Make changes to your profile here. Click save when you&apos;re done.
              </DialogDescription>
            </DialogHeader>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="dialog-name">Name</FieldLabel>
                <Input id="dialog-name" defaultValue="Pedro Duarte" />
              </Field>
              <Field>
                <FieldLabel htmlFor="dialog-username">Username</FieldLabel>
                <Input id="dialog-username" defaultValue="@peduarte" />
              </Field>
            </FieldGroup>
            <DialogFooter showCloseButton>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Example>
  )
}

function HoverCardExample() {
  return (
    <Example title="Hover Card">
      <div className="flex flex-wrap gap-2">
        <HoverCard>
          <HoverCardTrigger>
            <Button variant="link">@nextjs</Button>
          </HoverCardTrigger>
          <HoverCardContent>
            <div className="flex gap-3">
              <Avatar>
                <AvatarImage src="https://github.com/vercel.png" alt="@vercel" />
                <AvatarFallback>VC</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <p className="text-sm font-medium">@nextjs</p>
                <p className="text-muted-foreground text-xs">
                  The React Framework – created and maintained by @vercel.
                </p>
                <div className="text-muted-foreground flex items-center gap-1 pt-1 text-xs">
                  <CalendarIcon className="size-3" />
                  Joined December 2021
                </div>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
      </div>
    </Example>
  )
}

function PopoverExample() {
  return (
    <Example title="Popover">
      <div className="flex flex-wrap gap-2">
        <Popover>
          <PopoverTrigger render={<Button variant="outline" />}>
            <CalendarIcon data-icon="inline-start" />
            Open Popover
          </PopoverTrigger>
          <PopoverContent>
            <PopoverHeader>
              <PopoverTitle>Popover Title</PopoverTitle>
              <PopoverDescription>This is a popover description with more context.</PopoverDescription>
            </PopoverHeader>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="popover-width">Width</FieldLabel>
                <Input id="popover-width" defaultValue="100%" />
              </Field>
              <Field>
                <FieldLabel htmlFor="popover-height">Height</FieldLabel>
                <Input id="popover-height" defaultValue="25px" />
              </Field>
            </FieldGroup>
            <Button className="w-full">Apply changes</Button>
          </PopoverContent>
        </Popover>
      </div>
    </Example>
  )
}

function TooltipExample() {
  return (
    <Example title="Tooltip">
      <TooltipProvider>
        <div className="flex flex-wrap gap-4">
          <Tooltip>
            <TooltipTrigger render={<Button variant="outline" />}>Hover me</TooltipTrigger>
            <TooltipContent>This is a tooltip</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger render={<Button variant="outline" size="icon" />}>
              <SearchIcon />
              <span className="sr-only">Search</span>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              Search
              <KbdGroup>
                <Kbd>⌘</Kbd>
                <Kbd>K</Kbd>
              </KbdGroup>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger render={<Button variant="outline" size="icon" />}>
              <TrashIcon />
              <span className="sr-only">Delete</span>
            </TooltipTrigger>
            <TooltipContent side="right">Delete item</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </Example>
  )
}
