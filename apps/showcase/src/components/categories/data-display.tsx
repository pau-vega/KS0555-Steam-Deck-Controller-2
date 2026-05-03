"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@monorepo-template/ui/components/accordion"
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@monorepo-template/ui/components/avatar"
import { Badge } from "@monorepo-template/ui/components/badge"
import { Button } from "@monorepo-template/ui/components/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@monorepo-template/ui/components/collapsible"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@monorepo-template/ui/components/item"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@monorepo-template/ui/components/table"
import { ChevronDownIcon, MailIcon, MoreHorizontalIcon, Package2Icon, UsersIcon } from "lucide-react"
import * as React from "react"

import { Example, ExampleWrapper } from "@/components/example"

const INVOICES = [
  { invoice: "INV001", status: "Paid", method: "Credit Card", amount: "$250.00" },
  { invoice: "INV002", status: "Pending", method: "PayPal", amount: "$150.00" },
  { invoice: "INV003", status: "Unpaid", method: "Bank Transfer", amount: "$350.00" },
  { invoice: "INV004", status: "Paid", method: "Credit Card", amount: "$450.00" },
]

export function DataDisplayExamples() {
  return (
    <ExampleWrapper>
      <AccordionExample />
      <AvatarExample />
      <CollapsibleExample />
      <ItemExample />
      <TableExample />
    </ExampleWrapper>
  )
}

function AccordionExample() {
  return (
    <Example title="Accordion">
      <Accordion>
        <AccordionItem value="item-1">
          <AccordionTrigger>Is it accessible?</AccordionTrigger>
          <AccordionContent>Yes. It adheres to the WAI-ARIA design pattern.</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Is it styled?</AccordionTrigger>
          <AccordionContent>
            Yes. It comes with default styles that matches the other components&apos; aesthetic.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-3">
          <AccordionTrigger>Is it animated?</AccordionTrigger>
          <AccordionContent>Yes. It&apos;s animated by default, but you can disable it if you prefer.</AccordionContent>
        </AccordionItem>
      </Accordion>
    </Example>
  )
}

function AvatarExample() {
  return (
    <Example title="Avatar">
      <div className="flex flex-wrap items-center gap-4">
        <Avatar size="sm">
          <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
          <AvatarFallback>SC</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
          <AvatarFallback>SC</AvatarFallback>
        </Avatar>
        <Avatar size="lg">
          <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
          <AvatarFallback>SC</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback>JD</AvatarFallback>
          <AvatarBadge />
        </Avatar>
      </div>
      <AvatarGroup>
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
          <AvatarFallback>SC</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback>AB</AvatarFallback>
        </Avatar>
        <AvatarGroupCount>+3</AvatarGroupCount>
      </AvatarGroup>
    </Example>
  )
}

function CollapsibleExample() {
  const [open, setOpen] = React.useState(false)

  return (
    <Example title="Collapsible">
      <Collapsible open={open} onOpenChange={setOpen} className="w-full space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">@peduarte starred 3 repositories</p>
          <CollapsibleTrigger render={<Button variant="ghost" size="icon-sm" />}>
            <ChevronDownIcon className={open ? "rotate-180 transition-transform" : "transition-transform"} />
            <span className="sr-only">Toggle</span>
          </CollapsibleTrigger>
        </div>
        <div className="rounded-md border px-4 py-3 text-sm font-mono">@radix-ui/primitives</div>
        <CollapsibleContent className="space-y-2">
          <div className="rounded-md border px-4 py-3 text-sm font-mono">@radix-ui/colors</div>
          <div className="rounded-md border px-4 py-3 text-sm font-mono">@stitches/react</div>
        </CollapsibleContent>
      </Collapsible>
    </Example>
  )
}

function ItemExample() {
  return (
    <Example title="Item">
      <ItemGroup>
        <Item variant="outline">
          <ItemMedia variant="icon">
            <Package2Icon />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Product Update</ItemTitle>
            <ItemDescription>New features added to the dashboard module.</ItemDescription>
          </ItemContent>
          <ItemActions>
            <Badge variant="secondary">New</Badge>
          </ItemActions>
        </Item>
        <Item variant="outline">
          <ItemMedia variant="icon">
            <UsersIcon />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Team Members</ItemTitle>
            <ItemDescription>3 new members joined your workspace.</ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button variant="ghost" size="icon-sm">
              <MoreHorizontalIcon />
            </Button>
          </ItemActions>
        </Item>
        <Item variant="muted">
          <ItemMedia variant="icon">
            <MailIcon />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Inbox</ItemTitle>
            <ItemDescription>You have 5 unread messages.</ItemDescription>
          </ItemContent>
          <ItemActions>
            <Badge>5</Badge>
          </ItemActions>
        </Item>
      </ItemGroup>
    </Example>
  )
}

function TableExample() {
  return (
    <Example title="Table" containerClassName="md:col-span-2">
      <Table>
        <TableCaption>A list of your recent invoices.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Method</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {INVOICES.map((inv) => (
            <TableRow key={inv.invoice}>
              <TableCell className="font-medium">{inv.invoice}</TableCell>
              <TableCell>
                <Badge
                  variant={inv.status === "Paid" ? "default" : inv.status === "Pending" ? "secondary" : "destructive"}
                >
                  {inv.status}
                </Badge>
              </TableCell>
              <TableCell>{inv.method}</TableCell>
              <TableCell className="text-right">{inv.amount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Example>
  )
}
