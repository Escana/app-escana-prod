import type * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface ProfileCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  footer?: React.ReactNode
  children: React.ReactNode
}

export function ProfileCard({ title, description, footer, children, className, ...props }: ProfileCardProps) {
  return (
    <Card className={cn("border-0 shadow-lg bg-[#1A2B41] text-white", className)} {...props}>
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl font-semibold">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
      {footer && <CardFooter>{footer}</CardFooter>}
    </Card>
  )
}

