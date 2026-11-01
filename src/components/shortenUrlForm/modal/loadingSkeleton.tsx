const LoadingSkeleton = () => (
  <div className="animate-pulse">
    <div className="flex">
      <div className="size-16 rounded-lg bg-gray-200 dark:bg-gray-600" />
      <div className="ml-3">
        <div className="h-4 w-36 rounded-sm bg-gray-200 dark:bg-gray-600" />
        <div className="mt-2 h-10 w-72 rounded-sm bg-gray-200 dark:bg-gray-600" />
      </div>
      <div className="ml-auto flex-none text-right">
        <div className="h-4 w-28 rounded-sm bg-gray-200 dark:bg-gray-600" />
        <div className="mt-2 ml-auto size-10 rounded-sm bg-gray-200 dark:bg-gray-600" />
      </div>
    </div>
    <div className="mt-2 h-4 w-28 rounded-sm bg-gray-200 dark:bg-gray-600" />
  </div>
);

export default LoadingSkeleton;
