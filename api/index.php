<?php
require_once 'config.php';

// Récupération des données depuis Directus
$articles = directusRequest('articles?limit=6&sort=-date_created');
$entreprises = directusRequest('entreprises?limit=8&sort=-date_created');
$evenements = directusRequest('evenements?limit=4&sort=date_evenement');

?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Guide de Lyon - Votre guide complet de Lyon</title>
    <meta name="description" content="Découvrez Lyon : restaurants, hôtels, événements, culture et bien plus. Votre guide complet pour explorer la capitale des Gaules.">
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

    <!-- Hero Section -->
    <section class="hero">
        <div class="hero-content">
            <h1 class="hero-title">Découvrez Lyon</h1>
            <p class="hero-subtitle">Votre guide complet pour explorer la capitale des Gaules</p>
            <a href="/annuaire" class="hero-button">Explorer l'annuaire</a>
        </div>
    </section>

    <!-- Articles Section -->
    <section class="section">
        <div class="container">
            <h2 class="section-title">Derniers Articles</h2>
            <div class="grid">
                <?php if (!empty($articles['data'])): ?>
                    <?php foreach (array_slice($articles['data'], 0, 6) as $article): ?>
                        <article class="card">
                            <div class="card-content">
                                <h3 class="card-title"><?= htmlspecialchars($article['titre']) ?></h3>
                                <p class="card-excerpt"><?= htmlspecialchars(substr($article['contenu'] ?? '', 0, 150)) ?>...</p>
                                <div class="card-meta">
                                    <span class="card-category"><?= htmlspecialchars($article['categorie'] ?? 'Actualité') ?></span>
                                    <time class="card-date"><?= date('d/m/Y', strtotime($article['date_created'])) ?></time>
                                </div>
                            </div>
                        </article>
                    <?php endforeach; ?>
                <?php else: ?>
                    <p>Aucun article disponible pour le moment.</p>
                <?php endif; ?>
            </div>
        </div>
    </section>

    <!-- Entreprises Section -->
    <section class="section section-alt">
        <div class="container">
            <h2 class="section-title">Entreprises à Découvrir</h2>
            <div class="grid">
                <?php if (!empty($entreprises['data'])): ?>
                    <?php foreach (array_slice($entreprises['data'], 0, 8) as $entreprise): ?>
                        <div class="card">
                            <div class="card-content">
                                <h3 class="card-title"><?= htmlspecialchars($entreprise['nom']) ?></h3>
                                <p class="card-excerpt"><?= htmlspecialchars($entreprise['description'] ?? '') ?></p>
                                <div class="card-meta">
                                    <span class="card-category"><?= htmlspecialchars($entreprise['categorie'] ?? '') ?></span>
                                    <?php if (!empty($entreprise['adresse'])): ?>
                                        <span class="card-location"><?= htmlspecialchars($entreprise['adresse']) ?></span>
                                    <?php endif; ?>
                                </div>
                                <a href="/entreprise/<?= htmlspecialchars($entreprise['slug'] ?? $entreprise['id']) ?>" class="card-link">En savoir plus</a>
                            </div>
                        </div>
                    <?php endforeach; ?>
                <?php else: ?>
                    <p>Aucune entreprise disponible pour le moment.</p>
                <?php endif; ?>
            </div>
        </div>
    </section>

    <!-- Événements Section -->
    <section class="section">
        <div class="container">
            <h2 class="section-title">Prochains Événements</h2>
            <div class="grid">
                <?php if (!empty($evenements['data'])): ?>
                    <?php foreach (array_slice($evenements['data'], 0, 4) as $evenement): ?>
                        <div class="card">
                            <div class="card-content">
                                <h3 class="card-title"><?= htmlspecialchars($evenement['titre']) ?></h3>
                                <p class="card-excerpt"><?= htmlspecialchars($evenement['description'] ?? '') ?></p>
                                <div class="card-meta">
                                    <?php if (!empty($evenement['date_evenement'])): ?>
                                        <time class="card-date"><?= date('d/m/Y', strtotime($evenement['date_evenement'])) ?></time>
                                    <?php endif; ?>
                                    <?php if (!empty($evenement['lieu'])): ?>
                                        <span class="card-location"><?= htmlspecialchars($evenement['lieu']) ?></span>
                                    <?php endif; ?>
                                </div>
                            </div>
                        </div>
                    <?php endforeach; ?>
                <?php else: ?>
                    <p>Aucun événement programmé pour le moment.</p>
                <?php endif; ?>
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
</body>
</html>