# ABBASIA.SHOP — photos de démonstration

Six visuels temporaires sont fournis dans `public/demo-products/` : smartphone, sac à main, casque audio, baskets, sérum et mixeur.

- Ils sont uniquement destinés à la prévisualisation pendant le développement.
- La page d'accueil les affiche uniquement en développement (`NODE_ENV !== production`) et seulement lorsque l'API ne retourne aucun produit réel.
- Dès que des produits actifs existent dans Supabase, les produits réels remplacent automatiquement cette sélection de démonstration.
- En production, les produits de démonstration ne sont jamais affichés.
- Les vendeurs pourront ensuite remplacer ces visuels par leurs propres photos via le formulaire de gestion des produits et Supabase Storage.

Les visuels ont été générés comme images illustratives : ils ne représentent pas une marque, un modèle ou un stock réel.
