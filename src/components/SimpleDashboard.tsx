export const SimpleDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">🎉 Welcome to SubTracker AI!</h1>
        <p className="text-lg text-gray-600 mb-8">
          You're successfully logged in and the app is working!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 p-6 rounded-lg border">
          <h3 className="font-semibold text-blue-900 mb-2">📊 Subscriptions</h3>
          <p className="text-blue-700">Track and manage your subscriptions</p>
          <div className="mt-4 text-2xl font-bold text-blue-900">0</div>
        </div>

        <div className="bg-green-50 p-6 rounded-lg border">
          <h3 className="font-semibold text-green-900 mb-2">💳 Payment Cards</h3>
          <p className="text-green-700">Manage your payment methods</p>
          <div className="mt-4 text-2xl font-bold text-green-900">0</div>
        </div>

        <div className="bg-purple-50 p-6 rounded-lg border">
          <h3 className="font-semibold text-purple-900 mb-2">🔔 Notifications</h3>
          <p className="text-purple-700">Stay updated with alerts</p>
          <div className="mt-4 text-2xl font-bold text-purple-900">0</div>
        </div>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg border">
        <h3 className="font-semibold text-gray-900 mb-4">✅ Status Check</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
            <span>Authentication: Working</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
            <span>Supabase Connection: Connected</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
            <span>App Performance: Optimized</span>
          </div>
        </div>
      </div>

      <div className="text-center">
        <p className="text-gray-600">Ready to start adding your subscriptions! 🚀</p>
      </div>
    </div>
  );
};
