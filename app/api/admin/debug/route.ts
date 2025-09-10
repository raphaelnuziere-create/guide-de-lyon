/**
 * API de debug pour vérifier la configuration admin
 * ATTENTION: À supprimer en production après diagnostic
 */

export async function GET() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const jwtSecret = process.env.JWT_SECRET;
  
  return Response.json({
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    adminConfigured: {
      hasEmail: !!adminEmail,
      hasPassword: !!adminPassword,
      hasJwtSecret: !!jwtSecret,
      emailValue: adminEmail ? `${adminEmail.substring(0, 3)}***` : 'NON_DEFINI',
      passwordLength: adminPassword ? adminPassword.length : 0,
    },
    allEnvVars: Object.keys(process.env)
      .filter(key => key.includes('ADMIN') || key.includes('JWT'))
      .reduce((obj, key) => {
        obj[key] = process.env[key] ? `${process.env[key]?.substring(0, 3)}***` : 'NON_DEFINI';
        return obj;
      }, {} as Record<string, string>)
  });
}