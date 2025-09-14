<?php
require_once 'config.php';

// Récupération du slug depuis l'URL
$slug = $_GET['slug'] ?? '';

if (empty($slug)) {
    header('Location: /annuaire');
    exit;
}

// Récupération de l'entreprise depuis Directus
$entreprise = directusRequest("entreprises?filter[slug][_eq]=$slug");

if (empty($entreprise['data'])) {
    header('HTTP/1.0 404 Not Found');
    include '404.php';
    exit;
}

$entreprise = $entreprise['data'][0];
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= htmlspecialchars($entreprise['nom']) ?> - Guide de Lyon</title>
    <meta name="description" content="<?= htmlspecialchars(substr($entreprise['description'] ?? '', 0, 160)) ?>">
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

    <!-- Enterprise Detail -->
    <section class="section">
        <div class="container">
            <!-- Breadcrumb -->
            <nav class="breadcrumb">
                <a href="/">Accueil</a> > 
                <a href="/annuaire">Annuaire</a> > 
                <span><?= htmlspecialchars($entreprise['nom']) ?></span>
            </nav>

            <div class="enterprise-detail">
                <div class="enterprise-header">
                    <h1 class="enterprise-title"><?= htmlspecialchars($entreprise['nom']) ?></h1>
                    <?php if (!empty($entreprise['categorie'])): ?>
                        <span class="enterprise-category"><?= htmlspecialchars($entreprise['categorie']) ?></span>
                    <?php endif; ?>
                </div>

                <div class="enterprise-content">
                    <div class="enterprise-main">
                        <?php if (!empty($entreprise['description'])): ?>
                            <div class="enterprise-description">
                                <h2>Description</h2>
                                <p><?= nl2br(htmlspecialchars($entreprise['description'])) ?></p>
                            </div>
                        <?php endif; ?>

                        <?php if (!empty($entreprise['services'])): ?>
                            <div class="enterprise-services">
                                <h2>Services</h2>
                                <p><?= nl2br(htmlspecialchars($entreprise['services'])) ?></p>
                            </div>
                        <?php endif; ?>
                    </div>

                    <div class="enterprise-sidebar">
                        <div class="enterprise-info">
                            <h3>Informations</h3>
                            
                            <?php if (!empty($entreprise['adresse'])): ?>
                                <div class="info-item">
                                    <strong>📍 Adresse :</strong>
                                    <span><?= htmlspecialchars($entreprise['adresse']) ?></span>
                                </div>
                            <?php endif; ?>

                            <?php if (!empty($entreprise['telephone'])): ?>
                                <div class="info-item">
                                    <strong>📞 Téléphone :</strong>
                                    <a href="tel:<?= htmlspecialchars($entreprise['telephone']) ?>"><?= htmlspecialchars($entreprise['telephone']) ?></a>
                                </div>
                            <?php endif; ?>

                            <?php if (!empty($entreprise['email'])): ?>
                                <div class="info-item">
                                    <strong>📧 Email :</strong>
                                    <a href="mailto:<?= htmlspecialchars($entreprise['email']) ?>"><?= htmlspecialchars($entreprise['email']) ?></a>
                                </div>
                            <?php endif; ?>

                            <?php if (!empty($entreprise['site_web'])): ?>
                                <div class="info-item">
                                    <strong>🌐 Site web :</strong>
                                    <a href="<?= htmlspecialchars($entreprise['site_web']) ?>" target="_blank" rel="noopener">Visiter le site</a>
                                </div>
                            <?php endif; ?>

                            <?php if (!empty($entreprise['horaires'])): ?>
                                <div class="info-item">
                                    <strong>🕒 Horaires :</strong>
                                    <span><?= nl2br(htmlspecialchars($entreprise['horaires'])) ?></span>
                                </div>
                            <?php endif; ?>
                        </div>

                        <div class="enterprise-actions">
                            <a href="/annuaire" class="btn-secondary">← Retour à l'annuaire</a>
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
    .breadcrumb {
        margin-bottom: 2rem;
        font-size: 0.9rem;
        color: #666;
    }
    
    .breadcrumb a {
        color: #e74c3c;
        text-decoration: none;
    }
    
    .breadcrumb a:hover {
        text-decoration: underline;
    }
    
    .enterprise-header {
        text-align: center;
        margin-bottom: 3rem;
    }
    
    .enterprise-title {
        font-size: 2.5rem;
        color: #333;
        margin-bottom: 1rem;
    }
    
    .enterprise-category {
        background: #e74c3c;
        color: white;
        padding: 8px 20px;
        border-radius: 25px;
        font-size: 1rem;
        font-weight: 500;
    }
    
    .enterprise-content {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 3rem;
    }
    
    .enterprise-main h2 {
        color: #333;
        margin-bottom: 1rem;
        font-size: 1.5rem;
    }
    
    .enterprise-description,
    .enterprise-services {
        margin-bottom: 2rem;
    }
    
    .enterprise-sidebar {
        background: #f8f9fa;
        padding: 2rem;
        border-radius: 12px;
        height: fit-content;
    }
    
    .enterprise-info h3 {
        color: #333;
        margin-bottom: 1.5rem;
        font-size: 1.25rem;
    }
    
    .info-item {
        margin-bottom: 1rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid #eee;
    }
    
    .info-item:last-child {
        border-bottom: none;
        margin-bottom: 0;
    }
    
    .info-item strong {
        display: block;
        margin-bottom: 0.5rem;
        color: #555;
    }
    
    .info-item a {
        color: #e74c3c;
        text-decoration: none;
    }
    
    .info-item a:hover {
        text-decoration: underline;
    }
    
    .enterprise-actions {
        margin-top: 2rem;
    }
    
    .btn-secondary {
        display: inline-block;
        background: #6c757d;
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        text-decoration: none;
        font-weight: 500;
        transition: background 0.3s ease;
    }
    
    .btn-secondary:hover {
        background: #5a6268;
    }
    
    @media (max-width: 768px) {
        .enterprise-content {
            grid-template-columns: 1fr;
            gap: 2rem;
        }
        
        .enterprise-title {
            font-size: 2rem;
        }
    }
    </style>
</body>
</html>