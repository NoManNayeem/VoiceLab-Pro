'use client';

/**
 * Loading skeleton component for voice lists and other data
 */
export function VoiceListSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg">
          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-soft p-6 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-2/3 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
    </div>
  );
}

export function ButtonSkeleton() {
  return (
    <div className="h-10 bg-gray-200 rounded-xl w-32 animate-pulse"></div>
  );
}

