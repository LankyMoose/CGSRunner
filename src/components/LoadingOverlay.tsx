export function LoadingOverlay() {
  return (
    <div className="fixed top-0 left-0 h-screen w-screen bg-black bg-opacity-60">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="flex gap-4 justify-center items-center">
          <div className="animate-spin rounded-full border-t-2 border-b-2 border-gray-600 h-12 w-12"></div>
          <div className="text-2xl font-medium">Loading...</div>
        </div>
      </div>
    </div>
  )
}
