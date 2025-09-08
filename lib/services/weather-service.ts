/**
 * Service météo pour Lyon avec OpenWeatherMap API
 * Données fiables pour contextualiser les newsletters
 */

export interface WeatherData {
  temperature: number;
  condition: string; // 'sunny', 'rainy', 'cloudy', 'cold', etc.
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  contextualComment?: string;
}

export class WeatherService {
  private static readonly LYON_LAT = 45.7640;
  private static readonly LYON_LON = 4.8357;
  private static readonly API_KEY = process.env.OPENWEATHERMAP_API_KEY;
  private static readonly BASE_URL = 'https://api.openweathermap.org/data/2.5';

  /**
   * Récupère la météo actuelle pour Lyon
   */
  static async getCurrentWeather(): Promise<WeatherData | null> {
    if (!this.API_KEY) {
      console.warn('OpenWeatherMap API key not configured');
      return null;
    }

    try {
      const response = await fetch(
        `${this.BASE_URL}/weather?lat=${this.LYON_LAT}&lon=${this.LYON_LON}&appid=${this.API_KEY}&units=metric&lang=fr`
      );

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data = await response.json();
      return this.formatWeatherData(data);

    } catch (error) {
      console.error('Erreur récupération météo:', error);
      return null;
    }
  }

  /**
   * Formate les données météo
   */
  private static formatWeatherData(apiData: any): WeatherData {
    const temp = Math.round(apiData.main.temp);
    const weatherMain = apiData.weather[0].main.toLowerCase();
    const description = apiData.weather[0].description;

    return {
      temperature: temp,
      condition: this.mapWeatherCondition(weatherMain, temp),
      description: description.charAt(0).toUpperCase() + description.slice(1),
      icon: this.getWeatherEmoji(weatherMain),
      humidity: apiData.main.humidity,
      windSpeed: Math.round(apiData.wind?.speed || 0),
      contextualComment: this.generateContextualComment(weatherMain, temp)
    };
  }

  /**
   * Convertit les conditions API en conditions simplifiées
   */
  private static mapWeatherCondition(weatherMain: string, temperature: number): string {
    if (temperature < 5) return 'cold';
    if (temperature > 25) return 'hot';

    switch (weatherMain) {
      case 'clear':
        return 'sunny';
      case 'clouds':
        return 'cloudy';
      case 'rain':
      case 'drizzle':
        return 'rainy';
      case 'snow':
        return 'snowy';
      case 'mist':
      case 'fog':
        return 'foggy';
      case 'thunderstorm':
        return 'stormy';
      default:
        return 'mild';
    }
  }

  /**
   * Retourne l'emoji approprié selon la météo
   */
  private static getWeatherEmoji(weatherMain: string): string {
    switch (weatherMain) {
      case 'clear':
        return '☀️';
      case 'clouds':
        return '⛅';
      case 'rain':
        return '🌧️';
      case 'drizzle':
        return '🌦️';
      case 'snow':
        return '❄️';
      case 'mist':
      case 'fog':
        return '🌫️';
      case 'thunderstorm':
        return '⛈️';
      default:
        return '🌤️';
    }
  }

  /**
   * Génère un commentaire contextuel lyonnais selon la météo
   */
  private static generateContextualComment(weatherMain: string, temperature: number): string {
    const comments = {
      'clear': [
        temperature > 20 
          ? 'Parfait pour une balade sur les berges du Rhône !'
          : 'Beau temps sur Lyon, idéal pour découvrir la Presqu\'île',
        'Les terrasses lyonnaises vont faire le plein aujourd\'hui'
      ],
      'rain': [
        'Temps pluvieux ? Parfait pour découvrir les traboules du Vieux Lyon',
        'Idéal pour une visite au musée des Confluences ou aux Halles de Lyon',
        'Les cafés cosy de la Croix-Rousse t\'attendent'
      ],
      'clouds': [
        'Temps nuageux, parfait pour une sortie culture dans Lyon',
        'Idéal pour explorer les quartiers sans la chaleur du soleil'
      ],
      'cold': [
        'Temps froid sur Lyon, pense à bien te couvrir !',
        'Parfait pour un chocolat chaud dans un bouchon lyonnais'
      ],
      'hot': [
        'Forte chaleur prévue, direction les berges du Rhône pour la fraîcheur !',
        'Pense à t\'hydrater, les fontaines Wallace sont là pour ça'
      ]
    };

    const weatherComments = comments[weatherMain] || comments['clouds'];
    return weatherComments[Math.floor(Math.random() * weatherComments.length)];
  }

  /**
   * Récupère les prévisions pour la semaine (newsletter hebdomadaire)
   */
  static async getWeeklyForecast(): Promise<WeatherData[]> {
    if (!this.API_KEY) return [];

    try {
      const response = await fetch(
        `${this.BASE_URL}/forecast?lat=${this.LYON_LAT}&lon=${this.LYON_LON}&appid=${this.API_KEY}&units=metric&lang=fr`
      );

      if (!response.ok) throw new Error(`Forecast API error: ${response.status}`);

      const data = await response.json();
      
      // Prendre une prévision par jour (midi) pour les 7 prochains jours
      const dailyForecasts = data.list.filter((_: any, index: number) => index % 8 === 0).slice(0, 7);
      
      return dailyForecasts.map((forecast: any) => this.formatWeatherData({
        main: forecast.main,
        weather: forecast.weather,
        wind: forecast.wind
      }));

    } catch (error) {
      console.error('Erreur prévisions météo:', error);
      return [];
    }
  }

  /**
   * Cache météo simple (1 heure)
   */
  private static weatherCache: { data: WeatherData; timestamp: number } | null = null;
  private static readonly CACHE_DURATION = 60 * 60 * 1000; // 1 heure

  static async getCachedWeather(): Promise<WeatherData | null> {
    const now = Date.now();
    
    // Vérifier si le cache est encore valide
    if (this.weatherCache && (now - this.weatherCache.timestamp) < this.CACHE_DURATION) {
      return this.weatherCache.data;
    }

    // Récupérer de nouvelles données
    const weather = await this.getCurrentWeather();
    if (weather) {
      this.weatherCache = {
        data: weather,
        timestamp: now
      };
    }

    return weather;
  }

  /**
   * Récupère la météo avec fallback gracieux
   */
  static async getWeatherWithFallback(): Promise<WeatherData | null> {
    try {
      return await this.getCachedWeather();
    } catch (error) {
      console.error('Erreur météo avec fallback:', error);
      
      // Fallback avec données génériques
      const hour = new Date().getHours();
      const isNight = hour < 7 || hour > 19;
      
      return {
        temperature: 15, // Température moyenne Lyon
        condition: 'mild',
        description: isNight ? 'Nuit claire' : 'Temps variable',
        icon: isNight ? '🌙' : '🌤️',
        humidity: 60,
        windSpeed: 10,
        contextualComment: 'Belle journée pour découvrir Lyon !'
      };
    }
  }
}

/**
 * Utilitaire pour obtenir l'API key depuis les variables d'environnement
 * Ajouter à .env.local : OPENWEATHERMAP_API_KEY=your_api_key
 * 
 * Pour obtenir une clé gratuite :
 * 1. Aller sur https://openweathermap.org/api
 * 2. Créer un compte
 * 3. Générer une clé API (gratuite jusqu'à 1000 appels/jour)
 */