# ProKid — Notes de livraison

## État de la plateforme

### Ce qui est fonctionnel et livré

**Inscription & Onboarding**
- Inscription pro : email + mdp → onboarding 3 étapes (identité, activité pro, finalisation)
- Inscription structure : email + mdp → onboarding 3 étapes (établissement, localisation, responsable)
- Vérification email via Supabase Auth + Mailpit en dev
- Bouton déconnexion disponible partout (onboarding, subscription)
- Géocodage automatique des villes via API gouv.fr

**Annuaire professionnel (public)**
- Page /professionals accessible sans connexion (SEO-ready)
- Recherche par nom, ville (autocomplete), métier, disponibilité
- Profils publics avec metadata SEO, schema.org, sitemap dynamique
- Chaque profil : expériences, certifications, avis, compétences

**Système de missions (1 conversation = 1 mission)**
- Structure propose une mission : dates, horaires (mêmes ou par jour), modalité, adresse
- Conversation créée automatiquement par mission
- Pro accepte/décline dans le chat
- Messages système (accepted, declined)
- Missions expirées/terminées automatiquement (cron toutes les heures)

**Messagerie temps réel**
- Chat Supabase Realtime (broadcast)
- Rapports rédigés directement dans le chat (avec pièces jointes)
- Avis post-mission dans le chat
- Badge "En attente de votre réponse" sur les conversations
- Export PDF des rapports

**Avis par mission**
- Structure note le pro après chaque mission (1-5 étoiles + commentaire)
- Un avis par mission (pas par couple structure-pro)
- Visible sur le profil public + section "Avis reçus" dans les settings pro

**Profil professionnel enrichi**
- Expériences professionnelles (CRUD)
- Certifications / Diplômes (CRUD)
- Compétences depuis tags gérés par l'admin
- Stats de vues du profil
- Section recommandations (placeholder V2)

**Backoffice admin**
- Dashboard avec KPIs : pros, structures, missions, rapports, croissance, premium, régions
- Gestion des professionnels : liste, détail, edit, delete, stats (vues, missions, avis)
- Gestion des structures : liste, détail
- Gestion des missions : liste avec filtres avancés, détail
- Gestion des utilisateurs : liste avec filtres par rôle, détail
- Tags/compétences : CRUD admin, utilisés dans onboarding + settings pro
- Invitation de pros : formulaire individuel + import CSV en masse
- Système de relance automatique : J+3, J+7, J+14, J+30

**Emails**
- Mission reçue → pro
- Mission acceptée/refusée → structure
- Mission expirée/terminée → les deux
- Rapport envoyé → structure
- Invitation pro → email avec lien "Créer mon mot de passe"
- Relances automatiques (J+3/7/14/30)

**Multi-compte structure (préparé)**
- Table `structure_account_members` avec rôles (owner, admin, member)
- Owner créé automatiquement à l'onboarding
- UI pas encore implémentée (V2)

---

## Ce qui est désactivé / à configurer

### Paywall Stripe (DÉSACTIVÉ)
Dans `proxy.ts`, lignes 101 et 333 : `const skipSubscription = true;`
→ À remettre à `false` ou conditionnel sur `NODE_ENV` quand Stripe est configuré.

### Variables d'environnement à configurer dans Vercel

**Supabase :**
- `NEXT_PUBLIC_SUPABASE_URL` — URL du projet Supabase prod
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — Clé publique
- `SUPABASE_SERVICE_ROLE_KEY` — Clé service role (pour les opérations admin)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Clé anon (peut être la même que publishable)

**Auth :**
- `NEXTAUTH_SECRET` — Secret pour NextAuth (générer avec `openssl rand -base64 32`)
- `NEXTAUTH_URL` — URL de l'app en prod (ex: https://app.prokid.com)

**Stripe :**
- `STRIPE_SECRET_KEY` — Clé secrète Stripe
- `STRIPE_WEBHOOK_SECRET` — Secret du webhook Stripe
- `STRIPE_PRICE_ID` — ID du prix de l'abonnement

**Email (Resend) :**
- `RESEND_API_KEY` — Clé API Resend
- `NOREPLY_EMAIL` — Adresse expéditeur (ex: noreply@prokid.com)

**App :**
- `APP_URL` ou `NEXT_PUBLIC_APP_URL` — URL de l'app (ex: https://app.prokid.com)

### Supabase Production
1. Appliquer toutes les migrations (`supabase db push`)
2. Configurer les Edge Functions (`supabase functions deploy`)
3. Configurer les variables d'environnement des Edge Functions
4. Vérifier les RLS policies
5. Configurer le domaine email dans Resend (SPF/DKIM)

### Stripe
1. Créer le produit + prix dans le dashboard Stripe
2. Configurer le webhook endpoint : `https://[domain]/api/stripe/webhook`
3. Événements à écouter : `checkout.session.completed`, `customer.subscription.*`

---

## Seeds / Données de test

Les seeds créent des données de test (15 seeds SQL). En production :
- **NE PAS exécuter les seeds** — les tables seront vides au lancement
- Le premier compte admin doit être créé manuellement ou via les seeds puis nettoyé
- Les tags compétences sont seedés (18 tags par défaut) — **à garder**

---

## Migrations à appliquer (dans l'ordre)

22 migrations au total. Toutes doivent être appliquées sur la DB prod via `supabase db push` ou manuellement.

Migrations critiques récentes :
- `20260325_create_profile_views.sql` — Stats vues profil
- `20260328120000_create_professional_experiences_and_certifications.sql` — Expériences + diplômes
- `20260328130000_add_last_message_sender_to_conversations.sql` — Badge "en attente"
- `20260328140000_one_conversation_per_mission.sql` — Architecture 1 conv = 1 mission
- `20260328150000_add_report_id_to_messages.sql` — Rapports dans le chat
- `20260328160000_add_mission_id_to_ratings.sql` — Avis par mission
- `20260328170000_create_structure_account_members.sql` — Multi-compte structure
- `20260329100000_create_skill_tags.sql` — Tags compétences
- `20260329110000_add_invitation_fields_to_profiles.sql` — Invitations
- `20260329120000_create_invitation_reminders.sql` — Relances auto
- `20260329130000_schedule_invitation_reminders_cron.sql` — Cron relances

---

## Edge Functions à déployer

| Fonction | Rôle | Env vars nécessaires |
|----------|------|---------------------|
| `missions` | CRUD missions | SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY, NOREPLY_EMAIL |
| `send-notification-email` | Envoi emails notifications | RESEND_API_KEY, NOREPLY_EMAIL, APP_URL |
| `invite-professional` | Pré-inscription pro | RESEND_API_KEY, NOREPLY_EMAIL, APP_URL |
| `process-invitation-reminders` | Relances auto | RESEND_API_KEY, NOREPLY_EMAIL, APP_URL |
| `process-reminders` | Rappels RDV | RESEND_API_KEY, NOREPLY_EMAIL |
| `reports` | Envoi rapports | RESEND_API_KEY, NOREPLY_EMAIL |
| `subscriptions` | Gestion Stripe | STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET |
| `extract-rrule-dates` | Parsing RRULE | - |
| `mission-durations` | Calcul durées | - |

---

## Prochaines étapes (V2)

1. **Re-activer le paywall Stripe** (quand les clés Stripe sont configurées)
2. **UI multi-compte structure** (la table est prête, il faut l'UI d'invitation de membres)
3. **Recommandations externes** (partager un lien pour que d'anciens employeurs laissent un avis)
4. **Filtre par compétence dans l'annuaire** (les tags sont prêts, le filtre search à ajouter)
5. **Abonnement structure** (Stripe pour les structures aussi)
6. **Notifications push mobile**
7. **Dark mode** (configuré mais theme switcher commenté)
