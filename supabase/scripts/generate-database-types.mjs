import fs from "node:fs/promises";
const manifest = JSON.parse((await fs.readFile(process.argv[2] || ".cache/backend-schema.json", "utf8")).replace(/^\uFEFF/, ""));
function type(name) {
  if (name.startsWith("_")) return type(name.slice(1)) + "[]";
  if (manifest.enums[name]) return `Database["public"]["Enums"]["${name}"]`;
  if (manifest.relations[name]) return `Database["public"]["Tables"]["${name}"]["Row"]`;
  if (["int2","int4","int8","numeric","float4","float8"].includes(name)) return "number";
  if (name === "bool") return "boolean";
  if (["json","jsonb"].includes(name)) return "Json";
  if (["uuid","text","date","timestamptz","timestamp","varchar"].includes(name)) return "string";
  throw new Error("Unmapped PostgreSQL type: " + name);
}
function fields(columns, mode) {
  return columns.map(c => {
    const optional = mode === "Update" || (mode === "Insert" && c.optional);
    const valueType = mode !== "Row" && c.generated ? "never" : type(c.type) + (c.nullable ? " | null" : "");
    return `        ${JSON.stringify(c.name)}${optional || (mode !== "Row" && c.generated) ? "?" : ""}: ${valueType};`;
  }).join("\n");
}
const lines = ["// Generated from public schema introspection after migrations 01 -> 04.",
  "// Regenerate against the deployed project before changing its schema; do not hand-edit.",
  "export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];",
  "export type Database = { public: { Tables: {"];
for (const [name, relation] of Object.entries(manifest.relations)) {
  if (relation.kind !== "r") continue;
  lines.push(`    ${JSON.stringify(name)}: {`);
  for (const mode of ["Row","Insert","Update"]) lines.push(`      ${mode}: {\n${fields(relation.columns,mode)}\n      };`);
  lines.push(`      Relationships: ${JSON.stringify(relation.relationships)};\n    };`);
}
lines.push("  }; Views: {");
for (const [name, relation] of Object.entries(manifest.relations)) if (relation.kind === "v") {
  lines.push(`    ${JSON.stringify(name)}: { Row: {\n${fields(relation.columns,"Row")}\n    }; Relationships: ${JSON.stringify(relation.relationships)}; };`);
}
lines.push("  }; Functions: {");
for (const [name, f] of Object.entries(manifest.functions)) {
  const args = f.args.map(a => `${JSON.stringify(a.name)}${a.optional ? "?" : ""}: ${type(a.type)}`).join("; ");
  lines.push(`    ${JSON.stringify(name)}: { Args: {${args}}; Returns: ${type(f.returns)} };`);
}
lines.push("  }; Enums: {");
for (const [name, values] of Object.entries(manifest.enums)) lines.push(`    ${JSON.stringify(name)}: ${values.map(JSON.stringify).join(" | ")};`);
lines.push("  }; CompositeTypes: Record<string, never>; } };", "");
await fs.mkdir("src/services/supabase",{recursive:true});
await fs.writeFile("src/services/supabase/database.types.ts",lines.join("\n"));
console.log("Generated database types from the applied schema.");
