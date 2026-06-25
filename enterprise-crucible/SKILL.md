---
name: crucible
description: "Build and assemble user-facing skills on Allium components, and place those components in an enterprise capability map. Use when the user wants to turn a behavioural spec into something a person can do, build a skill on a component, assemble skills into a composite, situate a spec within an enterprise capability or bounded context, run the Scope-Scaffold-Specify-Ship loop, or 'crucible this'."
version: 1
auto_trigger:
  keywords: ["crucible", "build a skill", "assemble skills", "composite skill", "skill context", "enterprise capability", "capability model", "place this spec"]
---

# Crucible

Crucible is the enterprise layer on top of Allium. Allium models what a system does — components: entities with their rules, invariants, contracts and surfaces. Crucible does two things with those components: it **places** them in an enterprise capability map, and it **builds and assembles** the user-facing skills that let people act on them, through the Scope-Scaffold-Specify-Ship (SSSS) loop.

Read [README.md](./README.md) once for the ontology and vocabulary. The three words that must stay apart: a **component** is an Allium element; an **Allium operation** is `elicit`/`distill`/`propagate`/`tend`/`weed`; a **skill** is a user-facing affordance on a component, which is what this skill builds.

## When to use this skill

Use Crucible when the construct is a skill: a codified, evaluated affordance for one bounded task on a component. Do not use it for open-ended capabilities — those are composite skills, assembled from bounded skills. Decompose to the bounded task first, then run the loop on each, then assemble.

The bounded task test: a clear name, clear inputs, clear outputs, and a clear notion of good output. "Produce a policy assessment for this application" passes. "Help with applications" does not — that is a composite.

## Place before you build

Before building a skill, place the component it acts on: add `-- Capability:` and `-- Context:` headers to its `.allium` file. `bin/place.mjs` generates `capability-model.json` from those headers, the entities, the `surface`/`contract` graph and the skill manifests; `bin/check.mjs` fails the build if a spec is unplaced, a component is double-owned, an interface is unfulfilled, or the model has drifted. If the spec was just elicited, `elicit` will already have prompted for placement. See [references/placement.md](./references/placement.md). Placement is worthwhile on its own, even when no skill follows: it is how a workspace maps its Allium models.

## The loop

Run the four stages in order; work the whole loop each pass, not one stage at a time. The loop is scale-free — the same four moves build an atomic skill on a component and assemble a composite from sub-skills.

| Stage | What it produces | Allium operations it uses |
|-------|------------------|---------------------------|
| **1. Scope** | The bounded task in one sentence; its place in the capability model; who relies on it; the cost of not having it; what is out of scope; five to ten golden examples vouched for by the domain expert. | — |
| **2. Scaffold** | The behavioural model, elicited as a conversation and written as an Allium spec — the scaffold the specification expands. Stand up the skill context's Identity, Information and Interaction; type the Interaction against the capability model; stub the eval bench. | `elicit` (or `distill` if code exists) to build the `.allium` model; structural checks until it is free of contradictions and dead ends |
| **3. Specify** | The manifest, driven from the model: purpose, inputs and outputs (conformed to the capability model's interfaces where they cross a context boundary), behaviour rules, constraints from the invariants, golden examples. The eval suite, generated from the model and vouched for by the SME, written before the implementation. The implementation, built to pass it. | `propagate` to generate the tests/scenarios from the model |
| **4. Ship** | The cost profile (baseline and optimised token cost, with a regression discipline); the governance gate (guardrails, observability, sign-off); the verdict reality returns; the capability model and capability model's interfaces, enriched. | `weed` to reconcile spec and implementation; `tend` when requirements change, then re-`propagate` |

The governing rule is blunt: **the build is the test.** A skill ships with all five artefacts — manifest, eval suite, cost profile, guardrails, observability hooks — a green eval suite including the cases designed to break it, a known cost per call, and the domain expert's confirmation that the output is right. A capability with only some of these is a pilot, not a skill, and it will not compound.

## Scaffold is a guided elicitation

Scaffold is a conversation, not a form. Lead the builder through a question bank organised by the anatomy, and record the answers as an Allium model.

- **Identity** — the trigger that starts the work and what "done" looks like (the terminal states).
- **Information** — the domain objects the skill reasons over, each an `entity`; their fields and types, what is retrieved rather than received, and from where.
- **Interaction** — the tools and skills the skill reaches, each with its own Identity, and for each what it requires and ensures.
- **Behaviour** — for each trigger, the `requires` and `ensures`; and the `invariant`s that must always or never hold.
- **Adversarial probes** — the worst plausible input, and where two rules could contradict.

This is the Allium `elicit` operation, framed by the anatomy. The model it produces is the scaffold Specify expands. The full question bank is in [references/assembly.md](./references/assembly.md).

## Assembling composites

A composite skill is a skill whose Interaction reaches other skills. Build it with the same loop: Scope the composite task, Scaffold its model (its sub-skills are the components its Interaction reaches), Specify the orchestration and its evals, Ship it. Because the anatomy is fractal, no separate orchestration language is needed — a composite is a node, its sub-skills are nodes, all the way down. See [references/assembly.md](./references/assembly.md#composites).

## Ship closes the loop twice

The verdict re-enters as the Scope of the next pass, and the shipped skill becomes the scaffold the next build composes on. The capability model and capability model's interfaces it enriched are left richer for every other build — the library effect at enterprise scale. Disconfirmation beats any amount of upstream conviction; it is the one point in the loop where the team learns something it could not have argued its way to.
