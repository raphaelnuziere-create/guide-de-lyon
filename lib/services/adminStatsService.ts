export interface AdminStats {
  totalUsers: number;
  totalEstablishments: number;
  activeEstablishments: number;
  totalEvents: number;
  pendingEvents: number;
  usersGrowth: number;
  establishmentsGrowth: number;
  estimatedMonthlyRevenue: number;
  planDistribution: {
    basic: number;
    pro: number;
    expert: number;
  };
  recentEstablishments: any[];
  recentEvents: any[];
  averageEventsPerEstablishment: string;
  conversionRate: string;
}

export class AdminStatsService {
  static async getDashboardStats(): Promise<AdminStats> {
    try {
      const response = await fetch('/api/admin/stats', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('AdminStatsService error:', error);
      return this.getDefaultStats();
    }
  }

  static async refreshStats(): Promise<AdminStats> {
    return this.getDashboardStats();
  }

  private static getDefaultStats(): AdminStats {
    return {
      totalUsers: 0,
      totalEstablishments: 0,
      activeEstablishments: 0,
      totalEvents: 0,
      pendingEvents: 0,
      usersGrowth: 0,
      establishmentsGrowth: 0,
      estimatedMonthlyRevenue: 0,
      planDistribution: { basic: 0, pro: 0, expert: 0 },
      recentEstablishments: [],
      recentEvents: [],
      averageEventsPerEstablishment: '0',
      conversionRate: '0',
    };
  }

  static formatNumber(num: number): string {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  }

  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  }

  static formatGrowth(growth: number) {
    const isPositive = growth >= 0;
    return {
      formatted: `${isPositive ? '+' : ''}${growth.toFixed(1)}%`,
      isPositive,
      color: isPositive ? 'text-green-600' : 'text-red-600',
    };
  }

  static timeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
    
    return date.toLocaleDateString('fr-FR');
  }

  static getPlanColor(plan: string): string {
    switch (plan) {
      case 'pro': return 'text-blue-600 bg-blue-100';
      case 'expert': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }

  static getPlanLabel(plan: string): string {
    switch (plan) {
      case 'pro': return 'Pro';
      case 'expert': return 'Expert';
      default: return 'Gratuit';
    }
  }
}