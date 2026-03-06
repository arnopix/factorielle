# Factorielle - Stratégie de Premiumisation

## La vision : Gratuit pour tuer, Premium pour régner

### Pourquoi c'est malin

Le marché de la facturation en France est fragmenté entre des outils chers (Pennylane, Henrri, Tiime) et des trucs moches/compliqués. L'approche "gratuit d'abord" est redoutable pour 3 raisons :

1. **Coût d'acquisition client = 0** - Pas de pub, le produit vend le produit. Le badge "Créé avec Factorielle.app" sur chaque PDF est un canal viral gratuit.
2. **Lock-in naturel** - Une fois que l'indépendant a ses 50 factures et 20 clients dans l'outil, il ne part plus. Ses données sont là.
3. **Timing parfait** - La facturation électronique devient obligatoire en France (2026-2027). Des millions de TPE vont chercher un outil. Celui qui capte la base avant la vague gagne.

### Risques à surveiller

- **Ne pas premiumiser trop tôt** - Si le paywall arrive avant la masse critique, les gens partent. Viser 10k+ utilisateurs actifs avant de monétiser.
- **Ne pas casser le gratuit** - Le free doit rester un vrai produit complet, pas une démo castré. Le premium doit apporter du *plus*, pas débloquer des trucs basiques.
- **Coûts serveur** - Aujourd'hui tout est en localStorage = 0€ de coût. Dès qu'on ajoute du cloud, les coûts montent. Bien timer la migration.

---

## Features Premium - Par ordre de priorité business

### Tier 1 : "Pro" (9€/mois) - Le no-brainer

| Feature | Pourquoi ça convertit | Effort |
|---------|----------------------|--------|
| **Synchronisation cloud** | Le truc #1 que les gens demanderont. Multi-appareil, plus de peur de perdre ses données. | Élevé |
| **Personnalisation PDF** | Logo, couleurs custom, templates multiples. L'identité visuelle c'est important pour les freelances. | Moyen |
| **Relances automatiques** | Envoi auto d'un email quand la facture est en retard. Gagne du temps = valeur immédiate. | Moyen |
| **Envoi par email intégré** | Envoyer la facture directement depuis l'app au lieu de télécharger le PDF et l'envoyer manuellement. | Moyen |
| **Tableau de bord avancé** | Graphiques CA mensuel, top clients, prévisions, comparaison année précédente. | Faible |
| **Sans le badge Factorielle** | Retirer le "Créé avec Factorielle.app" du PDF. Les pros le veulent. | Trivial |

### Tier 2 : "Business" (19€/mois) - Pour ceux qui grossissent

| Feature | Pourquoi ça convertit | Effort |
|---------|----------------------|--------|
| **Factur-X / e-invoicing** | Conformité facturation électronique obligatoire. Littéralement obligatoire par la loi. Énorme levier. | Élevé |
| **Connexion bancaire** | Rapprochement bancaire auto : la facture se marque "payée" toute seule quand le virement arrive. | Élevé |
| **Multi-utilisateurs** | Comptable, associé, assistant. Gestion des rôles. | Élevé |
| **API / Zapier** | Connecter avec d'autres outils (CRM, comptabilité). Les power users adorent. | Moyen |
| **Gestion des dépenses** | Notes de frais, achats, pour voir la marge réelle. | Moyen |
| **Export comptable** | FEC, export pour le comptable, formats standards. | Moyen |

### Tier 3 : "Expert-Comptable" (49€/mois) - Le vrai game changer

| Feature | Pourquoi ça convertit | Effort |
|---------|----------------------|--------|
| **Portail comptable** | Un comptable peut gérer les factures de tous ses clients Factorielle depuis un seul dashboard. | Élevé |
| **Client onboarding** | Le comptable recommande Factorielle à ses clients → viral B2B2C. | Moyen |
| **Marque blanche** | Le comptable peut mettre son logo sur l'interface de ses clients. | Moyen |

---

## Stratégie de conversion : Le funnel

```
[Utilisateur gratuit]
    ↓ utilise le produit 2-3 mois
    ↓ a 10+ factures, 5+ clients
    ↓ est "locked in" naturellement
    ↓
[Soft upsell]
    → "Envoyez cette facture par email" → 🔒 Pro
    → "Personnalisez votre PDF" → 🔒 Pro
    → "Activez les relances auto" → 🔒 Pro
    ↓
[Conversion Pro - 9€/mois]
    ↓ business grossit
    ↓
[Hard upsell]
    → "Facturation électronique obligatoire en 2027" → 🔒 Business
    → "Connectez votre banque" → 🔒 Business
    ↓
[Conversion Business - 19€/mois]
```

### Règles d'or du upsell

1. **Jamais de popup agressif** - Un petit badge discret "Pro" à côté de la feature, c'est tout
2. **Toujours montrer la feature** - L'utilisateur voit le bouton "Envoyer par email" mais il est grisé avec un badge Pro. Il sait que ça existe.
3. **Période d'essai gratuite** - 14 jours de Pro gratuit pour goûter, puis retour au gratuit. Pas de CB demandée.
4. **Pricing transparent** - Affiché clairement, pas de surprise

---

## Métriques clés à suivre

| Métrique | Cible Phase 1 | Cible Phase 2 |
|----------|---------------|---------------|
| Utilisateurs actifs mensuels | 10 000 | 50 000 |
| Factures créées/mois | 30 000 | 200 000 |
| Taux de conversion gratuit→Pro | - | 5-8% |
| Revenue mensuel récurrent (MRR) | 0€ | 25 000€+ |
| Coût d'acquisition client | 0€ | < 5€ |
| Churn mensuel | - | < 3% |

---

## Timeline recommandée

### Phase 1 : Acquisition (Mois 1-6)
- Produit gratuit nickel, zéro bug
- SEO agressif (blog facturation, guides auto-entrepreneur)
- Viral : badge PDF, bouton partage, referral
- Objectif : 10k utilisateurs actifs

### Phase 2 : Monétisation (Mois 6-12)
- Lancement Pro à 9€/mois
- Sync cloud + personnalisation PDF + relances
- Soft upsell dans l'app
- Objectif : 500 clients payants = 4 500€ MRR

### Phase 3 : Scale (Mois 12-24)
- Lancement Business à 19€/mois
- Factur-X, connexion bancaire
- Portail comptable
- Objectif : 2 000 clients payants = 25 000€+ MRR

---

## Le mot de la fin

La stratégie "gratuit pour tuer" marche si et seulement si :
1. Le produit gratuit est **tellement bon** que les gens en parlent
2. Le premium apporte de la **vraie valeur** (pas juste débloquer du basique)
3. On **ne monétise pas trop tôt** (masse critique d'abord)

Le gros avantage : les concurrents facturent 15-30€/mois pour des trucs que Factorielle donne gratis. Ça crée un bouche-à-oreille naturel impossible à acheter.
