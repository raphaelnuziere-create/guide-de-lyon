'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Mail, Send, Clock, CheckCircle, AlertTriangle, 
  Edit, Play, BarChart3, Users, Settings,
  MessageSquare, Zap, Calendar, TrendingUp
} from 'lucide-react';

interface EmailTemplate {
  id: string;
  name: string;
  event_type: string;
  user_plan?: string;
  subject_template: string;
  is_active: boolean;
  is_system: boolean;
  sent_count: number;
  open_rate: number;
  click_rate: number;
  created_at: string;
  updated_at: string;
}

interface EmailStats {
  todayCount: number;
  weekCount: number;
  monthCount: number;
  totalSent: number;
  avgOpenRate: number;
  avgClickRate: number;
  queuePending: number;
  queueFailed: number;
}

interface QueueItem {
  id: string;
  event_type: string;
  user_email: string;
  status: string;
  attempts: number;
  created_at: string;
  error_message?: string;
}

export default function EmailAdminPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);

  // Charger les données
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Simuler les données pour l'instant (à remplacer par vraies API calls)
      const mockTemplates: EmailTemplate[] = [
        {
          id: '1',
          name: 'Plan Upgrade Success',
          event_type: 'plan_upgrade',
          user_plan: null,
          subject_template: 'Félicitations {{nom_entreprise}} ! Bienvenue dans {{nouveau_forfait}} 🎉',
          is_active: true,
          is_system: true,
          sent_count: 45,
          open_rate: 78.5,
          click_rate: 12.3,
          created_at: '2025-01-09',
          updated_at: '2025-01-09'
        },
        {
          id: '2',
          name: 'Event Created Free Plan',
          event_type: 'event_created_free',
          user_plan: 'free',
          subject_template: '🎉 {{event_title}} est maintenant en ligne !',
          is_active: true,
          is_system: true,
          sent_count: 127,
          open_rate: 65.2,
          click_rate: 8.7,
          created_at: '2025-01-09',
          updated_at: '2025-01-09'
        },
        {
          id: '3',
          name: 'Event Created Premium Plan',
          event_type: 'event_created_premium',
          user_plan: 'premium',
          subject_template: '🌟 {{event_title}} en ligne et sur la page d\\'accueil !',
          is_active: true,
          is_system: true,
          sent_count: 38,
          open_rate: 82.1,
          click_rate: 15.6,
          created_at: '2025-01-09',
          updated_at: '2025-01-09'
        }
      ];

      const mockStats: EmailStats = {
        todayCount: 23,
        weekCount: 156,
        monthCount: 672,
        totalSent: 2847,
        avgOpenRate: 72.3,
        avgClickRate: 11.8,
        queuePending: 5,
        queueFailed: 2
      };

      const mockQueue: QueueItem[] = [
        {
          id: '1',
          event_type: 'plan_upgrade',
          user_email: 'test@example.com',
          status: 'pending',
          attempts: 0,
          created_at: '2025-01-09T14:30:00Z'
        },
        {
          id: '2',
          event_type: 'event_created_free',
          user_email: 'pro@lyon-business.fr',
          status: 'failed',
          attempts: 3,
          created_at: '2025-01-09T13:45:00Z',
          error_message: 'Invalid email address'
        }
      ];

      setTemplates(mockTemplates);
      setStats(mockStats);
      setQueueItems(mockQueue);
      
    } catch (error) {
      console.error('Error fetching email data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Déclencher un traitement manuel de la queue
  const processQueue = async () => {
    try {
      setLoading(true);
      console.log('Triggering manual queue processing...');
      
      const response = await fetch('/api/email/transactional/process', {
        method: 'GET'
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Queue processing result:', result);
        await fetchData(); // Recharger les données
      } else {
        console.error('Queue processing failed');
      }
    } catch (error) {
      console.error('Error processing queue:', error);
    } finally {
      setLoading(false);
    }
  };

  // Test d'envoi d'email
  const testEmail = async (eventType: string) => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/email/transactional/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          eventType,
          userId: 'test-user-id',
          triggerData: {
            event_title: 'Test Event',
            new_plan: 'premium',
            old_plan: 'free'
          }
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Test email queued:', result);
        await fetchData();
      }
    } catch (error) {
      console.error('Error sending test email:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'bg-yellow-100 text-yellow-800',
      sent: 'bg-green-100 text-green-800', 
      failed: 'bg-red-100 text-red-800',
      processing: 'bg-blue-100 text-blue-800'
    } as any;
    
    return <Badge className={variants[status] || 'bg-gray-100 text-gray-800'}>{status}</Badge>;
  };

  const getPlanBadge = (plan?: string) => {
    if (!plan) return <Badge variant="outline">Tous</Badge>;
    const variants = {
      free: 'bg-gray-100 text-gray-800',
      premium: 'bg-blue-100 text-blue-800',
      business: 'bg-purple-100 text-purple-800'
    } as any;
    
    return <Badge className={variants[plan]}>{plan}</Badge>;
  };

  if (!stats) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-96">
          <Mail className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Emails</h1>
          <p className="text-muted-foreground">
            Système transactionnel automatisé avec IA
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button onClick={fetchData} disabled={loading} variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Button onClick={processQueue} disabled={loading}>
            <Zap className="h-4 w-4 mr-2" />
            Traiter la Queue
          </Button>
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Envoyés Aujourd'hui</CardTitle>
            <Send className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayCount}</div>
            <p className="text-xs text-muted-foreground">Cette semaine: {stats.weekCount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux d'Ouverture</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgOpenRate}%</div>
            <p className="text-xs text-muted-foreground">Moyenne générale</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Attente</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.queuePending}</div>
            <p className="text-xs text-muted-foreground">{stats.queueFailed} échecs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Envoyé</CardTitle>
            <Mail className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Depuis le lancement</p>
          </CardContent>
        </Card>
      </div>

      {/* Onglets principaux */}
      <Tabs defaultValue="templates" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="queue">Queue</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
        </TabsList>

        {/* Templates */}
        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Templates d'Emails Transactionnels</CardTitle>
              <CardDescription>
                Gérez vos templates d'emails automatiques avec génération IA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {templates.map((template) => (
                  <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{template.name}</h3>
                        {getPlanBadge(template.user_plan)}
                        {template.is_system && (
                          <Badge variant="outline">Système</Badge>
                        )}
                        <Badge variant={template.is_active ? 'default' : 'secondary'}>
                          {template.is_active ? 'Actif' : 'Inactif'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Événement: <code>{template.event_type}</code>
                      </p>
                      <p className="text-sm font-medium">{template.subject_template}</p>
                      <div className="flex gap-4 text-xs text-muted-foreground mt-2">
                        <span>Envoyés: {template.sent_count}</span>
                        <span>Ouverture: {template.open_rate}%</span>
                        <span>Clics: {template.click_rate}%</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => testEmail(template.event_type)}
                        disabled={loading}
                      >
                        <Play className="h-4 w-4" />
                        Test
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                        Modifier
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Queue */}
        <TabsContent value="queue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Queue de Traitement</CardTitle>
              <CardDescription>
                Emails en attente et status de traitement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {queueItems.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-600" />
                    <p>Aucun email en attente</p>
                  </div>
                ) : (
                  queueItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <code className="text-sm">{item.event_type}</code>
                          {getStatusBadge(item.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">{item.user_email}</p>
                        <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                          <span>Tentatives: {item.attempts}</span>
                          <span>Créé: {new Date(item.created_at).toLocaleString()}</span>
                        </div>
                        {item.error_message && (
                          <p className="text-xs text-red-600 mt-1">{item.error_message}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {item.status === 'failed' && (
                          <Button size="sm" variant="outline">
                            <Play className="h-4 w-4" />
                            Retry
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Historique */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Historique des Envois</CardTitle>
              <CardDescription>
                Derniers emails envoyés avec statistiques
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-2" />
                <p>Historique en cours de développement</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Paramètres */}
        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Mode Test</CardTitle>
                <CardDescription>
                  Configuration du mode test et développement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Mode Test Actif</p>
                      <p className="text-sm text-muted-foreground">
                        Tous les emails sont redirigés vers raphael.nuziere@yahoo.com
                      </p>
                    </div>
                    <Badge className="bg-orange-100 text-orange-800">
                      {process.env.EMAIL_TEST_MODE === 'true' ? 'ACTIVÉ' : 'DÉSACTIVÉ'}
                    </Badge>
                  </div>
                  
                  <div className="border-t pt-4">
                    <p className="font-medium mb-2">Configuration IA</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Modèle Templates:</span>
                        <code>claude-3-haiku-20240307</code>
                      </div>
                      <div className="flex justify-between">
                        <span>Modèle Newsletter:</span>
                        <code>gpt-4-turbo-preview</code>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actions Système</CardTitle>
                <CardDescription>
                  Outils de maintenance et debug
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => testEmail('plan_upgrade')}
                    disabled={loading}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Test Email Upgrade
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => testEmail('event_created_free')}
                    disabled={loading}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Test Création Événement
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={processQueue}
                    disabled={loading}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Forcer Traitement Queue
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}