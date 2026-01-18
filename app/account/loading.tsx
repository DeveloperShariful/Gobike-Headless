//app/account/loading.tsx

export default function AccountLoading() {
  return (
    <div className="w-full animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
      
      <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
      
      <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6">
        <div className="p-6 border border-gray-200 rounded-lg bg-gray-50 h-[150px]">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
        
        <div className="p-6 border border-gray-200 rounded-lg bg-gray-50 h-[150px]">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
        
        <div className="p-6 border border-gray-200 rounded-lg bg-gray-50 h-[150px]">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    </div>
  );
}