export default function Loading() {
  return (
    <div className="container-site py-10" aria-busy="true" aria-label="Loading">
      <div className="h-10 w-64 animate-pulse rounded bg-neutral-200" />
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card">
            <div className="aspect-[16/10] animate-pulse bg-neutral-200" />
            <div className="space-y-2 p-5">
              <div className="h-4 w-2/3 animate-pulse rounded bg-neutral-200" />
              <div className="h-3 w-1/3 animate-pulse rounded bg-neutral-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
