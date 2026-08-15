CTN ART — Site vitrine + panneau d'administration
====================================================

NOUVEAU : PANNEAU ADMIN POUR GÉRER LES PHOTOS
------------------------------------------------
Le site a maintenant un espace admin à l'adresse /admin (ex: 
https://tonsite.netlify.app/admin) qui permet à toi et Eustache d'ajouter
des photos sans toucher au code :

- 🏠 Accueil — Carrousel : les photos qui défilent sur la page d'accueil
- 🖼️ Réalisations : la galerie de la page Réalisations
- 📚 Bibliothèque de styles : les visuels par catégorie (graphique, gaming,
  manga, nature, paysage, animaux, sport) que les clients peuvent parcourir
  sur la page Services, avant de choisir leur habillage

Dans chaque collection, on choisit "Image" pour uploader une photo, on
remplit une légende (optionnel) et — pour Réalisations et Bibliothèque — on
choisit une catégorie dans une liste déroulante. On clique sur "Publish",
et la photo apparaît sur le site en général en 1-2 minutes (le temps que
Netlify republie le site).

📚 Bibliothèque — ajout groupé : pour ajouter plusieurs images d'un coup
dans la même catégorie (ex: 15 exemples "gaming"), utilise le champ
"✅ Ajout groupé" en haut de la collection Bibliothèque : choisis UNE
catégorie, puis clique sur le champ Images et sélectionne plusieurs
fichiers à la fois (Ctrl/Cmd + clic dans la fenêtre de sélection, ou
glisse-dépose un groupe entier). Toutes ces images seront publiées
ensemble sous cette catégorie en un seul clic sur "Publish". Le champ
"Ajout individuel" juste en dessous reste disponible pour une image avec
sa propre légende précise, au cas par cas.

⚠️ IMPORTANT : ce panneau admin utilise un outil (Decap CMS) qui a besoin
que le site soit connecté à un dépôt GitHub — le simple glisser-déposer
utilisé jusqu'ici ne suffit plus. Voici comment migrer :

ÉTAPE 1 — Créer le dépôt GitHub
---------------------------------
1. Va sur github.com → New repository (ex: nom "ctn-art-site")
2. En local, dans le dossier "ctn-art" : 
     git init
     git add .
     git commit -m "Site CTN ART"
     git branch -M main
     git remote add origin https://github.com/TON-USER/ctn-art-site.git
     git push -u origin main

ÉTAPE 2 — Connecter le dépôt à Netlify
------------------------------------------
1. app.netlify.com → "Add new site" → "Import an existing project"
2. Choisis GitHub, autorise Netlify, sélectionne le dépôt "ctn-art-site"
3. Build command : laisse vide — Publish directory : laisse "/" (racine)
4. Deploy site

Si un site Netlify existe déjà depuis le glisser-déposer précédent, tu peux
soit le supprimer et refaire l'étape 2, soit dans Site settings → Build &
deploy → Link repository, connecter ce même dépôt GitHub à ce site existant
(ça garde ton domaine et tes réglages actuels).

ÉTAPE 3 — Activer l'authentification (Netlify Identity)
------------------------------------------------------------
1. Dans le dashboard du site → onglet "Identity" → "Enable Identity"
2. Identity → Settings and usage → Registration preferences → 
   choisis "Invite only" (pour que seuls toi et Eustache puissiez vous
   connecter à l'admin)
3. Identity → Services → Git Gateway → "Enable Git Gateway"
4. Identity → Invite users → entre ton email et celui d'Eustache
   Vous recevrez chacun un email d'invitation avec un lien.

ÉTAPE 4 — Se connecter à l'admin
-------------------------------------
1. Clique sur le lien reçu par email → ça ouvre le site avec une popup
   pour choisir un mot de passe
2. Une fois le mot de passe créé, va sur tonsite.netlify.app/admin
3. Connecte-toi avec cet email / mot de passe → tu es dans le panneau admin

Une fois ces 4 étapes faites une seule fois, l'admin reste utilisable en
permanence — plus besoin de repasser par le code pour ajouter des photos.

STRUCTURE
---------
index.html         Accueil (hero coverflow — piloté par content/hero.json, avis en défilement continu)
a-propos.html       À propos (équipe réelle, cartes cliquables avec animation)
services.html       Services (PC portables, tarifs, formations, teaser bibliothèque)
bibliotheque.html   Bibliothèque de styles, page dédiée (pilotée par content/library.json)
realisations.html   Galerie carrousel (pilotée par content/realisations.json)
contact.html        Contact (formulaire → message WhatsApp prérempli)
merci.html          Page de repli si jamais le JS est désactivé
css/style.css        Design system complet
js/main.js            Nav, carrousels, modals équipe, lightbox, CMS, popups, scroll fx
admin/index.html       Panneau d'administration (Decap CMS)
admin/config.yml        4 collections : hero / réalisations / avis / bibliothèque
content/*.json           Données éditées par l'admin (photos, avis, légendes, catégories)
img/uploads/               Dossier où les photos ajoutées via l'admin sont rangées
img/real/ , img/team/       Photos actuelles (déjà en place)
favicon.svg / favicon.ico / apple-touch-icon.png

NOTIFICATIONS RÉSEAUX SOCIAUX
--------------------------------
Un système de popups "abonne-toi" apparaît sur tout le site, ton naturel et
street : Snapchat, Instagram, TikTok, X, Facebook — un par un. La première
arrive 10s après l'arrivée sur le site (peu importe la page), puis une
nouvelle toutes les 13s, jusqu'à ce que les 5 soient passées. Ensuite le
système fait une pause de 70s avant de recommencer le cycle. Un clic
n'importe où ailleurs sur l'écran referme le popup.

TOUT PASSE PAR WHATSAPP
--------------------------
Tous les boutons d'action du site (Démarrer un projet, Commander,
Demander un devis, Demander une formation, etc.) ouvrent WhatsApp avec un
message déjà rédigé et prérempli — la personne n'a qu'à appuyer sur envoyer.
Le formulaire de contact fait pareil : il regroupe tout ce que la personne
a écrit (nom, téléphone, type de projet, message) dans un message WhatsApp
prêt à envoyer. Une copie silencieuse part aussi vers Netlify Forms comme
filet de sécurité, au cas où quelqu'un ne finalise pas l'envoi WhatsApp.

Numéro WhatsApp utilisé partout : +229 50 60 15 42
Pour le changer : chercher "22950601542" dans tous les fichiers .html et
dans js/main.js (variable WA_NUMBER dans contact.html).

À FAIRE
--------
- Suivre les 4 étapes ci-dessus pour activer l'admin
- Ajouter les premières images dans "Bibliothèque de styles" (elle est
  vide pour l'instant — un message "en cours de préparation" s'affiche
  à la place en attendant)
- Envoyer les bios définitives des deux fondateurs si tu veux les affiner
  (a-propos.html, attributs data-bio des boutons .team-flip-card)
- Vérifier l'adresse exacte de l'atelier à Calavi (page contact.html)
- Activer la section "Coques & pochettes téléphone" quand le service sera prêt

NOTES TECHNIQUES
-----------------
- Le site reste 100% statique côté visiteur (HTML/CSS/JS, aucune dépendance
  de build). L'admin ajoute juste des fichiers JSON que le site va chercher
  au chargement — si un fichier est vide ou indisponible, le contenu déjà
  présent dans le HTML reste affiché, rien ne casse jamais.
- Le contenu ne dépend jamais du JS pour s'afficher au premier rendu : même
  si le JS plante, tout reste visible (voir commentaire en haut de js/main.js).
- Polices : Fredoka (logo/titres), Plus Jakarta Sans (texte), JetBrains Mono
  (étiquettes) — chargées via Google Fonts.
