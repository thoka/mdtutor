# Content Structure and Ecosystem Layering 🔹BtOTX

This document specifies the revised content structure for the MDTutor platform, moving from a provider-centric to an ecosystem-centric approach with prioritized layers.

## Directory Hierarchy

The `content/` directory is organized into **Ecosystems**, which are further divided into **Layers**.

```text
content/
  <Ecosystem>/               # e.g., RPL, MATNET
    ecosystem.yaml           # Ecosystem definition (prefix, parser)
    config/                  # Makerspace-specific visibility & sync rules
      sync.yaml              # Subscribed pathways and their sources
    layers/
      <LayerID>/             # e.g., official, tag
        projects/
          <ProjectSlug>/
        pathways/
          <PathwaySlug>.yaml # Multi-language semantic data
```

## Global Identifiers (GIDs)

GIDs are the primary way to identify content semantically. They are decoupled from local file paths or specific API numeric IDs to support forks and layering.

- **Format**: `<ECOSYSTEM>:<TYPE>:<SLUG>`
  - `ECOSYSTEM`: The scope (e.g., `RPL`).
  - `TYPE`: The object type (`PROJ`, `PATH`, `STEP`, `ASSET`).
  - `SLUG`: Human-readable identifier.
- **Example**: `RPL:PROJ:space-talk`
- **Identity in Forks**: When a project is forked into a higher-priority layer, the GID remains unchanged. The API server resolves the GID to the instance in the highest priority layer.
- **Persistence**: User progress and achievements are linked to the GID, ensuring a seamless transition when content is updated or moved between layers.

## Multi-language Support and Semantic Keys

Pathway data uses a dictionary-based structure for translations and semantic section mapping.

### Example `pathway.yaml`
```yaml
title:
  en: "Introduction to Scratch"
  de-DE: "Einführung in Scratch"
description:
  summary:
    en: "Learn to code..."
    de-DE: "Lerne zu programmieren..."
  overview:
    en: "What will I make? (Markdown)"
    de-DE: "Was werde ich erschaffen? (Markdown)"
  know:
    en: "What must I know?"
    de-DE: "Was muss ich wissen?"
```

The API server automatically converts these Markdown fields back to HTML for the frontend while maintaining the localized structure.

The configuration in `<Ecosystem>/config/` defines the "view" of the Makerspace.

### `sync.yaml`
Determines which pathways are downloaded and which layer they belong to. Layers are defined as a dictionary for uniqueness.

```yaml
layers:
  tag:
    priority: 100
    git_base: "https://github.com/tag-makerspace"
  official:
    priority: 10
    git_base: "https://github.com/raspberrypilearning"
    api_base: "https://learning-admin.raspberrypi.org/api/v1"

sync:
  pathways:
    official:
      - scratch-intro
      - physical-computing-with-scratch-and-the-raspberry-pi
```

## Implementation Details

1.  **Fetching**: The sync tool (`tools/fetch-pathways.js`) reads `sync.yaml` and places downloaded content into the appropriate layer directory, transforming local IDs into GIDs.
2.  **Resolving**: The API server scans all layers within an ecosystem and builds a prioritized index based on GIDs.
