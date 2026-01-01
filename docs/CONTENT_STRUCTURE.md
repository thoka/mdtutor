# Content Structure and Ecosystem Layering

This document specifies the revised content structure for the MDTutor platform, moving from a provider-centric to an ecosystem-centric approach with prioritized layers.

## Directory Hierarchy

The `content/` directory is organized into **Ecosystems**, which are further divided into **Layers**.

```text
content/
  <Ecosystem>/               # e.g., RPL, MATNET
    ecosystem.yaml           # Ecosystem configuration (parser, semantic prefix)
    sources.yaml             # Central configuration for syncing content
    layers/
      <LayerID>/             # e.g., official, tag-makerspace
        projects/
          <ProjectSlug>/
        pathways/
          <PathwaySlug>.yaml
```

## Definitions

### Ecosystem
An ecosystem defines a shared vocabulary and technical standard.
- **Semantic Prefix**: Used for tags, achievements, and badges (e.g., `RPL:`).
- **Parser Type**: Defines how content within this ecosystem is processed.

### Layer
A layer represents a source of content within an ecosystem.
- **Priority**: A numeric value determining which layer's content is served if multiple layers contain the same project (higher value = higher priority).
- **Git Base**: The base URL for cloning repositories in this layer.

## Global Identifiers (GIDs)

Content elements are uniquely identified by GIDs embedded in the source files.
- **Format**: `<Ecosystem>:<Type>:<ID>` (e.g., `RPL:PROJ:SILLY-EYES`).
- **Usage**: The API server uses GIDs to map prioritized layers to a single coherent view.

## Syncing and Configuration

The `sources.yaml` file in each ecosystem root controls the synchronization process.

### Example `sources.yaml`
```yaml
layers:
  - id: tag-makerspace
    priority: 100
    git_base: "https://github.com/tag-makerspace"
  - id: official
    priority: 10
    git_base: "https://github.com/raspberrypilearning"
    api_base: "https://learning-admin.raspberrypi.org/api/v1"

sync:
  pathways:
    - slug: scratch-intro
      source: official
```

## Implementation Details

1.  **Fetching**: The sync tool (`tools/fetch-pathways.js`) reads `sources.yaml` and places downloaded content into the appropriate layer directory.
2.  **Resolving**: The API server scans all layers within an ecosystem and builds a prioritized index of available projects and pathways.

