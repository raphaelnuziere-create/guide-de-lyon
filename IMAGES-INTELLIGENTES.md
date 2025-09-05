# 🧠 SCRIPT INTELLIGENT - Images vraiment pertinentes

## ✅ Le nouveau script détecte plus de 150 mots-clés !

### 🎯 Exemples de détection intelligente :

| Mot dans le titre | Image recherchée | Résultat |
|-------------------|------------------|----------|
| **bar** | "bar drinks people nightlife" | 🍺 Photos de bars avec verres |
| **restaurant** | "restaurant plate food dining" | 🍽️ Assiettes avec plats |
| **bibliothèque** | "library books reading" | 📚 Livres et rayonnages |
| **aquarium** | "aquarium fish underwater" | 🐠 Poissons et aquariums |
| **zoo** | "zoo animals wildlife" | 🦁 Animaux de zoo |
| **église** | "church lyon cathedral" | ⛪ Églises de Lyon |
| **Place Bellecour** | "place bellecour lyon square" | 📍 La vraie Place Bellecour |
| **Fourvière** | "fourviere basilica lyon" | 🏛️ La Basilique de Fourvière |
| **bouchon** | "lyon bouchon traditional food" | 🍖 Cuisine lyonnaise |
| **cocktail** | "cocktail drink mixology" | 🍹 Cocktails colorés |
| **pizza** | "pizza italian food" | 🍕 Pizzas appétissantes |
| **yoga** | "yoga meditation wellness" | 🧘 Séances de yoga |
| **métro** | "metro subway station" | 🚇 Stations de métro |
| **festival** | "festival event crowd music" | 🎪 Événements festifs |

## 🚀 Utilisation :

```bash
cd /Users/raphaellebestplusbeauquejaime/Desktop/guide-lyon-v2

# Pour mettre à jour les articles sans image
node pexels-images-smart.mjs VOTRE_CLE_API_PEXELS

# Pour REMPLACER TOUTES les images (recommandé)
node pexels-images-smart.mjs VOTRE_CLE_API_PEXELS --force
```

## 📋 Ce que fait le script :

1. **Analyse** le titre de chaque article
2. **Détecte** les mots-clés importants (bar, restaurant, église, etc.)
3. **Cherche** une image SPÉCIFIQUE (pas juste "Lyon")
4. **Varie** les résultats (choisit aléatoirement parmi les meilleures)

## 🎨 Catégories détectées :

### 🏛️ Lieux spécifiques de Lyon
- Place Bellecour, Fourvière, Vieux Lyon
- Croix-Rousse, Confluence, Part-Dieu
- Parc de la Tête d'Or, Terreaux, etc.

### 🍽️ Restaurants & Nourriture
- Bouchons, gastronomique, pizzeria, sushi
- Burger, végétarien, brasserie, bistrot
- Détection fine : assiettes avec nourriture

### 🍺 Bars & Boissons
- Bar à vin → images de verres de vin
- Bar à cocktails → images de cocktails
- Bar à bière → images de bières
- Pub, boîte de nuit, club

### 📚 Culture & Loisirs
- Bibliothèque → livres
- Musée → galeries d'art
- Théâtre → scènes de spectacle
- Cinéma → salles de cinéma

### 🐠 Animaux & Nature
- Aquarium → poissons
- Zoo → animaux
- Parcs → espaces verts

### ⛪ Religion
- Église → églises de Lyon
- Cathédrale → cathédrale Saint-Jean
- Basilique → Fourvière

### 🛍️ Shopping
- Boutique → magasins
- Marché → produits frais
- Centre commercial → galeries

### 🏊 Sport & Bien-être
- Piscine → bassins
- Fitness/Gym → salles de sport
- Yoga → séances
- Stade → terrains

### 🚇 Transport
- Métro → stations
- Tram → tramways
- Vélo → vélos

## ✨ Résultat :

Avant : Beaucoup d'images génériques de Lyon 😕
Après : Chaque article a une image vraiment pertinente ! 🎉

## 💡 Conseil :

Utilisez `--force` pour remplacer TOUTES les images et avoir un blog cohérent avec des visuels variés et pertinents.

```bash
node pexels-images-smart.mjs VOTRE_CLE --force
```

---

**C'est le script le plus intelligent !** Fini les images répétitives de Lyon, maintenant chaque article aura l'image parfaite 🎯