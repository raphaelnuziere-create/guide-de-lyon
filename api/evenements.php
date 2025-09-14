<?php
require_once 'config.php';

// Récupération des événements depuis Directus
$evenements = directusRequest('evenements?sort=date_evenement');

?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Événements - Guide de Lyon</title>
    <meta name="description" content="Découvrez tous les événements à Lyon : concerts, festivals, expositions, spectacles et plus encore.">
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
            <h1 class="hero-title">Événements à Lyon</h1>
            <p class="hero-subtitle">Ne manquez aucun événement dans la capitale des Gaules</p>
        </div>
    </section>

    <!-- Événements Section -->
    <section class="section">
        <div class="container">
            <div class="grid">
                <?php if (!empty($evenements['data'])): ?>
                    <?php foreach ($evenements['data'] as $evenement): ?>
                        <div class="card">
                            <div class="card-content">
                                <h3 class="card-title"><?= htmlspecialchars($evenement['titre']) ?></h3>
                                <p class="card-excerpt"><?= htmlspecialchars(substr($evenement['description'] ?? '', 0, 150)) ?>...</p>
                                <div class="card-meta">
                                    <?php if (!empty($evenement['date_evenement'])): ?>
                                        <time class="card-date"><?= date('d/m/Y à H:i', strtotime($evenement['date_evenement'])) ?></time>
                                    <?php endif; ?>
                                    <?php if (!empty($evenement['lieu'])): ?>
                                        <span class="card-location"><?= htmlspecialchars($evenement['lieu']) ?></span>
                                    <?php endif; ?>
                                    <?php if (!empty($evenement['prix'])): ?>
                                        <span class="card-price"><?= htmlspecialchars($evenement['prix']) ?></span>
                                    <?php endif; ?>
                                </div>
                                <?php if (!empty($evenement['lien_billetterie'])): ?>
                                    <a href="<?= htmlspecialchars($evenement['lien_billetterie']) ?>" target="_blank" class="card-link">Réserver</a>
                                <?php endif; ?>
                            </div>
                        </div>
                    <?php endforeach; ?>
                <?php else: ?>
                    <div class="card">
                        <div class="card-content">
                            <h3 class="card-title">Aucun événement programmé</h3>
                            <p class="card-excerpt">De nouveaux événements seront bientôt ajoutés. Revenez régulièrement pour ne rien manquer !</p>
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