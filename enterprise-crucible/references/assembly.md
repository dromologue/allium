# Build and assemble (Part B)

The SSSS loop in depth: building a skill on a component, and assembling skills into composites. The loop reuses Allium's operations and adds the enterprise framing around them.

## A skill is an affordance on a component

A component is Allium behaviour — it exists and behaves. A skill is what lets a person *act* on it: produce it, query it, change it, decide with it. One skill is one bounded task on one component, with a clear name, clear inputs and outputs, and a clear notion of good output. Anything broader is a composite, assembled from bounded skills.

A skill carries five artefacts through its life: the **manifest** (the contract), the **eval suite** (the SME's judgement made executable), the **cost profile** (token cost, latency, cost per call, with a regression discipline), **guardrails** (declared constraints and the runtime checks that enforce them), and **observability hooks** (telemetry fed back into the evals). A capability with only some of these is a pilot, not a skill.

Concretely, a skill is a directory of files (see [`examples/.../lending-policy-check/`](../examples/mortgage-origination/skills/lending-policy-check/)): `manifest.json` (the contract and guardrails, validated by [`schema/skill-manifest.schema.json`](../schema/skill-manifest.schema.json)), `skill.md` (the readable description), `evals.feature` (the eval suite, Gherkin generated from the model with `propagate`), and `cost-profile.json` (cost profile and observability). The manifest names the capability, context and component the skill acts on, so `bin/place.mjs` folds it into the enterprise view.

## The stages

### 1. Scope — bound the work from outside

Establish what is in and out before anything is built. Produce, with the domain expert: the bounded task in one sentence (the skill's Identity); its place in the capability model (the capability and skill context — see [placement.md](./placement.md)); who relies on the output and what they do with it; the cost of not having it (if the absence costs nothing measurable, stop — wrong skill); what is out of scope; and five to ten golden examples the expert has personally vouched for. The examples are the seed of everything downstream.

### 2. Scaffold — stand up the model by guided elicitation

This is Allium's `elicit` operation, framed by the anatomy. Lead the builder through the question bank below, a few questions at a time, in their domain language, and record the answers as an Allium model. The model is the scaffold Specify expands; Scaffold is not done until it is free of contradictions and dead ends.

**Identity**
- What event starts the work? (the rule's `when`)
- What does "done" look like — the terminal states?

**Information** (becomes `entity`s)
- What domain objects does the skill reason over? Their fields and types? Which optional, which enumerated?
- What context is retrieved rather than received, and from where?

**Interaction** (the tools and skills it reaches)
- What does the skill call or delegate to? Name each with its own Identity.
- For each, what does it `require` to be called, and `ensure` on return?
- Type each cross-context interface against the capability model.

**Behaviour** (becomes `rule`s and `invariant`s)
- For each trigger: what must hold before it fires (`requires`), what outcomes follow (`ensures`)?
- What must always or never be true regardless of input? (`invariant` — the seed of MUST / MUST NOT)

**Adversarial probes**
- The worst plausible input, and what the skill should do with it.
- Where could two rules contradict, or an entity reach a dead end with no terminal state?

Then stand up the rest of the frame: the bounded context and ubiquitous language taken from the capability model's interfaces; the eval bench, stubbed; the five artefacts, named.

### 3. Specify — drive the detail from the model

With a validated model standing, Specify is the mechanical expansion of it into the contract. The **manifest**: purpose from Identity; inputs and outputs from the entities, each with a real example and, where they cross a context boundary, conformed to the capability model's interfaces; behaviour rules from the Allium `rule`s; constraints from the `invariant`s; golden examples as scenarios. The **eval suite**: generated from the model with `propagate`, vouched for by the SME, extended with the edge, error and adversarial cases the model and the Scope probes surfaced — written before the implementation. The **implementation**: prompt, tool composition, guardrails, error paths, built to pass the suite.

### 4. Ship — release and take the verdict

The **cost profile**: baseline and optimised token cost, latency, cost per call, with the discipline that change must not break the evals. The **governance gate**: guardrails wired, observability complete, manifest signed off, cost budget set. The **verdict**: what the skill did in use, the evidence an outsider could check, the signal of what to change. Reconcile spec and implementation with `weed`; when requirements change, `tend` then re-`propagate`. Ship enriches the capability model and capability model's interfaces, and the verdict re-enters as the Scope of the next pass.

## Composites

A **composite skill** is a skill whose Interaction reaches other skills. Because the anatomy is fractal, you build a composite with the same loop, not a different one:

- **Scope** the composite task — the larger affordance, in one sentence — and place it in the capability model. Its inputs and outputs are domain-level; its sub-skills are out of its own scope except as things its Interaction reaches.
- **Scaffold** its model: the sub-skills are the nodes its Interaction reaches, each already a built skill with its own manifest and evals (part of the scaffold, per the library effect). The composite's Allium model orchestrates them — the order, the guards, the failure paths — as `rule`s over the sub-skills' surfaces.
- **Specify** the orchestration contract and its evals. The composite's eval suite tests the assembled behaviour, not the sub-skills (those are already green).
- **Ship** it like any skill.

No orchestration vocabulary is introduced: a composite is a node, its sub-skills are nodes, each describable by Identity, Information, Interaction, all the way down. An open-ended capability ("help our customers") is the top composite — decompose it into bounded skills, build each through the loop, then assemble.
