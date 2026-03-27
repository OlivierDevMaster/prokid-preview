# Système d'emails et notifications

## Architecture

```
Action utilisateur / Cron job
  ↓
Changement en DB (INSERT/UPDATE sur missions, notifications, etc.)
  ↓
Trigger PostgreSQL crée une notification dans la table `notifications`
  ↓
Trigger `notifications_broadcast_trigger` :
  1. Broadcast realtime vers le client (in-app)
  2. Appel HTTP vers l'Edge Function `send-notification-email` via pg_net
  ↓
Edge Function vérifie les préférences email du destinataire
  ↓
Si autorisé → Envoi via Resend API
```

## Emails envoyés

### Missions

| Événement | Destinataire | Objet email (FR) | Déclencheur |
|-----------|-------------|-------------------|-------------|
| Mission proposée | Pro | "Nouvelle mission de [Structure]" | Création de mission (backend handler) |
| Mission acceptée | Structure | "Mission acceptée par [Pro]" | Trigger DB sur status → accepted |
| Mission refusée | Structure | "Mission refusée par [Pro]" | Trigger DB sur status → declined |
| Mission annulée | Pro | "Mission annulée par [Structure]" | Trigger DB sur status → cancelled |
| Mission expirée | Pro + Structure | "Mission expirée" | Cron job automatique |
| Mission terminée | Pro + Structure | "Mission terminée" | Cron job automatique |

### Invitations

| Événement | Destinataire | Déclencheur |
|-----------|-------------|-------------|
| Invitation reçue | Pro | INSERT dans invitations |
| Invitation acceptée | Structure | UPDATE status → accepted |
| Invitation refusée | Structure | UPDATE status → declined |

### Rapports

| Événement | Destinataire | Déclencheur |
|-----------|-------------|-------------|
| Rapport envoyé | Structure | UPDATE status draft → sent |

### Membres

| Événement | Destinataire | Déclencheur |
|-----------|-------------|-------------|
| Membre parti | Structure | Pro quitte la structure |
| Membre retiré | Pro | Structure retire le pro |

## Préférences email

Chaque utilisateur peut désactiver les emails :

- **Table `professional_notification_preferences`** — colonne `email_notifications` (boolean, défaut: true)
- **Table `structure_notification_preferences`** — colonne `email_notifications` (boolean, défaut: true)

L'Edge Function vérifie cette préférence avant chaque envoi. Si désactivé, la notification in-app est toujours créée mais l'email n'est pas envoyé.

## Envoi direct (hors système de notifications)

Certains emails sont envoyés directement via Resend sans passer par le système de notifications :

### Email de mission reçue
- **Fichier :** `supabase/functions/missions/utils/sendMissionReceivedEmail.ts`
- Envoyé immédiatement lors de la création de mission
- Contient un lien direct vers la conversation dans le chat
- Vérifie les préférences email du pro

### Email de rapport
- **Fichier :** `supabase/functions/reports/handlers/sendReportHandler.ts`
- Envoyé quand le pro soumet un rapport (draft → sent)
- Inclut les pièces jointes du rapport en téléchargement

### Rappels de rendez-vous
- **Fichier :** `supabase/functions/process-reminders/handlers/processRemindersHandler.ts`
- Envoyé 24h avant un rendez-vous proposé
- Système de retry avec backoff exponentiel (1h, 2h, 4h, 8h, max 24h)

## Configuration requise

### Variables d'environnement

| Variable | Description | Exemple |
|----------|-------------|---------|
| `RESEND_API_KEY` | Clé API Resend | `re_xxxx` |
| `NOREPLY_EMAIL` | Adresse expéditeur | `noreply@prokid.com` |
| `APP_URL` | URL de l'application | `https://app.prokid.com` |
| `SUPABASE_URL` | URL Supabase | Auto-configuré |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé service role | Auto-configuré |

### Resend

- **Service :** [Resend](https://resend.com)
- **Domaine :** À configurer dans Resend (DNS records SPF/DKIM)
- **Templates :** HTML inline dans les Edge Functions
- **Langues :** Français (défaut) + Anglais

## Templates email

Les templates sont dans :
```
supabase/functions/_shared/services/templates/
├── renderNotificationEmailTemplate.ts    # Template générique pour toutes les notifications
├── renderReportEmailTemplate.ts          # Template pour l'envoi de rapports
└── renderAppointmentReminderEmailTemplate.ts  # Template pour les rappels RDV
```

Traductions :
```
supabase/functions/_shared/templates/emails/notification/
├── body.fr.ts    # Contenu français
└── body.en.ts    # Contenu anglais
```

## Fichiers clés

| Fichier | Rôle |
|---------|------|
| `supabase/migrations/20260107153557_add_email_notification_triggers.sql` | Trigger qui appelle l'Edge Function |
| `supabase/functions/send-notification-email/index.ts` | Point d'entrée Edge Function |
| `supabase/functions/send-notification-email/handlers/sendNotificationEmailHandler.ts` | Logique d'envoi + traductions |
| `supabase/functions/missions/utils/sendMissionReceivedEmail.ts` | Email direct mission reçue |
| `supabase/migrations/20260107153556_add_email_notification_preferences.sql` | Tables préférences |

## Pour modifier un email

1. **Changer le contenu :** Modifier les traductions dans `sendNotificationEmailHandler.ts` (objet `notificationTranslations`)
2. **Changer le template HTML :** Modifier `renderNotificationEmailTemplate.ts`
3. **Ajouter un nouveau type :** Ajouter une valeur à l'enum `notification_type`, créer le trigger DB, ajouter les traductions
4. **Tester en local :** Les emails sont capturés par Mailpit (http://localhost:54324) en développement local
