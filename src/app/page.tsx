export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl sm:text-6xl font-bold mb-6">
          AI Icon Generator
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
          Create beautiful, custom icons using the power of AI. Simply describe
          what you want and watch your ideas come to life.
        </p>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 shadow-sm">
          <p className="text-gray-500 dark:text-gray-400">
            Icon generation interface coming soon...
          </p>
        </div>
      </div>
    </div>
  );
}
