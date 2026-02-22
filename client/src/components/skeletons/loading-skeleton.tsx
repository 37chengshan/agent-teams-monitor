'use client'

import { memo } from 'react'

export const MessageSkeleton = memo(function MessageSkeleton() {
  return (
    <div className="flex gap-3 p-4">
      <div className="w-10 h-10 rounded-full bg-slate-700 animate-pulse flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-32 bg-slate-700 rounded animate-pulse" />
        <div className="h-3 w-full bg-slate-700 rounded animate-pulse" />
        <div className="h-3 w-3/4 bg-slate-700 rounded animate-pulse" />
      </div>
    </div>
  )
})

export const ConversationSkeleton = memo(function ConversationSkeleton() {
  return (
    <div className="flex items-start gap-3 p-3">
      <div className="w-10 h-10 rounded-full bg-slate-700 animate-pulse flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-24 bg-slate-700 rounded animate-pulse" />
        <div className="h-3 w-40 bg-slate-700 rounded animate-pulse" />
      </div>
    </div>
  )
})

export const TaskSkeleton = memo(function TaskSkeleton() {
  return (
    <div className="p-4 bg-background-secondary rounded-lg border border-slate-700">
      <div className="flex items-start justify-between mb-2">
        <div className="h-4 w-48 bg-slate-700 rounded animate-pulse" />
        <div className="w-4 h-4 bg-slate-700 rounded animate-pulse" />
      </div>
      <div className="h-3 w-full bg-slate-700 rounded animate-pulse mb-3" />
      <div className="flex items-center gap-4">
        <div className="h-3 w-20 bg-slate-700 rounded animate-pulse" />
        <div className="h-3 w-16 bg-slate-700 rounded animate-pulse" />
      </div>
    </div>
  )
})

export const LoadingSkeleton = memo(function LoadingSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <MessageSkeleton key={i} />
      ))}
    </div>
  )
})
