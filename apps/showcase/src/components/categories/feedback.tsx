"use client"

import { Alert, AlertAction, AlertDescription, AlertTitle } from "@monorepo-template/ui/components/alert"
import { Badge } from "@monorepo-template/ui/components/badge"
import { Button } from "@monorepo-template/ui/components/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@monorepo-template/ui/components/empty"
import { Kbd, KbdGroup } from "@monorepo-template/ui/components/kbd"
import { Progress, ProgressLabel, ProgressValue } from "@monorepo-template/ui/components/progress"
import { Skeleton } from "@monorepo-template/ui/components/skeleton"
import { Spinner } from "@monorepo-template/ui/components/spinner"
import { BellIcon, FolderIcon, PlusIcon, ShieldIcon } from "lucide-react"

import { Example, ExampleWrapper } from "@/components/example"

export function FeedbackExamples() {
  return (
    <ExampleWrapper>
      <AlertExample />
      <BadgeExample />
      <EmptyExample />
      <KbdExample />
      <ProgressExample />
      <SkeletonExample />
      <SpinnerExample />
    </ExampleWrapper>
  )
}

function AlertExample() {
  return (
    <Example title="Alert">
      <Alert>
        <BellIcon />
        <AlertTitle>New update available</AlertTitle>
        <AlertDescription>Version 2.0 is ready to install. Restart to apply changes.</AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <ShieldIcon />
        <AlertTitle>Security warning</AlertTitle>
        <AlertDescription>Your session will expire in 5 minutes. Please save your work.</AlertDescription>
        <AlertAction>
          <Button size="sm" variant="destructive">
            Extend
          </Button>
        </AlertAction>
      </Alert>
    </Example>
  )
}

function BadgeExample() {
  return (
    <Example title="Badge">
      <div className="flex flex-wrap gap-2">
        <Badge>Default</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="destructive">Destructive</Badge>
        <Badge variant="outline">Outline</Badge>
        <Badge variant="ghost">Ghost</Badge>
      </div>
    </Example>
  )
}

function EmptyExample() {
  return (
    <Example title="Empty">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FolderIcon />
          </EmptyMedia>
          <EmptyTitle>No files found</EmptyTitle>
          <EmptyDescription>Upload your first file to get started.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button>
            <PlusIcon data-icon="inline-start" />
            Upload file
          </Button>
        </EmptyContent>
      </Empty>
    </Example>
  )
}

function KbdExample() {
  return (
    <Example title="Kbd">
      <div className="flex flex-wrap items-center gap-4">
        <Kbd>⌘</Kbd>
        <Kbd>Enter</Kbd>
        <KbdGroup>
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
        <KbdGroup>
          <Kbd>⇧</Kbd>
          <Kbd>⌘</Kbd>
          <Kbd>P</Kbd>
        </KbdGroup>
      </div>
    </Example>
  )
}

function ProgressExample() {
  return (
    <Example title="Progress">
      <Progress value={33}>
        <ProgressLabel>Uploading…</ProgressLabel>
        <ProgressValue>{(formatted: string | null) => formatted ?? "0%"}</ProgressValue>
      </Progress>
      <Progress value={66}>
        <ProgressLabel>Processing</ProgressLabel>
        <ProgressValue>{(formatted: string | null) => formatted ?? "0%"}</ProgressValue>
      </Progress>
      <Progress value={100}>
        <ProgressLabel>Complete</ProgressLabel>
        <ProgressValue>{(formatted: string | null) => formatted ?? "0%"}</ProgressValue>
      </Progress>
    </Example>
  )
}

function SkeletonExample() {
  return (
    <Example title="Skeleton">
      <div className="flex items-center gap-4">
        <Skeleton className="size-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <Skeleton className="aspect-video w-full rounded-lg" />
    </Example>
  )
}

function SpinnerExample() {
  return (
    <Example title="Spinner">
      <div className="flex flex-wrap items-center gap-6">
        <Spinner className="size-4" />
        <Spinner className="size-6" />
        <Spinner className="size-8" />
        <Button disabled>
          <Spinner />
          Loading…
        </Button>
      </div>
    </Example>
  )
}
