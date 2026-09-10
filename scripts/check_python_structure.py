#!/usr/bin/env python3
"""检查 Python 代码的文件、函数、参数、嵌套和复杂度边界。"""
import ast
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LIMITS = {"file": 300, "function": 50, "parameters": 3, "complexity": 10, "depth": 3}
DECISIONS = (ast.If, ast.IfExp, ast.For, ast.While, ast.ExceptHandler, ast.comprehension)
NESTING = (ast.If, ast.For, ast.While, ast.ExceptHandler)


def metrics(node, depth=0):
    complexity = int(isinstance(node, DECISIONS))
    if isinstance(node, ast.BoolOp):
        complexity += len(node.values) - 1
    next_depth = depth + int(isinstance(node, NESTING))
    maximum = next_depth
    for child in ast.iter_child_nodes(node):
        if isinstance(child, (ast.FunctionDef, ast.AsyncFunctionDef, ast.Lambda)):
            continue
        branch, level = metrics(child, next_depth)
        complexity += branch
        maximum = max(maximum, level)
    return complexity, maximum


def check_file(path):
    source = path.read_text()
    errors = []
    if len(source.splitlines()) > LIMITS["file"]:
        errors.append(f"{path.relative_to(ROOT)}: 文件超过 300 行")
    for node in ast.walk(ast.parse(source)):
        if not isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
            continue
        complexity, depth = metrics(node)
        parameters = [argument for argument in node.args.args if argument.arg not in {"self", "cls"}]
        values = {"function": node.end_lineno - node.lineno + 1, "parameters": len(parameters),
                  "complexity": complexity + 1, "depth": depth}
        for metric, value in values.items():
            if value > LIMITS[metric]:
                errors.append(f"{path.relative_to(ROOT)}:{node.lineno} {node.name}: {metric}={value}")
    return errors


def main():
    paths = [*ROOT.glob("scripts/**/*.py"), *ROOT.glob("tests/*.py")]
    errors = [error for path in paths for error in check_file(path)]
    for error in errors:
        print(error)
    print(f"Python files: {len(paths)}; violations: {len(errors)}")
    raise SystemExit(bool(errors))


if __name__ == "__main__":
    main()
