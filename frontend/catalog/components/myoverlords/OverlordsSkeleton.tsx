import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const FAKE_CARDS = 4;

export function OverlordsSkeleton() {
  return (
    <div className="mt-4 w-full" aria-busy="true" aria-label="Loading overlords">
      <h2 className="mb-4 text-2xl font-bold md:text-3xl">My Overlords</h2>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {Array.from({ length: FAKE_CARDS }, (_, i) => (
          <Card key={i} className="w-60 shrink-0">
            <CardContent className="grid justify-items-center gap-2">
              <Skeleton className="size-20 rounded-full" />
              <Skeleton className="h-5 w-3/5" />
              <Skeleton className="h-6 w-10" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
