"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@monorepo-template/ui/components/tabs"

import { DataDisplayExamples } from "@/components/categories/data-display"
import { FeedbackExamples } from "@/components/categories/feedback"
import { FormsExamples } from "@/components/categories/forms"
import { LayoutExamples } from "@/components/categories/layout"
import { NavigationExamples } from "@/components/categories/navigation"
import { OverlaysExamples } from "@/components/categories/overlays"

export function ComponentExample() {
  return (
    <div className="bg-background w-full min-h-screen">
      <Tabs defaultValue="forms" className="w-full">
        <div className="border-b px-4 sm:px-6 lg:px-12">
          <TabsList>
            <TabsTrigger value="forms">Forms</TabsTrigger>
            <TabsTrigger value="overlays">Overlays</TabsTrigger>
            <TabsTrigger value="navigation">Navigation</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
            <TabsTrigger value="data-display">Data Display</TabsTrigger>
            <TabsTrigger value="layout">Layout</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="forms">
          <FormsExamples />
        </TabsContent>
        <TabsContent value="overlays">
          <OverlaysExamples />
        </TabsContent>
        <TabsContent value="navigation">
          <NavigationExamples />
        </TabsContent>
        <TabsContent value="feedback">
          <FeedbackExamples />
        </TabsContent>
        <TabsContent value="data-display">
          <DataDisplayExamples />
        </TabsContent>
        <TabsContent value="layout">
          <LayoutExamples />
        </TabsContent>
      </Tabs>
    </div>
  )
}
