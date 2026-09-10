// 使用网站已有的 TypeScript 编译器检查结构，不需要另装分析器。
import ts from "../website/node_modules/typescript/lib/typescript.js";
import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join, relative } from "node:path";

const ROOT = fileURLToPath(new URL("../", import.meta.url));
const EXTENSIONS = /\.(?:tsx?|[cm]?js|css)$/;
const LIMITS = { file: 300, function: 50, parameters: 3, complexity: 10, depth: 3 };
const { SyntaxKind: K } = ts;
const DECISIONS = new Set([K.IfStatement, K.ConditionalExpression, K.ForStatement, K.ForInStatement,
  K.ForOfStatement, K.WhileStatement, K.DoStatement, K.CaseClause, K.CatchClause]);
const NESTED = new Set([K.IfStatement, K.ForStatement, K.ForInStatement, K.ForOfStatement,
  K.WhileStatement, K.DoStatement, K.SwitchStatement, K.CatchClause]);
const LOGICAL = new Set([K.AmpersandAmpersandToken, K.BarBarToken, K.QuestionQuestionToken]);
const isFunction = (node) => ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node) || ts.isArrowFunction(node) || ts.isMethodDeclaration(node);

async function files(directory) {
  const found = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) found.push(...await files(path));
    else if (EXTENSIONS.test(path)) found.push(path);
  }
  return found;
}

function metrics(node, depth = 0) {
  let complexity = Number(DECISIONS.has(node.kind));
  if (ts.isBinaryExpression(node) && LOGICAL.has(node.operatorToken.kind)) complexity++;
  const chained = ts.isIfStatement(node) && node.parent?.elseStatement === node;
  const next = depth + Number(NESTED.has(node.kind) && !chained);
  let maximum = next;
  ts.forEachChild(node, (child) => {
    if (isFunction(child)) return;
    const branch = metrics(child, next);
    complexity += branch.complexity;
    maximum = Math.max(maximum, branch.depth);
  });
  return { complexity, depth: maximum };
}

async function inspect(path) {
  const text = await readFile(path, "utf8"), errors = [], name = relative(ROOT, path);
  if (text.trimEnd().split("\n").length > LIMITS.file) errors.push(`${name}: file > 300`);
  if (path.endsWith(".css")) return errors;
  const source = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true);
  const line = (offset) => source.getLineAndCharacterOfPosition(offset).line;
  function visit(node) {
    if (isFunction(node)) {
      const measurement = metrics(node);
      const values = { function: line(node.end) - line(node.getStart(source)) + 1,
        parameters: node.parameters.length, complexity: measurement.complexity + 1, depth: measurement.depth };
      for (const [metric, value] of Object.entries(values)) {
        if (value > LIMITS[metric]) errors.push(`${name}:${line(node.getStart(source)) + 1} ${metric}=${value}`);
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  return errors;
}

const paths = (await Promise.all(["website/app", "website/components", "website/lib", "website/tests", "plugins", "tests"]
  .map((directory) => files(join(ROOT, directory))))).flat();
const errors = (await Promise.all(paths.map(inspect))).flat();
for (const error of errors) console.error(error);
console.log(`Web / plugin files: ${paths.length}; violations: ${errors.length}`);
process.exitCode = Number(errors.length > 0);
