# Placement (Part A)

Locating every Allium component in an enterprise view, and keeping one language across it. Placement is useful on its own: it maps a workspace's Allium models whether or not a single skill is built.

## Why structure is shared, not per-spec

A spec written in isolation can be internally perfect and still fail to compose, because the term it calls `applicant` is what the next context calls `borrower`, and the date it treats as the decision date is the one the upstream context treats as the submission date. Domain-driven design (Evans) is the discipline: a **bounded context** is a boundary within which one model and one **ubiquitous language** hold; integration happens at the **seams**, and those seams need explicit interfaces stated in the shared language of the contexts they join.

Allium already gives the materials for this at the behavioural level — `surface` declares a boundary, `exposes`/`provides` say what it offers, and `contract` (`demands`/`fulfils`) declares what a module needs and supplies. Placement does not replace these; it reads them into an enterprise view and checks one consistency guarantee across the whole.

## Placement lives in the spec header

The single source of truth is two comment headers at the top of each `.allium` file, alongside the existing `-- Scope:` convention:

```
-- allium: 3
-- underwriting.allium
-- Capability: Mortgage Origination
-- Context: Underwriting
```

Because Allium files are comment-friendly (`--`), this adds nothing to the language and cannot conflict with it. A spec is *placed* the moment it carries these two lines. There is no separate registry to keep in sync — the placement is in the file that defines the components.

## The capability model is generated, not authored

[`bin/place.mjs`](../bin/place.mjs) reads the headers, the internal entities (via `allium model`), the `surface`/`contract` declarations, and the skill manifests, and emits one `capability-model.json` per workspace — the enterprise view — plus a `capability-map.mmd` diagram. Its structure and a generated instance are in [capability-model.md](./capability-model.md) and [`examples/mortgage-origination/`](../examples/mortgage-origination/).

The model carries the interfaces too: every `surface` that `fulfils` or `demands` a `contract` becomes an edge in the model's `interfaces` array — `fulfilled_by` one context, `demanded_by` another. The contract is Allium's own; the model only projects who provides and who consumes it. That projection is the cross-context semantic contract, and because it is derived from the specs it cannot contradict them.

```json
{
  "contract": "AssessmentResult",
  "fulfilled_by": ["Underwriting"],
  "demanded_by": ["Application Intake"]
}
```

## The checker holds it honest

[`bin/check.mjs`](../bin/check.mjs) is the guardrail — the enterprise-map analogue of `allium check`. It fails (non-zero exit) when a spec lacks placement headers, a component is owned by two contexts, a contract is demanded but fulfilled by nobody, a spec has a structural error, or `capability-model.json` has drifted from the specs. Wire it as a pre-commit hook ([`hooks/pre-commit`](../hooks/pre-commit)) and a CI step ([`ci/placement.yml`](../ci/placement.yml)), exactly as Allium checks its own generated output.

## How placement runs

- **At elicitation.** `elicit`'s Phase 1 (Scope definition) asks where the spec sits — the capability and the skill context — so the headers are written as the spec is born.
- **As a standalone pass.** Existing specs can be placed without building anything: add the two headers, run `place.mjs`, commit the model. This is the enterprise-mapping use, valuable with zero skills.
- **On ship.** A skill's `manifest.json` names its capability, context and component; regenerating folds it into the model, and the checker confirms it points at a real context.

Workspace-scoped today; federating per-workspace models into one enterprise view is future work (see [capability-model.md](./capability-model.md#federation-across-workspaces--future-work)).
