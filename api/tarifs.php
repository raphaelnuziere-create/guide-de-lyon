<?php
require_once 'config.php';
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tarifs - Guide de Lyon</title>
    <meta name="description" content="Découvrez nos tarifs pour référencer votre entreprise dans le Guide de Lyon.">
    <link rel="stylesheet" href="/css/style.css">
</head>
<body>
    <!-- Header -->
    <header class="header">
        <nav class="nav">
            <div class="nav-container">
                <a href="/" class="nav-logo">
                    <h1>Guide de Lyon</h1>
                </a>
                <div class="nav-menu">
                    <a href="/annuaire" class="nav-link">Annuaire</a>
                    <a href="/evenements" class="nav-link">Événements</a>
                    <a href="/tarifs" class="nav-link">Tarifs</a>
                </div>
            </div>
        </nav>
    </header>

    <!-- Page Header -->
    <section class="hero">
        <div class="hero-content">
            <h1 class="hero-title">Nos Tarifs</h1>
            <p class="hero-subtitle">Choisissez la formule qui correspond à vos besoins</p>
        </div>
    </section>

    <!-- Tarifs Section -->
    <section class="section">
        <div class="container">
            <div class="grid">
                <!-- Formule Basique -->
                <div class="card">
                    <div class="card-content">
                        <h3 class="card-title">Référencement Basique</h3>
                        <div class="price">
                            <span class="price-amount">29€</span>
                            <span class="price-period">/mois</span>
                        </div>
                        <ul class="features-list">
                            <li>✓ Fiche entreprise complète</li>
                            <li>✓ Photos (5 max)</li>
                            <li>✓ Informations de contact</li>
                            <li>✓ Horaires d'ouverture</li>
                            <li>✓ Description (200 mots)</li>
                        </ul>
                        <a href="mailto:contact@guide-de-lyon.fr?subject=Demande%20Référencement%20Basique" class="card-link">Nous contacter</a>
                    </div>
                </div>

                <!-- Formule Premium -->
                <div class="card">
                    <div class="card-content">
                        <h3 class="card-title">Référencement Premium</h3>
                        <div class="price">
                            <span class="price-amount">59€</span>
                            <span class="price-period">/mois</span>
                        </div>
                        <ul class="features-list">
                            <li>✓ Tout de la formule Basique</li>
                            <li>✓ Photos illimitées</li>
                            <li>✓ Vidéo de présentation</li>
                            <li>✓ Position prioritaire</li>
                            <li>✓ Article de blog dédié</li>
                            <li>✓ Statistiques de vues</li>
                        </ul>
                        <a href="mailto:contact@guide-de-lyon.fr?subject=Demande%20Référencement%20Premium" class="card-link">Nous contacter</a>
                    </div>
                </div>

                <!-- Formule Pro -->
                <div class="card">
                    <div class="card-content">
                        <h3 class="card-title">Référencement Pro</h3>
                        <div class="price">
                            <span class="price-amount">99€</span>
                            <span class="price-period">/mois</span>
                        </div>
                        <ul class="features-list">
                            <li>✓ Tout de la formule Premium</li>
                            <li>✓ Page dédiée personnalisée</li>
                            <li>✓ Référencement SEO optimisé</li>
                            <li>✓ Newsletter mention mensuelle</li>
                            <li>✓ Support prioritaire</li>
                            <li>✓ Intégration réseaux sociaux</li>
                        </ul>
                        <a href="mailto:contact@guide-de-lyon.fr?subject=Demande%20Référencement%20Pro" class="card-link">Nous contacter</a>
                    </div>
                </div>
            </div>

            <!-- Section avantages -->
            <div style="margin-top: 4rem; text-align: center;">
                <h2 class="section-title">Pourquoi nous choisir ?</h2>
                <div class="grid">
                    <div class="card">
                        <div class="card-content">
                            <h3 class="card-title">🎯 Visibilité Locale</h3>
                            <p class="card-excerpt">Atteignez votre clientèle lyonnaise grâce à notre audience ciblée et engagée.</p>
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-content">
                            <h3 class="card-title">📱 Multi-plateforme</h3>
                            <p class="card-excerpt">Votre fiche est optimisée pour tous les appareils : mobile, tablette et ordinateur.</p>
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-content">
                            <h3 class="card-title">📈 Résultats Mesurables</h3>
                            <p class="card-excerpt">Suivez les performances de votre référencement avec nos statistiques détaillées.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <div class="footer-content">
                <div class="footer-section">
                    <h3>Guide de Lyon</h3>
                    <p>Votre guide complet pour découvrir Lyon et ses environs.</p>
                </div>
                <div class="footer-section">
                    <h4>Navigation</h4>
                    <ul>
                        <li><a href="/annuaire">Annuaire</a></li>
                        <li><a href="/evenements">Événements</a></li>
                        <li><a href="/tarifs">Tarifs</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h4>Contact</h4>
                    <p>Email: contact@guide-de-lyon.fr</p>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2024 Guide de Lyon. Tous droits réservés.</p>
            </div>
        </div>
    </footer>

    <style>
    .price {
        text-align: center;
        margin: 2rem 0;
    }
    
    .price-amount {
        font-size: 3rem;
        font-weight: 700;
        color: #e74c3c;
    }
    
    .price-period {
        color: #666;
        font-size: 1.1rem;
    }
    
    .features-list {
        list-style: none;
        padding: 0;
        margin: 2rem 0;
    }
    
    .features-list li {
        padding: 0.5rem 0;
        border-bottom: 1px solid #eee;
        color: #555;
    }
    
    .features-list li:last-child {
        border-bottom: none;
    }
    </style>
</body>
</html>