# Worked example: mortgage origination

A runnable example lives in [`examples/mortgage-origination/`](../examples/mortgage-origination/). Every `.allium` file there validates with `allium check` (0 errors), and `npm test` runs the placement checker against it. This walks through what is in it.

## 1. Placed specs

Two specs, each carrying its placement headers:

- [`underwriting.allium`](../examples/mortgage-origination/underwriting.allium) — `-- Capability: Mortgage Origination`, `-- Context: Underwriting`. Defines the components `PolicySet`, `Application`, `Assessment`, `Finding`; the `CheckAgainstPolicy` rule; the invariants `NoLendingDecision` and `EveryFindingCited`; and the `AssessmentSurface`, which `fulfils` the `AssessmentResult` contract.
- [`application-intake.allium`](../examples/mortgage-origination/application-intake.allium) — `-- Context: Application Intake`. Defines `Submission`, and an `IntakeStatus` surface that `demands underwriting/AssessmentResult` — the cross-context dependency.

That `fulfils` in one context and `demands` in the other is the entire basis of the interface edge; placement does not invent it, it reads it.

## 2. A built skill

[`skills/lending-policy-check/`](../examples/mortgage-origination/skills/lending-policy-check/) is a skill on the `Application` component, carrying its five artefacts:

- `manifest.json` — the contract: identity, capability, context, the component and surface it `acts_on`, the behaviour rule (`CheckAgainstPolicy`) and constraints (MUST `EveryFindingCited`, MUST NOT `NoLendingDecision`). Validated by [`schema/skill-manifest.schema.json`](../schema/skill-manifest.schema.json).
- `skill.md` — the readable description.
- `evals.feature` — the eval suite as Gherkin, generated from the rule and extended with the escalation and missing-policy cases.
- `cost-profile.json` — baseline and optimised cost, a regression budget, and the telemetry to emit.

The two invariants are the manifest's MUST NOT and MUST; the skill never makes the lending decision.

## 3. The generated enterprise view

Running `node bin/place.mjs examples/mortgage-origination` produces [`capability-model.json`](../examples/mortgage-origination/capability-model.json) and [`capability-map.mmd`](../examples/mortgage-origination/capability-map.mmd). The model places both contexts under `Mortgage Origination`, lists each context's components and skills, and records the interface:

```json
{
  "contract": "AssessmentResult",
  "fulfilled_by": ["Underwriting"],
  "demanded_by": ["Application Intake"]
}
```

The diagram renders the same thing — two contexts in one capability, with the edge `Application Intake --AssessmentResult--> Underwriting`.

## 4. The check

`node bin/check.mjs examples/mortgage-origination` passes. Remove the `-- Context:` header from `underwriting.allium` and it fails with four cascading errors — the spec is unplaced, the skill now points at a context with no spec, the demanded `AssessmentResult` is fulfilled by nobody, and the committed model is stale. That is the guardrail doing its job: the enterprise view cannot quietly fall out of step with the specs.
