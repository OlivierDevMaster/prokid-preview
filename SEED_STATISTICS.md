# Seed Data Statistics

This document provides an overview of the data created by the seed files.

## Users

- **Total Users**: 31
  - **Admin Users**: 1
  - **Professional Users**: 20
  - **Structure Users**: 10

## Profiles

- **Total Profiles**: 31
  - **Admin Profiles**: 1 (manually created)
  - **Professional Profiles**: 20 (auto-created by trigger)
  - **Structure Profiles**: 10 (auto-created by trigger)

## Professionals

- **Total Professionals**: 20

## Structures

- **Total Structures**: 10

## Subscriptions

- **Total Subscriptions**: 20
  - One subscription per professional
  - 5 subscriptions with `trialing` status
  - 15 subscriptions with `active` status

## Availabilities

- **Total Availabilities**: 52
  - Created for 11 professionals (out of 20)
  - Mix of recurring and one-time availabilities

## Structure Invitations

- **Total Invitations**: 140
  - Each structure invites 14 professionals
  - 10 structures × 14 professionals = 140 invitations
  - Status breakdown:
    - Accepted: Variable (each professional accepts 3-5 invitations)
    - Declined: Variable (each professional declines 2-3 invitations)
    - Pending: Remaining invitations

## Structure Memberships

- **Total Memberships**: Variable
  - Created automatically via trigger when invitations are accepted
  - Each professional has 3-5 active memberships

## Missions

- **Total Missions**: 152
  - Created for 14 professionals across multiple structures
  - Various statuses: `pending`, `accepted`, `declined`, `cancelled`

## Reports

- **Total Reports**: 22
  - Created by professionals for their missions
  - Status breakdown:
    - `sent`: Variable
    - `draft`: Variable

## Report Attachments

- **Total Attachments**: 21
  - Attached to various reports
  - Multiple file types: PDF, images, videos, documents

## Professional Ratings

- **Total Ratings**: 52
  - Created by structures for their professional members
  - Ratings range from 1 to 5 stars
  - Automatically syncs to `professionals.rating` and `professionals.reviews_count` via trigger

## Newsletter Subscriptions

- **Total Newsletter Subscriptions**: 5

## Test Data

- **Test Availability Mission**: 1
  - Created for testing purposes (Professional: John Doe, Structure: Structure 1)

---

*Note: Some counts may vary based on trigger behavior and data dependencies between seed files.*

