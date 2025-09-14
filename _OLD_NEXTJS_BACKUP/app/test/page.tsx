export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Test TailwindCSS</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Card 1</h2>
            <p className="text-gray-600">Si tu vois ce texte stylé, Tailwind marche !</p>
          </div>
          <div className="bg-blue-500 text-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Card 2</h2>
            <p>Fond bleu = Tailwind OK</p>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Card 3</h2>
            <p>Gradient = Classes utilitaires OK</p>
          </div>
        </div>
      </div>
    </div>
  )
}