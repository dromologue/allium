# The capability model — format

`capability-model.json` is the enterprise view: one **generated** document per workspace, validated by [`schema/capability-model.schema.json`](../schema/capability-model.schema.json). It is produced by [`bin/place.mjs`](../bin/place.mjs) from the placed `.allium` specs and the skill manifests, and checked by [`bin/check.mjs`](../bin/check.mjs). Do not hand-edit it — change the specs and regenerate.

## Where the truth lives

The single source of truth is the specs and the skill manifests, not this file:

- **Placement** is two header comments at the top of each `.allium` file — `-- Capability:` and `-- Context:`. Allium files are comment-friendly (`--`), so this is a native, zero-risk convention, alongside the existing `-- Scope:` / `-- Includes:` headers.
- **Components** are the internal entities in each spec, read via `allium model`.
- **Interfaces** are projected from the `surface` declarations and their `fulfils` / `demands` contracts — Allium's own boundary constructs, not a new schema language.
- **Skills** are declared by their `manifest.json` (see [`schema/skill-manifest.schema.json`](../schema/skill-manifest.schema.json)), which names the capability, context and component each skill acts on.

`capability-model.json` is the aggregate of all of that. Because it is generated, it cannot drift silently: `check.mjs` regenerates it and fails if the committed copy is stale (the same discipline as Allium's `check-generated`).

## Structure

```
capabilities[]            one per enterprise capability
  name
  contexts[]              the skill contexts (bounded contexts) realising it
    name
    specs[]               the .allium files this context owns
    components[]          internal entities owned by the context
    surfaces[]            { name, fulfils[], demands[] } — boundary contracts
    skills[]              { name, identity, acts_on } — affordances built here
interfaces[]              cross-context contracts, projected from surfaces
  contract
  fulfilled_by[]          contexts whose surfaces fulfil it
  demanded_by[]           contexts whose surfaces demand it
```

See [`examples/mortgage-origination/capability-model.json`](../examples/mortgage-origination/capability-model.json) for a generated instance and [`capability-map.mmd`](../examples/mortgage-origination/capability-map.mmd) for its mermaid diagram.

## Operating rules

- **Workspace-scoped.** One `capability-model.json` per workspace — a repository or specs directory. This is the unit Allium modules already live in. It is generated, committed, and checked in CI for that workspace.
- **Enrich by adding specs, then regenerate.** Placing a new spec is adding two header lines; the model grows when you regenerate. Nothing is re-derived by hand.
- **The checker is the guardrail.** `check.mjs` fails on an unplaced spec, a component owned by two contexts, an interface demanded but unfulfilled, a structural error in any spec, or a stale model. Wire it as a pre-commit hook and a CI step (see [`ci/placement.yml`](../ci/placement.yml)).

## Federation across workspaces — future work

A single enterprise spans many repositories. Federating the per-workspace models into one organisation-wide view — and reconciling concurrent enrichment across teams — is deliberately out of scope here. It is an operating-model decision (a registry, a service, or a merge step over the per-workspace JSON), not a property of the format. This directory establishes the per-workspace artifact, its schema, its generator and its checker; federation builds on top of them.
