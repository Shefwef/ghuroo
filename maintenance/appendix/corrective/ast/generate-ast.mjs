// Local equivalent of pasting the snippet into astexplorer.net (parser: espree,
// the same parser ESLint and this project's client/.eslintrc.cjs use), so the
// exact AST node shapes match what the class's AST Explorer walkthroughs use.
//
// Run: node maintenance/appendix/corrective/ast/generate-ast.mjs
import { createRequire } from "module";
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
// espree ships as a transitive dependency of ESLint inside client/node_modules;
// we borrow it rather than adding a new dependency to the project.
const require = createRequire(join(__dirname, "../../../../client/", "x.cjs"));
const espree = require("espree");

const source = readFileSync(join(__dirname, "searchTours-original.snippet.js"), "utf8");

const ast = espree.parse(source, {
  ecmaVersion: 2022,
  sourceType: "module",
  loc: true,
  range: true,
});

writeFileSync(join(__dirname, "searchTours-original.ast.json"), JSON.stringify(ast, null, 2));

// Human-readable walk, annotating exactly the nodes relevant to CM-01: every
// place `term` flows, unescaped, into a $regex object literal.
function summarize(node, depth = 0, out = []) {
  if (!node || typeof node.type !== "string") return out;
  const indent = "  ".repeat(depth);
  const extra =
    node.type === "Identifier" && node.name === "term"
      ? "  <-- tainted source (raw req.params.term)"
      : node.type === "Property" && node.key && node.key.name === "$regex"
      ? "  <-- SINK: value handed to MongoDB $regex without sanitization"
      : "";
  out.push(`${indent}${node.type}${extra}`);
  for (const key of Object.keys(node)) {
    if (["loc", "range", "parent"].includes(key)) continue;
    const val = node[key];
    if (Array.isArray(val)) {
      val.forEach((v) => summarize(v, depth + 1, out));
    } else if (val && typeof val.type === "string") {
      summarize(val, depth + 1, out);
    }
  }
  return out;
}

const walk = summarize(ast).join("\n");
writeFileSync(join(__dirname, "searchTours-original.ast-walk.txt"), walk);

console.log("AST node count:", JSON.stringify(ast).match(/"type":/g).length);
console.log("Wrote searchTours-original.ast.json and searchTours-original.ast-walk.txt");
