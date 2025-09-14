import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Administration - Guide de Lyon',
  description: 'Espace administration Guide de Lyon',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Admin */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">
                🔧 Administration - Guide de Lyon
              </h1>
            </div>
            <nav className="flex space-x-4">
              <a 
                href="/admin/emails" 
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                📧 Emails
              </a>
              <a 
                href="/admin" 
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                📊 Dashboard
              </a>
              <a 
                href="/" 
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                🏠 Retour au site
              </a>
            </nav>
          </div>
        </div>
      </header>
      
      {/* Contenu */}
      <main>
        {children}
      </main>
    </div>
  );
}