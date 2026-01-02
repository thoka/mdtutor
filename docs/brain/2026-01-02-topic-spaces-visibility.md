# Specification: Topic Spaces & Visibility Logic (RPL Parity)

**Status:** 📝 Draft  
**Date:** 2026-01-02

## Overview

Introduce "Topic Spaces" (Themenräume) as a high-level categorization for learning content, following the taxonomy of the official Raspberry Pi Learning (RPL) platform. Visibility and access are controlled by user group membership and earned achievements.

## 1. Taxonomy & Data Structures

Based on the RPL API (`/api/v1/en/projects`), we will support the following taxonomy:

- **Technology** (`technologyLabels` / `primaryTechnology`): e.g., Scratch, Python, Raspberry Pi.
- **Interests** (`interestLabels`): e.g., Games, Nature, Space.
- **Hardware** (`hardwareLabels`): e.g., Sense HAT, Camera Module.
- **Difficulty** (`difficultyLevel`): 1 (Beginner) to 3 (Advanced).

### 1.1 Topic Hierarchy (`topics.yaml`)
Located in `content/<ECOSYSTEM>/config/topics.yaml`.
Key = ID (lowercase). Optional `-de` for German.
Icons are derived from the key (e.g., `programming.svg`).
Colors are configured per topic.

```yaml
topics:
  programming:
    -de: Programmieren
    type: technology
    color: "#4CAF50"
    subtopics:
      scratch: {}
      python: {}
  nature:
    -de: Natur
    type: interest
    color: "#FF9800"
```

### 1.2 Pathway/Project Tagging
Pathways and projects use these labels. We extend the RPL format with our visibility rules.

```yaml
# pathway.yaml
attributes:
  technologyTheme: Scratch
  difficultyLevel: 1
visibility:
  list:
    groups: [ students, mentors ]
    achievements: [ basic-mouse-control ]
  open:
    groups: [ students ]
    achievements: [ scratch-level-1 ]
```

## 2. API Architecture (Parity)

We will implement endpoints that mirror the RPL structure:

### `GET /api/v1/:lang/projects`
- **Query Params**: `filter[technology]=Scratch`, `filter[interest]=Nature`, `filter[difficulty]=1`
- **Behavior**: Returns projects filtered by taxonomy AND user visibility.

### `GET /api/v1/:lang/pathways`
- **Query Params**: `filter[technology]=Scratch`
- **Behavior**: Returns pathways filtered by taxonomy AND user visibility.

### `GET /api/v1/:lang/topics` (Custom)
- Returns our `topics.yaml` hierarchy to drive the "Topic Spaces" overview.

## 3. Visibility Logic

The `api-server` evaluates visibility by comparing the user's JWT (groups) and Achievement state (GIDs) against the requirements.
Achievements are prefixed automatically (e.g., `RPL:ACHIEV:`).

### 3.1 Logic Flow
1. **Lister**: If `visibility.list` requirements are met, the item appears in the UI.
2. **Opener**: If `visibility.open` requirements are met, the item is clickable. Otherwise, it shows as "locked".
3. **Default**: If a section is missing, it is considered "public".
