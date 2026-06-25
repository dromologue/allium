#!/usr/bin/env node
// check.mjs — validate placement consistency and detect drift. Exits non-zero on any error,
// so it can run as a pre-commit hook or CI step (the placement analogue of allium's own
// structural checks and check-generated workflow).
//
// Checks (errors):
//   1. structural — `allium check` reports no error-severity diagnostics for any spec
//   2. placement  — every .allium has -- Capability:/-- Context: headers
//   3. ownership  — no internal component (entity) is claimed by two contexts
//   4. interfaces — every demanded contract is fulfilled by some context (no dangling demand)
//   5. skills     — every skill names a context that has a placed spec
//   6. drift      — capability-model.json on disk matches a fresh generation
//
// Usage: node check.mjs [workspace-dir]

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";
import { execFileSync } from "node:child_process";
import { build } from "./place.mjs";

const root = process.argv[2] || ".";
const errors = [];
const warnings = [];

function walk(dir, hit = []) {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".git") continue;
    const p = join(dir, name);
    statSync(p).isDirectory() ? walk(p, hit) : hit.push(p);
  }
  return hit;
}

const files = walk(root);
const specs = files.filter((f) => f.endsWith(".allium"));

// 1. structural — allium check
let haveAllium = true;
try { execFileSync("allium", ["--version"], { stdio: "ignore" }); } catch { haveAllium = false; }
if (!haveAllium) warnings.push("`allium` CLI not found — skipping structural checks (install crate allium-cli).");
else for (const f of specs) {
  try {
    const out = execFileSync("allium", ["check", f], { encoding: "utf8" });
    const diags = (JSON.parse(out).diagnostics || []).filter((d) => d.severity === "error");
    for (const d of diags) errors.push(`structural: ${relative(root, f)}:${d.location?.line} ${d.message}`);
  } catch (e) {
    // allium exits non-zero on error diagnostics but still prints JSON to stdout
    try {
      const diags = (JSON.parse(e.stdout?.toString() || "{}").diagnostics || []).filter((d) => d.severity === "error");
      for (const d of diags) errors.push(`structural: ${relative(root, f)}:${d.location?.line} ${d.message}`);
    } catch { errors.push(`structural: ${relative(root, f)} could not be parsed by allium`); }
  }
}

// build the model once
const model = build(root);

// 2 & 5. placement headers + skill-without-spec — surfaced by build() as warnings
for (const w of model.warnings) {
  if (/missing -- Capability/.test(w) || /no placed spec/.test(w)) errors.push(`placement: ${w}`);
  else warnings.push(w);
}

// 3. ownership — component claimed by two contexts
const owner = new Map();
for (const cap of model.capabilities) for (const ctx of cap.contexts) for (const comp of ctx.components) {
  if (!owner.has(comp)) owner.set(comp, []);
  owner.get(comp).push(ctx.name);
}
for (const [comp, ctxs] of owner) if (ctxs.length > 1) errors.push(`ownership: component '${comp}' is claimed by multiple contexts: ${ctxs.join(", ")}`);

// 4. interfaces — dangling demand
for (const i of model.interfaces) if (i.demanded_by.length && i.fulfilled_by.length === 0) {
  errors.push(`interface: contract '${i.contract}' is demanded by ${i.demanded_by.join(", ")} but fulfilled by no context`);
}

// 6. drift — committed model matches fresh generation
const modelPath = join(root, "capability-model.json");
if (existsSync(modelPath)) {
  const fresh = JSON.stringify(model, null, 2) + "\n";
  const onDisk = readFileSync(modelPath, "utf8");
  if (fresh !== onDisk) errors.push("drift: capability-model.json is stale — run `node bin/place.mjs` and commit the result");
} else {
  warnings.push("capability-model.json not found — run `node bin/place.mjs` to generate it");
}

for (const w of warnings) console.warn(`warning: ${w}`);
if (errors.length) {
  for (const e of errors) console.error(`error: ${e}`);
  console.error(`\nplacement check failed: ${errors.length} error(s).`);
  process.exit(1);
}
console.log(`placement check passed: ${model.capabilities.length} capabilit${model.capabilities.length === 1 ? "y" : "ies"}, ${model.interfaces.length} interface(s), ${warnings.length} warning(s).`);
