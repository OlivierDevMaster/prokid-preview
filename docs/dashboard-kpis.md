# Dashboard KPIs Implementation Plan

This document tracks the KPIs to be added to each user type's dashboard, organized by priority.

## Professional Dashboard

### Current KPIs
- [x] Total Structures
- [x] Total Missions
- [x] Total Reports

### Additional KPIs

#### High Priority
- [x] Pending Missions (awaiting response)
- [x] Accepted Missions (active)
- [x] Upcoming Missions (next 7/30 days)
- [x] Draft Reports (in progress)
- [x] Sent Reports (submitted)

#### Medium Priority
- [x] Completed Missions (ended)
- [x] Active Availabilities Count (number of availability patterns that are currently valid - not expired. An availability is active if `until` is NULL or in the future)
- [x] Response Rate (% accepted vs declined missions)
- [x] Pending Invitations Count

#### Low Priority
- [ ] Average Mission Duration
- [ ] Mission Completion Rate

---

## Structure Dashboard

### Current KPIs
- [x] Total Professionals
- [x] Total Missions
- [x] Total Invitations (currently hardcoded to 0)

### Additional KPIs

#### High Priority
- [x] Active Members (current professionals)
- [x] Pending Invitations (awaiting response)
- [x] Pending Missions (awaiting professional response)
- [x] Active Missions (accepted and ongoing)
- [x] Received Reports (sent reports from professionals)

#### Medium Priority
- [x] Accepted Invitations (recently joined)
- [x] Completed Missions (ended)
- [x] Mission Acceptance Rate (% accepted vs declined)
- [x] Upcoming Missions (next 7/30 days)

#### Low Priority
- [ ] Average Response Time (time to accept/decline missions)
- [ ] Expired Missions (not responded to in time)

---

## Admin Dashboard

### Current KPIs
- [x] Total Professionals
- [x] Total Structures
- [x] Total Missions

### Additional KPIs

#### High Priority
- [x] Active Professionals (with at least one structure membership)
- [x] Active Structures (with at least one professional member)
- [x] Pending Invitations (system-wide)
- [x] Active Missions (accepted)
- [x] Pending Missions (awaiting response)

#### Medium Priority
- [x] Total Invitations (all-time)
- [x] Completed Missions (ended)
- [x] Total Reports (all-time)
- [x] System Growth Rate (new users this month)
- [x] Mission Completion Rate (% completed vs total)

#### Low Priority
- [x] Average Missions per Structure
- [x] Average Professionals per Structure
- [x] Most Active Structures (by mission count)
- [x] Most Active Professionals (by mission count)

---

## Notes

- Priority levels are based on immediate business value and user needs
- High Priority: Critical metrics that directly impact daily operations
- Medium Priority: Important metrics for better insights and decision-making
- Low Priority: Nice-to-have metrics for advanced analytics

## Implementation Status

- **Last Updated:** 2025-01-XX
- **Total KPIs to Implement:** XX
- **Completed:** 3 (current KPIs)
- **Remaining:** XX

