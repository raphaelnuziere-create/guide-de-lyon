export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb Skeleton */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex space-x-2">
            <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-1 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-1 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Hero Skeleton */}
      <div className="relative">
        <div className="h-96 lg:h-[500px] bg-gray-200 animate-pulse" />
        
        <div className="relative -mt-24 mx-4 sm:mx-6 lg:mx-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-6 lg:p-8">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-8 bg-gray-200 rounded w-64 animate-pulse" />
                    <div className="h-6 bg-gray-200 rounded w-20 animate-pulse" />
                  </div>
                  
                  <div className="h-4 bg-gray-200 rounded w-48 mb-2 animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded w-56 mb-6 animate-pulse" />
                  
                  <div className="flex items-center gap-6 mb-6">
                    <div className="h-6 bg-gray-200 rounded w-32 animate-pulse" />
                    <div className="h-6 bg-gray-200 rounded w-24 animate-pulse" />
                    <div className="h-6 bg-gray-200 rounded w-16 animate-pulse" />
                  </div>
                  
                  <div className="h-5 bg-gray-200 rounded w-full mb-2 animate-pulse" />
                  <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse" />
                </div>
                
                <div className="mt-6 lg:mt-0 lg:ml-8 flex-shrink-0">
                  <div className="space-y-3">
                    <div className="h-12 bg-gray-200 rounded w-32 animate-pulse" />
                    <div className="h-12 bg-gray-200 rounded w-32 animate-pulse" />
                    <div className="h-12 bg-gray-200 rounded w-32 animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse" />
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
              </div>
              
              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div>
                  <div className="h-5 bg-gray-200 rounded w-24 mb-3 animate-pulse" />
                  <div className="space-y-2">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                    ))}
                  </div>
                </div>
                <div>
                  <div className="h-5 bg-gray-200 rounded w-20 mb-3 animate-pulse" />
                  <div className="space-y-2">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Specialized Content */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="h-6 bg-gray-200 rounded w-40 mb-6 animate-pulse" />
              <div className="grid md:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="p-6 bg-gray-50 rounded-lg">
                    <div className="h-5 bg-gray-200 rounded w-24 mb-3 animate-pulse" />
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                      <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="h-6 bg-gray-200 rounded w-32 animate-pulse" />
                <div className="h-10 bg-gray-200 rounded w-28 animate-pulse" />
              </div>
              
              <div className="space-y-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="border-b pb-6 last:border-b-0">
                    <div className="flex items-start space-x-3 mb-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-32 mb-1 animate-pulse" />
                        <div className="h-3 bg-gray-200 rounded w-24 animate-pulse" />
                      </div>
                      <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
                      <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="h-5 bg-gray-200 rounded w-40 mb-6 animate-pulse" />
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-start space-x-3">
                    <div className="w-5 h-5 bg-gray-200 rounded animate-pulse mt-0.5" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-20 mb-1 animate-pulse" />
                      <div className="h-3 bg-gray-200 rounded w-32 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="h-5 bg-gray-200 rounded w-36 mb-6 animate-pulse" />
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex space-x-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg animate-pulse" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-full mb-2 animate-pulse" />
                      <div className="h-3 bg-gray-200 rounded w-20 mb-1 animate-pulse" />
                      <div className="h-3 bg-gray-200 rounded w-16 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}