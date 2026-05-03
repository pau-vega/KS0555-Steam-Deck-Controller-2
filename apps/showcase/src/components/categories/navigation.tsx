"use client"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@monorepo-template/ui/components/breadcrumb"
import { Button } from "@monorepo-template/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@monorepo-template/ui/components/card"
import { Field, FieldGroup, FieldLabel } from "@monorepo-template/ui/components/field"
import { Input } from "@monorepo-template/ui/components/input"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@monorepo-template/ui/components/pagination"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@monorepo-template/ui/components/tabs"

import { Example, ExampleWrapper } from "@/components/example"

export function NavigationExamples() {
  return (
    <ExampleWrapper>
      <BreadcrumbExample />
      <PaginationExample />
      <TabsExample />
    </ExampleWrapper>
  )
}

function BreadcrumbExample() {
  return (
    <Example title="Breadcrumb">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Components</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </Example>
  )
}

function PaginationExample() {
  return (
    <Example title="Pagination">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" isActive>
              2
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">3</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">10</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </Example>
  )
}

function TabsExample() {
  return (
    <Example title="Tabs">
      <Tabs defaultValue="account">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>Make changes to your account here.</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="tabs-name">Name</FieldLabel>
                  <Input id="tabs-name" defaultValue="Pedro Duarte" />
                </Field>
                <Field>
                  <FieldLabel htmlFor="tabs-username">Username</FieldLabel>
                  <Input id="tabs-username" defaultValue="@peduarte" />
                </Field>
              </FieldGroup>
            </CardContent>
            <CardFooter>
              <Button>Save changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>Change your password here.</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="tabs-current-pw">Current password</FieldLabel>
                  <Input id="tabs-current-pw" type="password" />
                </Field>
                <Field>
                  <FieldLabel htmlFor="tabs-new-pw">New password</FieldLabel>
                  <Input id="tabs-new-pw" type="password" />
                </Field>
              </FieldGroup>
            </CardContent>
            <CardFooter>
              <Button>Save password</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>Manage your preferences.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">No settings to configure yet.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Example>
  )
}
