export function AnnuaireSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-12">
        {[...Array(3)].map((_, categoryIndex) => (
          <section key={categoryIndex}>
            {/* Header skeleton */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gray-200 rounded-xl animate-pulse" />
              <div>
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-4 w-48 bg-gray-100 rounded animate-pulse" />
              </div>
            </div>
            
            {/* Cards skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, cardIndex) => (
                <div key={cardIndex} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="h-56 bg-gray-200 animate-pulse" />
                  <div className="p-5">
                    <div className="h-5 bg-gray-200 rounded animate-pulse mb-3" />
                    <div className="h-4 bg-gray-100 rounded animate-pulse mb-2" />
                    <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}