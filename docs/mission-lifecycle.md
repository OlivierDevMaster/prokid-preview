# Cycle de vie des missions

## Statuts possibles

| Statut | Description | Qui le déclenche |
|--------|-------------|------------------|
| `pending` | Mission proposée, en attente de réponse du pro | Automatique à la création |
| `accepted` | Le pro a accepté la mission | Action du pro dans le chat |
| `declined` | Le pro a refusé la mission | Action du pro dans le chat |
| `cancelled` | La structure a annulé la mission | Action de la structure |
| `expired` | La date de début est passée sans réponse du pro | Cron job automatique (toutes les heures) |
| `ended` | La date de fin est passée (mission terminée) | Cron job automatique (toutes les heures) |

## Transitions autorisées

```
pending → accepted     (pro accepte)
pending → declined     (pro refuse)
pending → cancelled    (structure annule)
pending → expired      (automatique si mission_dtstart < maintenant)

accepted → cancelled   (structure annule)
accepted → ended       (automatique si mission_until < maintenant)

declined → rien        (statut final)
cancelled → rien       (statut final)
expired → rien         (statut final)
ended → rien           (statut final)
```

Un trigger DB (`prevent_mission_status_rollback`) empêche tout retour en arrière.

## Cron jobs automatiques

Deux fonctions PostgreSQL tournent toutes les heures (`0 * * * *`) via `pg_cron` :

### 1. `expire_pending_missions()`
- Cherche les missions `status = 'pending'` dont `mission_dtstart < NOW()`
- Les passe en `expired`
- Crée des notifications pour le pro ET la structure

### 2. `end_accepted_missions()`
- Cherche les missions `status = 'accepted'` dont `mission_until < NOW()`
- Les passe en `ended`
- Crée des notifications pour le pro ET la structure
- Déclenche le bandeau "Donnez votre avis" dans le chat

## Flow complet

```
Structure propose une mission
  ↓
[status: pending] + email envoyé au pro + notification in-app
  ↓
Le pro a jusqu'à la date de début pour répondre
  ↓
├── Pro accepte → [status: accepted]
│     → Notification à la structure
│     → Mission en cours
│     → Le pro peut rédiger des rapports dans le chat
│     → Quand mission_until passe → [status: ended] (automatique)
│       → Bandeau "Donnez votre avis" dans le chat
│       → Notifications aux deux parties
│
├── Pro refuse → [status: declined]
│     → Notification à la structure
│     → Conversation archivée
│
├── Structure annule → [status: cancelled]
│     → Notification au pro
│
└── Pas de réponse → [status: expired] (automatique)
      → Notifications aux deux parties
```

## Données techniques

### Table `missions`
- `id` (UUID)
- `title` (TEXT)
- `description` (TEXT)
- `mission_dtstart` (TIMESTAMPTZ) — date/heure de début
- `mission_until` (TIMESTAMPTZ) — date/heure de fin
- `modality` (ENUM: remote, on_site, hybrid)
- `address` (TEXT, nullable)
- `status` (ENUM: pending, accepted, declined, cancelled, expired, ended)
- `structure_id` (UUID → structures)
- `professional_id` (UUID → professionals)

### Table `mission_schedules`
- Stocke les créneaux horaires par jour
- `rrule` (TEXT) — règle de récurrence iCalendar
- `duration_mn` (INTEGER) — durée en minutes
- Liée à `mission_id`

### Table `conversations`
- 1 conversation = 1 mission (unique index sur `mission_id`)
- Créée automatiquement par le backend lors de la création de mission
- Contient tous les messages, rapports, et actions liés à cette mission

## Fichiers clés

| Fichier | Rôle |
|---------|------|
| `supabase/migrations/20251209025545_create_missions.sql` | Table, triggers, cron jobs |
| `supabase/functions/missions/handlers/createMissionsHandler.ts` | Création de mission + conversation + email |
| `supabase/functions/missions/handlers/acceptMissionHandler.ts` | Acceptation + message système |
| `supabase/functions/missions/handlers/declineMissionHandler.ts` | Refus + message système |
| `supabase/functions/missions/handlers/cancelMissionHandler.ts` | Annulation |
| `features/structure/missions/components/MissionPropositionForm.tsx` | Formulaire de proposition |
| `features/chat/components/MissionCard.tsx` | Affichage mission dans le chat |
| `features/chat/components/ChatPanel.tsx` | Actions accept/decline/avis dans le chat |
