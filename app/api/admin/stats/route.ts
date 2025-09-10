import { NextResponse } from 'next/server';
import { createServiceSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = createServiceSupabaseClient();

    const [
      { count: totalUsers },
      { count: totalEstablishments }, 
      { count: activeEstablishments },
      { count: totalEvents },
      { count: pendingEvents },
      establishmentsResponse,
      eventsResponse
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('establishments').select('*', { count: 'exact', head: true }),
      supabase.from('establishments').select('*', { count: 'exact', head: true }).in('plan', ['pro', 'expert']),
      supabase.from('events').select('*', { count: 'exact', head: true }),
      supabase.from('events').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('establishments').select('*').order('created_at', { ascending: false }).limit(5),
      supabase.from('events').select(`*, establishment:establishments!inner(name)`).order('created_at', { ascending: false }).limit(5)
    ]);

    const stats = {
      totalUsers: totalUsers || 0,
      totalEstablishments: totalEstablishments || 0,
      activeEstablishments: activeEstablishments || 0,
      totalEvents: totalEvents || 0,
      pendingEvents: pendingEvents || 0,
      usersGrowth: 12.5,
      establishmentsGrowth: 8.3,
      estimatedMonthlyRevenue: (activeEstablishments || 0) * 25,
      planDistribution: {
        basic: (totalEstablishments || 0) - (activeEstablishments || 0),
        pro: Math.floor((activeEstablishments || 0) * 0.7),
        expert: Math.ceil((activeEstablishments || 0) * 0.3)
      },
      recentEstablishments: establishmentsResponse.data || [],
      recentEvents: eventsResponse.data || [],
      averageEventsPerEstablishment: totalEstablishments ? (totalEvents / totalEstablishments).toFixed(1) : '0',
      conversionRate: totalUsers ? ((activeEstablishments || 0) / totalUsers * 100).toFixed(1) : '0'
    };

    return NextResponse.json({
      success: true,
      data: stats,
      lastUpdate: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erreur stats admin:', error);
    return NextResponse.json({ error: 'Erreur statistiques' }, { status: 500 });
  }
}