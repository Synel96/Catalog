import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function SlaveProfileSkeleton() {
  return (
    <Card className="mx-auto mt-4 max-w-[400px] p-2" aria-busy="true" aria-label="Loading profile">
      <CardContent className="grid gap-6">
        <div className="flex items-center gap-4">
          <Skeleton className="size-16 rounded-full" />
          <div className="grid gap-2">
            <Skeleton className="h-5 w-[120px]" />
            <Skeleton className="h-4 w-[180px]" />
          </div>
        </div>

        <div className="grid gap-2">
          <p className="text-muted-foreground text-sm">Bio</p>
          <Skeleton className="h-[18px] w-full" />
          <Skeleton className="h-[18px] w-4/5" />
        </div>

        <div className="grid gap-2">
          <p className="text-muted-foreground text-sm">Joined</p>
          <Skeleton className="h-4 w-1/2" />
        </div>
      </CardContent>
    </Card>
  );
}
