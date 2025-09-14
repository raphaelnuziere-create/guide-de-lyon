export default function CGVPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Conditions Générales de Vente</h1>
        <div className="bg-white rounded-lg shadow-sm p-8">
          <p className="text-gray-600 mb-4">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
          </p>
          <div className="prose max-w-none">
            <h2>Article 1 - Objet</h2>
            <p>Ces conditions générales de vente seront bientôt complétées...</p>
          </div>
        </div>
      </div>
    </div>
  )
}