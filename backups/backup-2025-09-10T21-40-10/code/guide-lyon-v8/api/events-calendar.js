// Calendrier d'événements interactif pour Guide de Lyon
class EventsCalendar {
    constructor() {
        this.currentDate = new Date();
        this.selectedDate = new Date();
        this.events = this.loadSampleEvents();
        this.sectors = {
            'shopping': { name: '🛍️ Shopping', color: '#FF6B6B' },
            'restaurant': { name: '🍽️ Restaurant', color: '#4ECDC4' },
            'culture': { name: '🎭 Culture', color: '#45B7D1' },
            'bars': { name: '🍺 Bars', color: '#FFA07A' },
            'fitness': { name: '💪 Fitness', color: '#98D8C8' },
            'sante': { name: '🏥 Santé', color: '#A8E6CF' },
            'immobilier': { name: '🏠 Immobilier', color: '#FFD93D' },
            'auto': { name: '🚗 Auto', color: '#6C5CE7' },
            'beaute': { name: '💄 Beauté', color: '#FF7675' },
            'education': { name: '🎓 Éducation', color: '#00B894' },
            'services': { name: '🛠️ Services', color: '#FDCB6E' },
            'loisirs': { name: '🎪 Loisirs', color: '#E17055' }
        };
        this.init();
    }

    init() {
        this.renderCalendar();
        this.renderDayEvents();
        this.setupEventListeners();
    }

    loadSampleEvents() {
        return [
            {
                id: 1,
                titre: "Exposition Street Art Confluence",
                date: "2025-01-09",
                heure: "14:00",
                lieu: "Galerie Confluence",
                secteur: "culture",
                description: "Découvrez les œuvres de street art contemporain"
            },
            {
                id: 2,
                titre: "Ouverture Nouveau Restaurant",
                date: "2025-01-09",
                heure: "19:00", 
                lieu: "Place Bellecour",
                secteur: "restaurant",
                description: "Inauguration du nouveau restaurant gastronomique"
            },
            {
                id: 3,
                titre: "Soirée Dégustation Vins",
                date: "2025-01-10",
                heure: "18:30",
                lieu: "Cave des Terreaux",
                secteur: "bars",
                description: "Dégustation de vins de la région Rhône-Alpes"
            },
            {
                id: 4,
                titre: "Cours de Yoga Gratuit",
                date: "2025-01-10",
                heure: "10:00",
                lieu: "Parc de la Tête d'Or",
                secteur: "fitness",
                description: "Session yoga en plein air (selon météo)"
            },
            {
                id: 5,
                titre: "Marché aux Puces",
                date: "2025-01-11",
                heure: "08:00",
                lieu: "Quais de Saône",
                secteur: "shopping",
                description: "Marché aux puces et brocante dominicale"
            },
            {
                id: 6,
                titre: "Concert Jazz",
                date: "2025-01-11",
                heure: "20:30",
                lieu: "Théâtre des Célestins",
                secteur: "culture",
                description: "Concert de jazz avec quartet lyonnais"
            }
        ];
    }

    renderCalendar() {
        const calendarEl = document.getElementById('calendar-month');
        if (!calendarEl) return;

        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        // Header du mois
        const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
            "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
        
        let html = `
            <div class="calendar-header">
                <button class="btn-month-nav" id="prev-month">‹</button>
                <h3>${monthNames[month]} ${year}</h3>
                <button class="btn-month-nav" id="next-month">›</button>
            </div>
            <div class="calendar-days">
                <div class="day-header">L</div><div class="day-header">M</div>
                <div class="day-header">M</div><div class="day-header">J</div>
                <div class="day-header">V</div><div class="day-header">S</div>
                <div class="day-header">D</div>
        `;

        // Calculer les jours
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - (firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1));

        for (let i = 0; i < 42; i++) {
            const currentDay = new Date(startDate);
            currentDay.setDate(startDate.getDate() + i);
            
            const dateStr = currentDay.toISOString().split('T')[0];
            const dayEvents = this.events.filter(event => event.date === dateStr);
            const isCurrentMonth = currentDay.getMonth() === month;
            const isToday = dateStr === new Date().toISOString().split('T')[0];
            const isSelected = dateStr === this.selectedDate.toISOString().split('T')[0];
            
            let dayClass = 'calendar-day';
            if (!isCurrentMonth) dayClass += ' other-month';
            if (isToday) dayClass += ' today';
            if (isSelected) dayClass += ' selected';
            if (dayEvents.length > 0) dayClass += ' has-events';

            html += `<div class="${dayClass}" data-date="${dateStr}">`;
            html += `<span class="day-number">${currentDay.getDate()}</span>`;
            
            if (dayEvents.length > 0) {
                html += '<div class="event-dots">';
                dayEvents.slice(0, 3).forEach(event => {
                    html += `<span class="event-dot" style="background-color: ${this.sectors[event.secteur].color}"></span>`;
                });
                if (dayEvents.length > 3) {
                    html += '<span class="event-dot more">+</span>';
                }
                html += '</div>';
            }
            
            html += '</div>';
        }

        html += '</div>';
        
        // Légende des secteurs
        html += '<div class="calendar-legend">';
        Object.entries(this.sectors).forEach(([key, sector]) => {
            html += `<div class="legend-item">
                <span class="legend-dot" style="background-color: ${sector.color}"></span>
                <span class="legend-text">${sector.name}</span>
            </div>`;
        });
        html += '</div>';

        calendarEl.innerHTML = html;
    }

    renderDayEvents() {
        const dayEventsEl = document.getElementById('day-events');
        if (!dayEventsEl) return;

        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dayAfter = new Date(today);
        dayAfter.setDate(dayAfter.getDate() + 2);

        const dates = [
            { date: today, label: 'Aujourd\'hui' },
            { date: tomorrow, label: 'Demain' },
            { date: dayAfter, label: 'Après-demain' }
        ];

        let html = '<div class="day-tabs">';
        dates.forEach((d, index) => {
            const isActive = index === 0 ? ' active' : '';
            html += `<button class="day-tab${isActive}" data-date="${d.date.toISOString().split('T')[0]}">${d.label}</button>`;
        });
        html += '</div>';

        html += '<div class="events-list" id="events-list">';
        this.renderEventsForDate(today.toISOString().split('T')[0]);
        html += '</div>';

        dayEventsEl.innerHTML = html;
    }

    renderEventsForDate(dateStr) {
        const eventsListEl = document.getElementById('events-list');
        const dayEvents = this.events.filter(event => event.date === dateStr);

        let html = '';
        if (dayEvents.length === 0) {
            html = '<div class="no-events">Aucun événement prévu</div>';
        } else {
            dayEvents.forEach(event => {
                html += `
                    <div class="event-item">
                        <div class="event-time">${event.heure}</div>
                        <div class="event-content">
                            <div class="event-title">${event.titre}</div>
                            <div class="event-location">${event.lieu}</div>
                        </div>
                        <div class="event-sector" style="background-color: ${this.sectors[event.secteur].color}">
                            ${this.sectors[event.secteur].name}
                        </div>
                    </div>
                `;
            });
        }
        
        html += '<a href="/evenements" class="more-events-link">Voir plus d\'événements →</a>';
        
        eventsListEl.innerHTML = html;
    }

    setupEventListeners() {
        // Navigation mois
        document.addEventListener('click', (e) => {
            if (e.target.id === 'prev-month') {
                this.currentDate.setMonth(this.currentDate.getMonth() - 1);
                this.renderCalendar();
                this.setupCalendarDayListeners();
            } else if (e.target.id === 'next-month') {
                this.currentDate.setMonth(this.currentDate.getMonth() + 1);
                this.renderCalendar();
                this.setupCalendarDayListeners();
            }
        });

        // Onglets jours
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('day-tab')) {
                document.querySelectorAll('.day-tab').forEach(tab => tab.classList.remove('active'));
                e.target.classList.add('active');
                this.renderEventsForDate(e.target.dataset.date);
            }
        });

        this.setupCalendarDayListeners();
    }

    setupCalendarDayListeners() {
        document.querySelectorAll('.calendar-day').forEach(day => {
            day.addEventListener('click', () => {
                const dateStr = day.dataset.date;
                this.selectedDate = new Date(dateStr);
                
                // Mettre à jour l'affichage
                document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected'));
                day.classList.add('selected');
                
                // Mettre à jour les onglets et événements
                document.querySelectorAll('.day-tab').forEach(tab => tab.classList.remove('active'));
                document.querySelector('.day-tab').classList.add('active');
                this.renderEventsForDate(dateStr);
            });
        });
    }
}

// Initialisation automatique
document.addEventListener('DOMContentLoaded', () => {
    new EventsCalendar();
});