#!/usr/bin/env node
/**
 * Script pour vérifier la configuration DNS du domaine
 * Vérifie SPF, DKIM, DMARC et l'authentification Brevo
 */

import dns from 'dns/promises';
import { promisify } from 'util';
import dns2 from 'dns';

const resolveTxt = promisify(dns2.resolveTxt);

const domain = 'guide-de-lyon.fr';

console.log('🔍 Vérification DNS pour', domain);
console.log('=' .repeat(60));

async function checkDNS() {
  const checks = {
    spf: false,
    dkim1: false,
    dkim2: false,
    dmarc: false,
    brevoCode: false
  };
  
  // Vérifier SPF
  console.log('\n📋 Vérification SPF (@)...');
  try {
    const spfRecords = await resolveTxt(domain);
    const spfRecord = spfRecords.flat().find(r => r.includes('v=spf1'));
    
    if (spfRecord) {
      console.log('✅ SPF trouvé:', spfRecord);
      if (spfRecord.includes('spf.brevo.com') || spfRecord.includes('spf.sendinblue.com')) {
        console.log('   ✅ Brevo/SendinBlue autorisé');
        checks.spf = true;
      } else {
        console.log('   ⚠️ Brevo non inclus dans SPF');
        console.log('   Ajoutez: include:spf.brevo.com');
      }
    } else {
      console.log('❌ SPF non trouvé');
      console.log('   Ajoutez un enregistrement TXT:');
      console.log('   v=spf1 include:spf.brevo.com mx ~all');
    }
  } catch (error) {
    console.log('❌ Erreur SPF:', error.code);
  }
  
  // Vérifier DKIM 1
  console.log('\n📋 Vérification DKIM 1 (mail._domainkey)...');
  try {
    const dkimRecords = await resolveTxt(`mail._domainkey.${domain}`);
    const dkimRecord = dkimRecords.flat().join('');
    
    if (dkimRecord && dkimRecord.includes('k=rsa')) {
      console.log('✅ DKIM 1 trouvé');
      console.log('   Début:', dkimRecord.substring(0, 50) + '...');
      checks.dkim1 = true;
    } else {
      console.log('❌ DKIM 1 non trouvé');
    }
  } catch (error) {
    console.log('❌ DKIM 1 non configuré');
    console.log('   Ajoutez l\'enregistrement TXT fourni par Brevo');
  }
  
  // Vérifier DKIM 2
  console.log('\n📋 Vérification DKIM 2 (mail2._domainkey)...');
  try {
    const dkim2Records = await resolveTxt(`mail2._domainkey.${domain}`);
    const dkim2Record = dkim2Records.flat().join('');
    
    if (dkim2Record && dkim2Record.includes('k=rsa')) {
      console.log('✅ DKIM 2 trouvé');
      console.log('   Début:', dkim2Record.substring(0, 50) + '...');
      checks.dkim2 = true;
    } else {
      console.log('❌ DKIM 2 non trouvé');
    }
  } catch (error) {
    console.log('⚠️ DKIM 2 non configuré (optionnel)');
  }
  
  // Vérifier DMARC
  console.log('\n📋 Vérification DMARC (_dmarc)...');
  try {
    const dmarcRecords = await resolveTxt(`_dmarc.${domain}`);
    const dmarcRecord = dmarcRecords.flat().join('');
    
    if (dmarcRecord && dmarcRecord.includes('v=DMARC1')) {
      console.log('✅ DMARC trouvé:', dmarcRecord);
      checks.dmarc = true;
    } else {
      console.log('❌ DMARC non trouvé');
    }
  } catch (error) {
    console.log('⚠️ DMARC non configuré (recommandé)');
    console.log('   Ajoutez: v=DMARC1; p=none; rua=mailto:dmarc@guide-de-lyon.fr');
  }
  
  // Vérifier Brevo Code
  console.log('\n📋 Vérification Brevo Code (brevo-code)...');
  try {
    const brevoRecords = await resolveTxt(`brevo-code.${domain}`);
    const brevoRecord = brevoRecords.flat().join('');
    
    if (brevoRecord && brevoRecord.includes('brevo-code:')) {
      console.log('✅ Brevo Code trouvé');
      checks.brevoCode = true;
    } else {
      console.log('❌ Brevo Code non trouvé');
    }
  } catch (error) {
    console.log('⚠️ Brevo Code non configuré');
    console.log('   Nécessaire pour l\'authentification du domaine');
  }
  
  // Résumé
  console.log('\n' + '=' .repeat(60));
  console.log('📊 RÉSUMÉ DE LA CONFIGURATION');
  console.log('=' .repeat(60));
  
  const allChecks = Object.entries(checks);
  const passed = allChecks.filter(([_, v]) => v).length;
  const total = allChecks.length;
  
  allChecks.forEach(([check, status]) => {
    const icon = status ? '✅' : '❌';
    const label = {
      spf: 'SPF (Autorisation Brevo)',
      dkim1: 'DKIM 1 (Signature principale)',
      dkim2: 'DKIM 2 (Signature backup)',
      dmarc: 'DMARC (Protection anti-phishing)',
      brevoCode: 'Brevo Code (Vérification domaine)'
    }[check];
    
    console.log(`${icon} ${label}`);
  });
  
  console.log('\n📈 Score: ' + passed + '/' + total);
  
  if (passed === total) {
    console.log('\n🎉 Parfait ! Configuration complète.');
    console.log('Votre domaine est prêt pour envoyer des emails professionnels.');
  } else if (checks.spf && checks.dkim1) {
    console.log('\n✅ Configuration minimale OK.');
    console.log('Vous pouvez envoyer des emails, mais complétez pour une meilleure délivrabilité.');
  } else {
    console.log('\n⚠️ Configuration incomplète.');
    console.log('Suivez le guide CONFIGURATION-PROFESSIONNELLE-EMAIL.md');
  }
  
  // Instructions
  console.log('\n💡 Prochaines étapes:');
  if (!checks.spf || !checks.dkim1 || !checks.brevoCode) {
    console.log('1. Connectez-vous à Brevo: https://app.brevo.com');
    console.log('2. Settings → Senders & IP → Authenticate domain');
    console.log('3. Copiez les enregistrements DNS');
    console.log('4. Ajoutez-les dans OVH Manager → Zone DNS');
    console.log('5. Attendez 1h et relancez ce script');
  } else {
    console.log('1. Vérifiez dans Brevo que le domaine est authenticated');
    console.log('2. Ajoutez contact@guide-de-lyon.fr comme sender');
    console.log('3. Testez l\'envoi depuis le dashboard');
  }
}

// Lancer la vérification
checkDNS().catch(console.error);