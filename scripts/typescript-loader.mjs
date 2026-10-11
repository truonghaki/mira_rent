// Test-only loader: use the existing TypeScript compiler, without another dependency.
import fs from "node:fs/promises"
import { existsSync } from "node:fs"
import { fileURLToPath, pathToFileURL } from "node:url"
import ts from "typescript"

const sourceRoot = new URL("../src/", import.meta.url)
export async function resolve(specifier, context, nextResolve) {
  let url
  if (specifier.startsWith("@/")) url = new URL(specifier.slice(2), sourceRoot)
  else if (specifier.startsWith(".") && context.parentURL)
    url = new URL(specifier, context.parentURL)
  else if (specifier.startsWith("file:")) url = new URL(specifier)
  if (url?.protocol === "file:") {
    const filename = fileURLToPath(url)
    for (const candidate of [
      filename,
      filename + ".ts",
      filename + ".tsx",
      filename + "/index.ts",
      filename + "/index.tsx",
    ]) {
      if (/\.tsx?$/.test(candidate) && existsSync(candidate))
        return { url: pathToFileURL(candidate).href, shortCircuit: true }
    }
  }
  return nextResolve(specifier, context)
}

export async function load(url, context, nextLoad) {
  if (/\.tsx?$/.test(new URL(url).pathname)) {
    const source = await fs.readFile(fileURLToPath(url), "utf8")
    return {
      format: "module",
      shortCircuit: true,
      source: ts.transpileModule(source, {
        fileName: fileURLToPath(url),
        compilerOptions: {
          target: ts.ScriptTarget.ES2022,
          module: ts.ModuleKind.ESNext,
          jsx: ts.JsxEmit.ReactJSX,
        },
      }).outputText,
    }
  }
  return nextLoad(url, context)
}
