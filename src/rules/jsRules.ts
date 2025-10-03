import Parser = require("tree-sitter");
import JavaScript = require("tree-sitter-javascript");

export function getJSFixes(code: string) {
  const parser = new Parser();
  parser.setLanguage(JavaScript);

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

    // 1-10: Missing semicolons at end of statements where required
    if (/[^;{}\s]$/.test(txt) && !/;$/.test(txt) && /^[\s\S]*[a-zA-Z0-9_$]+\s*=/.test(txt)) {
      addFix(node, ";");
    }

    // 11-15: Missing curly braces {} for control statements (if, else, for, while)
    if (/^(if|else if|else|for|while|do|switch|try|catch|finally)\s*[\(]?.*[\)]?\s*(?!\{)/.test(txt)) {
      addFix(node, "{}");
    }

    // 16-20: Missing parentheses in function definitions or calls
    if (/^(function\s+)?[a-zA-Z0-9_$]+\s*\(.*[^)]$/.test(txt) || /^\(.*[^)]$/.test(txt)) {
      addFix(node, ")");
    }

    // 21-25: Mismatched parentheses, brackets, braces
    if (txt.includes("(") && !txt.includes(")")) addFix(node, ")");
    if (txt.includes("{") && !txt.includes("}")) addFix(node, "}");
    if (txt.includes("[") && !txt.includes("]")) addFix(node, "]");

    // 26-30: Unclosed string literals (single, double, template)
    if (/^(['"`])(?:(?!\1).)*$/.test(txt)) {
      addFix(node, txt[0]);
    }

    // 31-35: Missing commas in object literals or arrays
    if (/,?[\s\S]*[a-zA-Z0-9_$]+\s+[a-zA-Z0-9_$]+\s*[^,}\]]/.test(txt)) {
      addFix(node, ",");
    }

    // 36-40: Incorrect or missing assignment operators (=)
    if (/^[a-zA-Z0-9_$]+\s+[^=]+\s*[^\s;]+;?/.test(txt)) {
      addFix(node, "=");
    }

    // 41-45: Missing return statements in functions (heuristic)
    if (/function\s+[a-zA-Z0-9_$]*\s*\([^)]*\)\s*{/.test(txt) && !/return\s+/.test(txt)) {
      addFix(node, "Add return statement");
    }

    // 46-50: Illegal use of reserved keywords as identifiers
    const reserved = [
      "break", "case", "catch", "class", "const", "continue", "debugger", "default",
      "delete", "do", "else", "export", "extends", "finally", "for", "function",
      "if", "import", "in", "instanceof", "let", "new", "return", "super",
      "switch", "this", "throw", "try", "typeof", "var", "void", "while", "with", "yield"
    ];
    reserved.forEach((word) => {
      if (txt.includes(word + " ") && !new RegExp(`\\b${word}\\b`).test(txt)) {
        addFix(node, `Check reserved keyword usage: ${word}`);
      }
    });

    // 51-55: Trailing commas in arrays or objects (allowed in newer ES but sometimes source of error)
    if (/,\s*[\]\}]/.test(txt)) {
      addFix(node, "Remove trailing comma");
    }

    // 56-60: Multiple statements on one line without semicolons
    if (/;[^#\n]/.test(txt) === false && /\S+\s+\S+/.test(txt)) {
      addFix(node, "Separate statements with semicolons");
    }

    // 61-65: Use of == or != instead of === or !==
    if (txt.includes("==") && !txt.includes("===")) {
      addFix(node, "Use === instead of ==");
    }
    if (txt.includes("!=") && !txt.includes("!==")) {
      addFix(node, "Use !== instead of !=");
    }
  });

  return fixes;
}
