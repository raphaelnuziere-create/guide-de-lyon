/**
 * API simple pour tester les variables d'environnement
 */

export async function GET() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  
  return Response.json({
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    hasAdminEmail: !!adminEmail,
    hasAdminPassword: !!adminPassword,
    emailPreview: adminEmail ? adminEmail.substring(0, 10) + '...' : 'NON_TROUVE',
    passwordLength: adminPassword?.length || 0
  });
}