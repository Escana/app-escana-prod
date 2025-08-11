import type * as React from "react"
import { cn } from "@/lib/utils"

interface ProfileSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  children: React.ReactNode
  action?: React.ReactNode
}

export function ProfileSection({ title, children, action, className, ...props }: ProfileSectionProps) {
  return (
    <div className={cn("space-y-4", className)} {...props}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-white">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  )
}

