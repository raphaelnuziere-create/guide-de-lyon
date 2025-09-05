'use client'

import { useEffect, useState } from 'react'

export default function DiagnosticPage() {
  const [checks, setChecks] = useState<any>({})
  
  useEffect(() => {
    const runDiagnostics = () => {
      const results = {
        timestamp: new Date().toISOString(),
        browser: navigator.userAgent,
        url: window.location.href,
        localStorage: typeof localStorage !== 'undefined',
        cookies: navigator.cookieEnabled,
        online: navigator.onLine,
      }
      setChecks(results)
    }
    runDiagnostics()
  }, [])

  return (
    <div style={{ padding: '2rem', fontFamily: 'monospace', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem', color: '#dc2626' }}>
        🔍 PAGE DE DIAGNOSTIC VERCEL
      </h1>

      <div style={{ background: '#10b981', color: 'white', padding: '1rem', borderRadius: '0.5rem', marginBottom: '2rem' }}>
        <h2>✅ SI VOUS VOYEZ CETTE PAGE = VERCEL DÉPLOIE BIEN!</h2>
        <p>Le déploiement fonctionne. Le problème est résolu.</p>
      </div>

      <div style={{ background: '#f3f4f6', padding: '1rem', borderRadius: '0.5rem', marginBottom: '2rem' }}>
        <h3>📊 Informations système:</h3>
        <pre style={{ background: 'white', padding: '1rem', overflow: 'auto' }}>
          {JSON.stringify(checks, null, 2)}
        </pre>
      </div>

      <div style={{ background: '#fef3c7', padding: '1rem', borderRadius: '0.5rem', marginBottom: '2rem' }}>
        <h3>🔗 Liens de test:</h3>
        <ul>
          <li><a href="/auth">→ /auth (Page auth)</a></li>
          <li><a href="/login-admin">→ /login-admin (Login Admin)</a></li>
          <li><a href="/login-pro">→ /login-pro (Login Pro)</a></li>
          <li><a href="/test">→ /test (Page test simple)</a></li>
          <li><a href="/test-deployment.html">→ /test-deployment.html (HTML statique)</a></li>
        </ul>
      </div>

      <div style={{ background: '#fee2e2', padding: '1rem', borderRadius: '0.5rem' }}>
        <h3>⚠️ Si cette page ne s'affiche pas:</h3>
        <ol>
          <li>Le repository est privé et Vercel n'a pas accès</li>
          <li>La connexion GitHub-Vercel est cassée</li>
          <li>Le projet Vercel n'est pas configuré correctement</li>
        </ol>
        
        <h4 style={{ marginTop: '1rem' }}>Solution:</h4>
        <p>Exécutez dans le terminal: <code>./fix-vercel-deployment.sh</code></p>
      </div>
    </div>
  )
}