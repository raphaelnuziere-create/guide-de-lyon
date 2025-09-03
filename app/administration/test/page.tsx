export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Test Admin Page</h1>
        <p className="text-gray-600">Si vous voyez cette page, les routes admin fonctionnent!</p>
        <div className="mt-4 space-y-2">
          <a href="/admin/login" className="block text-blue-600 hover:underline">
            → Aller à /admin/login
          </a>
          <a href="/admin/dashboard" className="block text-blue-600 hover:underline">
            → Aller à /admin/dashboard
          </a>
          <a href="/pro/login" className="block text-blue-600 hover:underline">
            → Aller à /pro/login
          </a>
        </div>
      </div>
    </div>
  );
}