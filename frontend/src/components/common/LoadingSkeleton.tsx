interface Props {
  count?: number;
}

export default function LoadingSkeleton({ count = 3 }: Props) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-5 animate-pulse">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-3" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
        </div>
      ))}
    </div>
  );
}
