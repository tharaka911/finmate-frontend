export const Skeleton = ({ className, ...props }) => {
  return (
    <div
      className={`animate-pulse bg-[#111111] border border-border/50 ${className}`}
      {...props}
    />
  );
};

export const CardSkeleton = () => (
  <div className="p-8 border border-border bg-black/50 space-y-6">
    <div className="flex justify-between items-center text-muted-foreground opacity-20">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 w-4" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-12 w-48" />
      <Skeleton className="h-1 w-full bg-[#00E599]/10 shadow-[0_0_10px_rgba(0,229,153,0.05)]" />
    </div>
  </div>
);

export const TableSkeleton = () => (
  <div className="border border-border divide-y divide-border/20">
    <div className="bg-[#0A0A0A] px-6 py-4">
       <Skeleton className="h-4 w-48 opacity-20" />
    </div>
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex gap-4 px-6 py-5">
        <Skeleton className="h-4 w-full opacity-10" />
        <Skeleton className="h-4 w-full opacity-10" />
        <Skeleton className="h-4 w-1/2 opacity-10 ml-auto" />
      </div>
    ))}
  </div>
);
