# Seed Data Statistics

This document provides an overview of the data created by the seed files.

## Users

- **Total Users**: 16
  - **Admin Users**: 1
  - **Professional Users**: 10
  - **Structure Users**: 5

## Profiles

- **Total Profiles**: 16
  - **Admin Profiles**: 1 (manually created)
  - **Professional Profiles**: 10 (auto-created by trigger)
  - **Structure Profiles**: 5 (auto-created by trigger)

## Professionals

- **Total Professionals**: 10

## Structures

- **Total Structures**: 5

## Subscriptions

- **Total Subscriptions**: 10
  - One subscription per professional
  - 5 subscriptions with `trialing` status
  - 5 subscriptions with `active` status

## Availabilities

- **Total Availabilities**: 15
  - Created for 5 professionals (out of 10)
  - 3 recurring availabilities per professional
  - Simplified patterns to avoid overlaps

## Structure Invitations

- **Total Invitations**: 10
  - Only professionals with availabilities (ae2-ae6) receive invitations
  - Each professional receives 1-2 invitations
  - All invitations are accepted

## Structure Memberships

- **Total Memberships**: 10
  - Created automatically via trigger when invitations are accepted
  - Each professional has 1-2 active memberships

## Missions

- **Total Missions**: ~20
  - Created for 5 professionals across 5 structures
  - Focus on `pending` status to avoid overlaps
  - Missions are distributed across week 0 and week 1

## Reports

- **Total Reports**: 5
  - One report per professional
  - Mix of `sent` and `draft` statuses

## Report Attachments

- **Total Attachments**: 4
  - Attached to various reports
  - Multiple file types: PDF, images, videos

## Professional Ratings

- **Total Ratings**: 8
  - Created by structures for their professional members
  - Ratings range from 4 to 5 stars
  - Automatically syncs to `professionals.rating` and `professionals.reviews_count` via trigger

## Newsletter Subscriptions

- **Total Newsletter Subscriptions**: 5

## Test Data

- **Test Availability Mission**: 1
  - Created for testing purposes (Professional: John Doe, Structure: Structure 1)

---

*Note: Seed data has been significantly reduced to avoid overlaps between availabilities and accepted missions. The data is now focused on 5 professionals with availabilities and simplified mission schedules.*
