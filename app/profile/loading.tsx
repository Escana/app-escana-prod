import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import styles from "./profile.module.css"

export default function ProfileLoading() {
  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileHeader}>
        <Skeleton className="h-8 w-64 bg-secondary-dark/30" />
        <Skeleton className="h-4 w-48 mt-2 bg-secondary-dark/30" />
      </div>

      <Card className="border-0 shadow-lg bg-[#1A2B41] text-white">
        <CardHeader>
          <Skeleton className="h-6 w-32 bg-secondary-dark/30" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between">
              <Skeleton className="h-5 w-40 bg-secondary-dark/30" />
              <Skeleton className="h-5 w-20 bg-secondary-dark/30" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24 bg-secondary-dark/30" />
                <Skeleton className="h-6 w-full bg-secondary-dark/30" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24 bg-secondary-dark/30" />
                <Skeleton className="h-6 w-full bg-secondary-dark/30" />
              </div>
            </div>
          </div>

          <Skeleton className="h-px w-full bg-secondary-dark/50" />

          <div className="space-y-4">
            <Skeleton className="h-5 w-40 bg-secondary-dark/30" />

            <div className="space-y-2">
              <Skeleton className="h-4 w-24 bg-secondary-dark/30" />
              <Skeleton className="h-10 w-full bg-secondary-dark/30" />
            </div>

            <div className="space-y-2">
              <Skeleton className="h-5 w-32 bg-secondary-dark/30" />

              <div className="space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32 bg-secondary-dark/30" />
                  <Skeleton className="h-10 w-full bg-secondary-dark/30" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32 bg-secondary-dark/30" />
                  <Skeleton className="h-10 w-full bg-secondary-dark/30" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-40 bg-secondary-dark/30" />
                  <Skeleton className="h-10 w-full bg-secondary-dark/30" />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Skeleton className="h-9 w-32 bg-secondary-dark/30" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

