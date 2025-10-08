import { language } from "tree-sitter-rust";

const Parser = require("tree-sitter");
const c = require("tree-sitter-c");

export function getcFixes(code: string) {
  const parser = new Parser();
  parser.setLanguage(c as unknown as import("tree-sitter").Language);


  const tree = parser.parse(code);
  const fixes: { line: number; fix: string }[] = [];

  const addFix = (node: any, fixText: string) => {
    fixes.push({ line: node.startPosition.row + 1, fix: fixText });
  };

  const errorNodes = [
    ...tree.rootNode.descendantsOfType("ERROR"),
    ...tree.rootNode.descendantsOfType("MISSING"),
  ];

  errorNodes.forEach((node) => {
    const txt = node.text;

    // 1-10: Missing semicolons at end of statements
    if (/[^;\s]$/.test(txt) && !txt.endsWith(";") && /^[\s\S]*[a-zA-Z0-9_]+\s*=/.test(txt)) {
      addFix(node, ";");
    }

    // 11-15: Missing braces in control blocks (if, else, for, while, switch)
    if (/^(if|else|for|while|do|switch|case|default)\s*[\(]?.*[\)]?\s*(?!\{)/.test(txt)) {
      addFix(node, "{}");
    }

    // 16-20: Missing parentheses in function calls and declarations
    if (/^\s*[a-zA-Z_][a-zA-Z0-9_]*\s+[a-zA-Z_][a-zA-Z0-9_]*\s*\(.*[^)]$/.test(txt) || /^\s*[a-zA-Z_][a-zA-Z0-9_]*\(.*[^)]$/.test(txt)) {
      addFix(node, ")");
    }

    // 21-25: Mismatched brackets, braces, parentheses
    if (txt.includes("(") && !txt.includes(")")) addFix(node, ")");
    if (txt.includes("{") && !txt.includes("}")) addFix(node, "}");
    if (txt.includes("[") && !txt.includes("]")) addFix(node, "]");

    // 26-30: Unclosed string literals (double or single quotes)
    if (/^(['"])(?:(?!\1).)*$/.test(txt)) {
      addFix(node, txt[0]);
    }

    // 31-35: Missing commas in parameter lists, arrays
    if (/,?[\s\S]*[a-zA-Z0-9_]+\s+[a-zA-Z0-9_]+\s*[^,)\]]/.test(txt)) {
      addFix(node, ",");
    }

    // 36-40: Missing or incorrect assignment operator
    if (/^[a-zA-Z0-9_]+\s+[^=]+\s*[^\s;]+;?/.test(txt)) {
      addFix(node, "=");
    }

    // 41-45: Missing return statements for non-void functions (heuristic)
    if (/^[a-zA-Z_][a-zA-Z0-9_]*\s+[a-zA-Z_][a-zA-Z0-9_]*\(.*\)\s*{/.test(txt) && !/return\s+/.test(txt)) {
      addFix(node, "Add return statement");
    }

    // 46-50: Use of reserved keywords as identifiers
    const reserved = [
      "auto", "break", "case", "char", "const", "continue", "default", "do",
      "double", "else", "enum", "extern", "float", "for", "goto", "if", "inline",
      "int", "long", "register", "restrict", "return", "short", "signed", "sizeof",
      "static", "struct", "switch", "typedef", "union", "unsigned", "void", "volatile", "while",
      "_Alignas", "_Alignof", "_Atomic", "_Bool", "_Complex", "_Generic", "_Imaginary", "_Noreturn",
      "_Static_assert", "_Thread_local"
    ];
    reserved.forEach((word) => {
      if (txt.includes(word + " ") && !new RegExp("\\b" + word + "\\b").test(txt)) {
        addFix(node, `Check reserved keyword usage: ${word}`);
      }
    });

    // 51-55: Multiple statements without proper semicolon separation
    if (/;[^#\n]/.test(txt) === false && /\S+\s+\S+/.test(txt)) {
      addFix(node, "Separate statements with semicolons");
    }
  });

  return fixes;
}
