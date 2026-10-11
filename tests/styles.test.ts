import assert from "node:assert/strict"
import test from "node:test"
import { readFileSync } from "node:fs"
import { createHash } from "node:crypto"
import baseline from "./fixtures/style-baseline.json" with { type: "json" }

test("font imports, CSS rules, media queries and animations retain the original source order", () => {
  const root = new URL("../src/", import.meta.url)
  const css = (file: string) =>
    readFileSync(new URL(file, root), "utf8").replace(/\r\n/g, "\n")
  const imports = css("index.css")
    .split("\n")
    .filter(
      (line) =>
        line.includes("fonts.googleapis.com") || line.includes('"tailwindcss"'),
    )
    .join("\n")
  const reconstructed = [
    imports,
    css("styles/tokens.css").trim(),
    css("styles/global.css").trim(),
  ].join("\n\n")
  assert.equal(
    createHash("sha256").update(reconstructed).digest("hex"),
    baseline.sourceSha256,
  )
})
