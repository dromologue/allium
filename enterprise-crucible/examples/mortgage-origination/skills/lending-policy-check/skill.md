# lending-policy-check

**Identity.** Produce a policy assessment for a mortgage application: check it against the current lending policy and return a structured assessment with a citation for every finding.

- **Capability:** Mortgage Origination
- **Skill context:** Underwriting
- **Acts on:** the `Application` component (`underwriting.allium`), via the `AssessmentSurface`
- **Returns:** an `AssessmentResult` (the published interface; see the capability model's interfaces)

**Information.** Inputs: the `Application` and the current `PolicySet`. Both are components of the Underwriting context; the policy set is the static context cached at Ship.

**Interaction.** Reaches the policy retrieval and the assessment writer behind `AssessmentSurface`. It does not make the lending decision — that stays with the underwriter (the `NoLendingDecision` invariant).

**Behaviour.** Driven by the `CheckAgainstPolicy` rule. Constraints: MUST cite a policy clause for every finding (`EveryFindingCited`); MUST NOT make the lending decision (`NoLendingDecision`).

The five artefacts live beside this file: this `skill.md` and `manifest.json` (the contract and guardrails), `evals.feature` (the eval suite, generated from the model with `propagate` and vouched for by the underwriter), and `cost-profile.json` (cost profile and observability). The skill is placed in the enterprise view by `bin/place.mjs`, which reads `manifest.json`.
