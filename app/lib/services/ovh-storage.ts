// Service de stockage OVH Object Storage (compatible S3)
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createHash } from 'crypto';

export class OVHStorageService {
  private s3Client: S3Client | null = null;
  private bucket: string;
  private isConfigured: boolean = false;

  constructor() {
    this.bucket = process.env.OVH_S3_BUCKET || 'guide-lyon-articles';
    this.initializeClient();
  }

  // Initialiser le client S3 pour OVH
  private initializeClient() {
    // Vérifier si les variables d'environnement sont configurées
    if (!process.env.OVH_S3_ACCESS_KEY || !process.env.OVH_S3_SECRET_KEY) {
      console.log('[OVH Storage] Variables OVH non configurées, utilisation du fallback local');
      this.isConfigured = false;
      return;
    }

    try {
      this.s3Client = new S3Client({
        endpoint: process.env.OVH_S3_ENDPOINT || 'https://s3.gra.io.cloud.ovh.net/',
        region: process.env.OVH_S3_REGION || 'gra',
        credentials: {
          accessKeyId: process.env.OVH_S3_ACCESS_KEY,
          secretAccessKey: process.env.OVH_S3_SECRET_KEY,
        },
        forcePathStyle: true, // Important pour OVH
      });
      this.isConfigured = true;
      console.log('[OVH Storage] Client S3 initialisé avec succès');
    } catch (error) {
      console.error('[OVH Storage] Erreur initialisation:', error);
      this.isConfigured = false;
    }
  }

  // Vérifier si OVH est configuré
  isOVHConfigured(): boolean {
    return this.isConfigured && this.s3Client !== null;
  }

  // Télécharger et stocker une image sur OVH
  async uploadImage(imageUrl: string, articleSlug: string): Promise<string | null> {
    if (!this.isOVHConfigured()) {
      console.log('[OVH Storage] OVH non configuré, retour null');
      return null;
    }

    try {
      console.log('[OVH Storage] Téléchargement de:', imageUrl);

      // Télécharger l'image depuis l'URL
      const response = await fetch(imageUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Guide-de-Lyon/1.0)',
        },
      });

      if (!response.ok) {
        console.error('[OVH Storage] Erreur téléchargement:', response.status);
        return null;
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      const contentType = response.headers.get('content-type') || 'image/jpeg';

      // Générer un nom de fichier unique
      const hash = createHash('md5').update(imageUrl).digest('hex').substring(0, 8);
      const extension = this.getExtensionFromContentType(contentType);
      const fileName = `articles/${new Date().getFullYear()}/${articleSlug}-${hash}.${extension}`;

      // Upload vers OVH
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: fileName,
        Body: buffer,
        ContentType: contentType,
        ACL: 'public-read', // Rendre l'image publique
        CacheControl: 'public, max-age=31536000', // Cache 1 an
      });

      await this.s3Client!.send(command);

      // Construire l'URL publique
      const publicUrl = `${process.env.OVH_S3_ENDPOINT}${this.bucket}/${fileName}`;
      console.log('[OVH Storage] Image uploadée:', publicUrl);

      return publicUrl;

    } catch (error) {
      console.error('[OVH Storage] Erreur upload:', error);
      return null;
    }
  }

  // Vérifier si une image existe déjà
  async imageExists(fileName: string): Promise<boolean> {
    if (!this.isOVHConfigured()) return false;

    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: fileName,
      });
      await this.s3Client!.send(command);
      return true;
    } catch {
      return false;
    }
  }

  // Obtenir une URL signée (pour accès temporaire privé)
  async getSignedUrl(fileName: string, expiresIn: number = 3600): Promise<string | null> {
    if (!this.isOVHConfigured()) return null;

    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: fileName,
      });
      return await getSignedUrl(this.s3Client!, command, { expiresIn });
    } catch (error) {
      console.error('[OVH Storage] Erreur génération URL signée:', error);
      return null;
    }
  }

  // Supprimer une image
  async deleteImage(fileName: string): Promise<boolean> {
    if (!this.isOVHConfigured()) return false;

    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: fileName,
      });
      await this.s3Client!.send(command);
      console.log('[OVH Storage] Image supprimée:', fileName);
      return true;
    } catch (error) {
      console.error('[OVH Storage] Erreur suppression:', error);
      return false;
    }
  }

  // Obtenir l'extension depuis le content-type
  private getExtensionFromContentType(contentType: string): string {
    const mimeToExt: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif',
    };
    return mimeToExt[contentType.toLowerCase()] || 'jpg';
  }

  // Test de connexion
  async testConnection(): Promise<boolean> {
    if (!this.isOVHConfigured()) {
      console.log('[OVH Storage] Test impossible : OVH non configuré');
      return false;
    }

    try {
      // Essayer d'uploader un fichier test
      const testCommand = new PutObjectCommand({
        Bucket: this.bucket,
        Key: 'test/connection-test.txt',
        Body: Buffer.from('Test de connexion OVH - Guide de Lyon'),
        ContentType: 'text/plain',
      });
      
      await this.s3Client!.send(testCommand);
      console.log('[OVH Storage] ✅ Test de connexion réussi');
      
      // Nettoyer le fichier test
      await this.deleteImage('test/connection-test.txt');
      
      return true;
    } catch (error) {
      console.error('[OVH Storage] ❌ Test de connexion échoué:', error);
      return false;
    }
  }
}