<?php
require_once 'config.php';

// Récupération des entreprises depuis Directus
$entreprises = directusRequest('entreprises?sort=-date_created');
$categories = directusRequest('categories_entreprises');

?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Annuaire - Guide de Lyon</title>
    <meta name="description" content="Découvrez l'annuaire complet des entreprises de Lyon : restaurants, hôtels, services et commerces.">
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
            <h1 class="hero-title">Annuaire des Entreprises</h1>
            <p class="hero-subtitle">Découvrez les meilleures entreprises de Lyon</p>
        </div>
    </section>

    <!-- Annuaire Section -->
    <section class="section">
        <div class="container">
            <div class="grid">
                <?php if (!empty($entreprises['data'])): ?>
                    <?php foreach ($entreprises['data'] as $entreprise): ?>
                        <div class="card">
                            <div class="card-content">
                                <h3 class="card-title"><?= htmlspecialchars($entreprise['nom']) ?></h3>
                                <p class="card-excerpt"><?= htmlspecialchars(substr($entreprise['description'] ?? '', 0, 150)) ?>...</p>
                                <div class="card-meta">
                                    <span class="card-category"><?= htmlspecialchars($entreprise['categorie'] ?? 'Entreprise') ?></span>
                                    <?php if (!empty($entreprise['adresse'])): ?>
                                        <span class="card-location"><?= htmlspecialchars($entreprise['adresse']) ?></span>
                                    <?php endif; ?>
                                    <?php if (!empty($entreprise['telephone'])): ?>
                                        <span class="card-phone"><?= htmlspecialchars($entreprise['telephone']) ?></span>
                                    <?php endif; ?>
                                </div>
                                <a href="/entreprise/<?= htmlspecialchars($entreprise['slug'] ?? $entreprise['id']) ?>" class="card-link">En savoir plus</a>
                            </div>
                        </div>
                    <?php endforeach; ?>
                <?php else: ?>
                    <div class="card">
                        <div class="card-content">
                            <h3 class="card-title">Aucune entreprise trouvée</h3>
                            <p class="card-excerpt">L'annuaire sera bientôt enrichi avec de nouvelles entreprises.</p>
                        </div>
                    </div>
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