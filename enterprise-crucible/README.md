# Enterprise Crucible

**Build and assemble user-facing skills on Allium components, and hold an enterprise view of both the components and the skills.**

Allium specifies what software does at the behavioural level — entities, rules, invariants, contracts, surfaces — one spec at a time. Enterprise Crucible adds the layer *above* a spec and the layer of action *around* it. It gives a loop for **building and assembling** the skills that let people do something with components, and it maintains an **enterprise view** that locates every component *and* every skill within a shared capability map.

Enterprise Crucible is self-contained in this directory. It changes nothing about how Allium works and composes with the existing operations — `elicit`, `distill`, `propagate`, `tend`, `weed`. The only touch-points outside this directory are one line in `.claude-plugin/plugin.json` to register the skill, and one small routing hook in `skills/elicit/SKILL.md` so a discovery session can place its spec and hand off to skill-building.

## Why this exists

A behavioural model is precise but solitary. An Allium spec says what a system does; it does not say which enterprise capability it serves, which bounded context it belongs to, or how its components relate to those defined in other specs. As an organisation accumulates specs — and the skills built on them — it accumulates an unmapped pile, with every team re-deriving where things sit and what a term means.

And a behavioural model is not yet a thing a person can *do*. The affordances — "given this component, let a user produce, query, or act on it" — and their assembly into larger capabilities are unspecified.

Enterprise Crucible closes both gaps with a **map** and a **method**: an enterprise view of components and skills, and a loop for building and assembling those skills.

## The two things it provides

### An enterprise view of components and skills

The enterprise view locates every component *and* every skill in a shared **capability model**: which skill context it sits in, which capability that context realises. It holds one consistency guarantee across the map — a component or interface named in one context means the same thing when something in another context reaches it — built on Allium's own `contract` and `surface` constructs rather than a new schema language. The result is a single enterprise index over live Allium models and the skills built on them, valuable to anyone navigating or governing them, whether or not a given component yet carries a skill. See [references/placement.md](./references/placement.md).

### Building and assembling skills

Where a located component warrants a user affordance, Enterprise Crucible builds a **skill** to act on it, and assembles skills into **composite skills**, through the **Scope-Scaffold-Specify-Ship loop**. The loop reuses Allium's operations — `elicit` and `distill` to gather the model, `propagate` to generate the tests, `tend` and `weed` to keep spec and code in agreement — and adds only the enterprise framing around them. See [SKILL.md](./SKILL.md) and [references/assembly.md](./references/assembly.md).

## Tooling — generated and checked, not hand-maintained

The enterprise view is not a document anyone maintains by hand; it is generated from the specs and checked in CI, in keeping with how Allium treats its own artifacts.

- **Placement is two header comments** at the top of each `.allium` file, alongside the existing `-- Scope:` convention:
  ```
  -- allium: 3
  -- underwriting.allium
  -- Capability: Mortgage Origination
  -- Context: Underwriting
  ```
- **`bin/place.mjs`** reads those headers, the internal entities (via `allium model`), the `surface`/`contract` graph, and the skill manifests, and writes one `capability-model.json` per workspace plus a `capability-map.mmd` mermaid diagram. Single source of truth is the specs; the model is generated.
- **`bin/check.mjs`** is the guardrail — the enterprise-map analogue of `allium check`. It fails (non-zero exit) on an unplaced spec, a component owned by two contexts, an interface demanded but unfulfilled, a structural spec error, or a `capability-model.json` that has drifted from the specs. Wire it as a pre-commit hook ([`hooks/pre-commit`](./hooks/pre-commit)) and a CI step ([`ci/placement.yml`](./ci/placement.yml)).
- **Schemas** for the generated model and the skill manifest are in [`schema/`](./schema/); a runnable, validated example is in [`examples/mortgage-origination/`](./examples/mortgage-origination/) (`npm test` runs the checker against it).

## The ontology

| Term | What it is | Defined by |
|------|------------|------------|
| **Component** | An Allium element — an entity with its rules, invariants, contracts and surface. A thing that exists and behaves. | Allium |
| **Skill context** | A coherent group of components — a bounded context — that links a capability to its Allium elements. Has an Identity, Information and Interaction. | Enterprise Crucible |
| **Capability** | A set of skill contexts realising one enterprise capability. | Enterprise Crucible |
| **Skill** | An affordance: access one component and do something with it. Associated with a skill context. | Enterprise Crucible |
| **Composite skill** | Skills assembled into a larger whole. | Enterprise Crucible |

Two properties make the layers cohere. The anatomy is **fractal**: Identity (what it does), Information (the context it needs and where it gets it), and Interaction (the tools and skills it reaches) describe a skill context, a skill, and a composite alike — so composition reuses one shape rather than a separate orchestration vocabulary. And the loop is **scale-free**: it builds an atomic skill on a component and assembles a composite by the same four moves, because they share that anatomy. See [references/ontology.md](./references/ontology.md).

## Vocabulary (one word, three senses — keep them apart)

Allium already uses "skill" for its tool operations (`elicit`, `distill`, …). Enterprise Crucible introduces a different sense. Three distinct things, three words:

- **Component** — an Allium element, located in the enterprise view.
- **Allium operation** — `elicit`/`distill`/`propagate`/`tend`/`weed`, the tooling Allium ships as plugin skills.
- **Skill** — a user-facing affordance on a component, built and assembled by Enterprise Crucible.

Where this README says "skill" it means the third.

## How to use it

1. **Place.** When a spec is born — during `/elicit`, or afterwards — situate its components in the capability model: name the capability it realises and the skill context it belongs to. If it introduces a new capability or context, record it. (`elicit` now prompts for this; see the hook in `skills/elicit/SKILL.md`.)
2. **Build.** Where a component warrants an affordance, run the Enterprise Crucible skill — the Scope-Scaffold-Specify-Ship loop — to build a skill that lets a user act on it. Scaffold elicits the behaviour as an Allium model; `propagate` generates the eval scenarios; the loop ships a governed, evaluated skill, and records it in the enterprise view.
3. **Assemble.** Compose skills into composite skills with the same loop, treating each sub-skill as a node the composite's Interaction reaches.

## How it sits in Allium

- **Self-contained:** everything Enterprise Crucible adds lives in this directory.
- **Reuses, does not replace:** the loop calls the existing operations and the existing `.allium` language; the enterprise view builds on `contract` and `surface`.
- **Two minimal touch-points outside the directory:** register the skill by adding `"./enterprise-crucible"` to the `skills` array in `.claude-plugin/plugin.json`; and a short routing hook in `skills/elicit/SKILL.md` (Phase 1: Scope definition) so a discovery session situates its spec and can hand off to skill-building.

## Files

| Path | Purpose |
|------|---------|
| [README.md](./README.md) | This front door. |
| [SKILL.md](./SKILL.md) | The Enterprise Crucible skill: the loop that builds and assembles skills. |
| [bin/place.mjs](./bin/place.mjs) | Generator: placed specs + skill manifests → `capability-model.json` + `capability-map.mmd`. |
| [bin/check.mjs](./bin/check.mjs) | Checker: structural, ownership, interface and drift checks; non-zero exit on failure. |
| [schema/](./schema/) | JSON Schemas for the capability model and the skill manifest. |
| [ci/placement.yml](./ci/placement.yml), [hooks/pre-commit](./hooks/pre-commit) | CI workflow and pre-commit hook that run the checker. |
| [examples/mortgage-origination/](./examples/mortgage-origination/) | Validated `.allium` specs, a built skill, and the generated model + diagram. `npm test` checks it. |
| [references/ontology.md](./references/ontology.md) | The full ontology: capability, skill context, component, skill, composite; fractal anatomy; scale-free loop. |
| [references/placement.md](./references/placement.md) | The enterprise view: header-based placement, the generated capability model, the checker. |
| [references/assembly.md](./references/assembly.md) | The loop in depth, skills as affordances, composites. |
| [references/capability-model.md](./references/capability-model.md) | The generated `capability-model.json` format, field by field. |
| [references/worked-example.md](./references/worked-example.md) | The mortgage-origination example walked through. |
