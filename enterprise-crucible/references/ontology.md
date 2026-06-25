# Ontology

Crucible's layers, and how they sit on Allium.

## Noun layer and verb layer

Allium is the **noun** layer: what the enterprise *is*, modelled as observable behaviour. A component — an entity with its rules, invariants, contracts and surface — is a noun. It exists and behaves whether or not anyone ever builds an affordance on it.

Crucible is the **verb** layer: what you can *do* with it. A skill is a verb — access a component and do something with it. The placement layer sits between the two, saying *where* each noun lives in the enterprise.

The compression: **Allium models what the enterprise is; placement says where each piece sits; the SSSS loop builds the things you can do with it.**

## The layers

```
Enterprise
 └─ Capability                 (a set of skill contexts realising one enterprise capability)
     └─ Skill Context          (a bounded context; links a capability to its Allium elements; has I/I/I)
         └─ Component           (an Allium entity with its rules, invariants, contracts, surface)

Skill            (an affordance on a component, associated with a skill context)
Composite Skill  (skills assembled into a larger whole)
```

- **Component** — defined by Allium. The unit of behaviour. Located by Crucible, acted on by a skill, but a first-class enterprise asset in its own right.
- **Skill context** — a coherent group of components within one ubiquitous language; a bounded context in Evans's sense. It is the *link* between a capability and the Allium elements that realise it. It carries an Identity, Information and Interaction.
- **Capability** — the enterprise capability a set of skill contexts realises. The top of the map.
- **Skill** — a codified, evaluated affordance for one bounded task on a component: "given this component, let a user do X."
- **Composite skill** — an assembly of skills. A larger affordance built from smaller ones.

## The fractal anatomy

Every node in this picture — a skill context, a skill, a composite — is describable by the same three components:

- **Identity** — what it does, in the domain's own words.
- **Information** — the context it needs and where it gets it.
- **Interaction** — the tools and skills it reaches; recursive, because each of those is itself a node with its own Identity, Information and Interaction.

Because the anatomy repeats at every level, composition needs no separate vocabulary. A composite skill is simply a node whose Interaction reaches other skill-nodes; a skill context is a node whose Interaction reaches its components and the contexts it integrates with. The unit and its composition share one shape.

## The scale-free loop

The Scope-Scaffold-Specify-Ship loop runs at every level. Building an atomic skill on a component and assembling a composite from sub-skills are the same four moves, because both targets share the anatomy:

- **Scope** fixes Identity and places the work in the capability map.
- **Scaffold** designs Information and Interaction as an Allium model.
- **Specify** writes the contract and the evals from that model.
- **Ship** takes the verdict and enriches the shared map.

"Assemble skills into composites" is the loop seen from the top; "build one bounded skill" is the same loop seen from the bottom.

## Relation to Allium's constructs

| Crucible term | Nearest Allium construct | Note |
|---------------|--------------------------|------|
| Component | `entity` + its `rule`s and `invariant`s | A component is Allium behaviour. |
| Skill context | a spec module / `surface` | The bounded surface a context exposes; placement adds its capability and I/I/I. |
| Cross-context interface | `contract` (`demands`/`fulfils`), `surface` `exposes`/`provides` | Semantic consistency builds on these, not a new schema language. |
| Skill behaviour | a `.allium` model | A skill's Scaffold output is an Allium spec. |
| Eval suite | `propagate` output | Generated from the model. |

Placement and assembly are framing and method; the substance is Allium's.
