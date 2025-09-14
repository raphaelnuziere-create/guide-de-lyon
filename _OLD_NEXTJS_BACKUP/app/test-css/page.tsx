export default function TestCSS() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-blue-600 mb-4">
        Test 1: Classes Tailwind
      </h1>
      
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-red-500 text-white p-4 rounded">
          Box Rouge (Tailwind)
        </div>
        <div className="bg-green-500 text-white p-4 rounded">
          Box Verte (Tailwind)
        </div>
        <div className="bg-blue-500 text-white p-4 rounded">
          Box Bleue (Tailwind)
        </div>
      </div>

      <h2 className="text-2xl font-semibold mb-4">
        Test 2: CSS Inline (doit toujours marcher)
      </h2>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)', 
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{ backgroundColor: 'red', color: 'white', padding: '1rem', borderRadius: '0.5rem' }}>
          Box Rouge (Inline)
        </div>
        <div style={{ backgroundColor: 'green', color: 'white', padding: '1rem', borderRadius: '0.5rem' }}>
          Box Verte (Inline)
        </div>
        <div style={{ backgroundColor: 'blue', color: 'white', padding: '1rem', borderRadius: '0.5rem' }}>
          Box Bleue (Inline)
        </div>
      </div>

      <h3 className="text-xl mb-4">Test 3: Flexbox</h3>
      <div className="flex space-x-4">
        <button className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
          Bouton 1
        </button>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
          Bouton 2
        </button>
      </div>

      <div className="mt-8 p-4 bg-yellow-100 border-2 border-yellow-400 rounded">
        <p className="font-bold">Résultats attendus:</p>
        <ul className="list-disc ml-5 mt-2">
          <li>3 colonnes colorées en haut (rouge, vert, bleu)</li>
          <li>Même chose en dessous mais avec CSS inline</li>
          <li>2 boutons côte à côte</li>
          <li>Si SEUL le CSS inline marche → Tailwind ne charge pas</li>
          <li>Si RIEN ne marche → Problème plus grave</li>
        </ul>
      </div>

      {/* Script de diagnostic à copier dans la console */}
      <div className="mt-8 p-4 bg-gray-100 rounded">
        <p className="font-bold mb-2">Code à copier dans la Console (F12):</p>
        <pre className="text-sm bg-black text-green-400 p-4 rounded overflow-x-auto">
{`console.log("=== DIAGNOSTIC CSS ===");

// 1. Vérifier si Tailwind est chargé
const sheets = Array.from(document.styleSheets);
const hasTailwind = sheets.some(sheet => {
  try {
    return sheet.href?.includes('tailwind') || 
           Array.from(sheet.cssRules || []).some(rule => 
             rule.cssText?.includes('tailwind'));
  } catch(e) { return false; }
});
console.log("Tailwind détecté:", hasTailwind);

// 2. Compter les feuilles de style
console.log("Nombre de feuilles CSS:", sheets.length);

// 3. Lister les CSS chargés
console.log("CSS chargés:");
sheets.forEach(sheet => {
  if (sheet.href) console.log("-", sheet.href);
});

// 4. Tester si les classes Tailwind existent
const testClasses = ['p-4', 'text-blue-600', 'bg-red-500'];
testClasses.forEach(cls => {
  const testEl = document.createElement('div');
  testEl.className = cls;
  document.body.appendChild(testEl);
  const computed = window.getComputedStyle(testEl);
  const hasStyle = computed.padding !== '0px' || 
                   computed.color !== 'rgb(0, 0, 0)' || 
                   computed.backgroundColor !== 'rgba(0, 0, 0, 0)';
  console.log(\`Classe '\${cls}' fonctionne:\`, hasStyle);
  testEl.remove();
});

console.log("=== FIN DIAGNOSTIC ===");`}
        </pre>
      </div>
    </div>
  );
}