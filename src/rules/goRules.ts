const Parser = require("tree-sitter");
const go = require("tree-sitter-go");

export function getgoFixes(code: string) {
  const parser = new Parser();
 parser.setLanguage(go as unknown as import("tree-sitter").Language);


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

    // 1-10: Missing curly braces in function and control blocks
    if (/^(func|if|else if|else|for|switch|select|defer|go)\s*(\(.*\))?\s*(?!\{)/.test(txt)) {
      addFix(node, "{}");
    }

    // 11-15: Missing semicolons (Go requires semicolons internally, but usually invisible; source errors may manifest)
    if (/[^;\{\}\s]$/.test(txt) && !txt.endsWith(";") && /^[\s\S]*[a-zA-Z0-9_]+\s*=/.test(txt)) {
      addFix(node, ";");
    }

    // 16-20: Missing parentheses in function calls or declarations
    if (/^func\s+[a-zA-Z0-9_]+\s*\(.*[^)]$/.test(txt) || /^[a-zA-Z0-9_]+\s*\(.*[^)]$/.test(txt)) {
      addFix(node, ")");
    }

    // 21-25: Mismatched parentheses, brackets, braces
    if (txt.includes("(") && !txt.includes(")")) addFix(node, ")");
    if (txt.includes("{") && !txt.includes("}")) addFix(node, "}");
    if (txt.includes("[") && !txt.includes("]")) addFix(node, "]");

    // 26-30: Unclosed string literals (double or backticks)
    if (/^(`|")(?:(?!\1).)*$/.test(txt)) {
      addFix(node, txt[0]);
    }

    // 31-35: Missing commas in parameter lists or composite literals
    if (/,?[\s\S]*[a-zA-Z0-9_]+\s+[a-zA-Z0-9_]+\s*[^,}\]]/.test(txt)) {
      addFix(node, ",");
    }

    // 36-40: Incorrect or missing assignment operators
    if (/^[a-zA-Z0-9_]+\s+[^=]+\s*[^\s;]+;?/.test(txt)) {
      addFix(node, "=");
    }

    // 41-45: Missing return statement in non-void functions (heuristic)
    if (/func\s+[a-zA-Z0-9_]+\s*\([^)]*\)\s*(\([^\)]*\)|[a-zA-Z0-9_]+)?\s*{/.test(txt) && !/return\s+/.test(txt)) {
      addFix(node, "Add return statement");
    }

    // 46-50: Usage of keywords as variable names (Go keywords)
    const reserved = [
      "break", "default", "func", "interface", "select", "case", "defer",
      "go", "map", "struct", "chan", "else", "goto", "package", "switch",
      "const", "fallthrough", "if", "range", "type", "continue", "for",
      "import", "return", "var"
    ];
    reserved.forEach((word) => {
      if (txt.includes(word + " ") && !new RegExp("\\b" + word + "\\b").test(txt)) {
        addFix(node, `Check reserved keyword usage: ${word}`);
      }
    });

    // 51-55: Missing package declaration
    if (/^func\s+/.test(txt) && !txt.includes("package")) {
      addFix(node, "Missing package declaration");
    }

    // 56-60: Multiple statements on one line without explicit semicolons
    if (/;[^#\n]/.test(txt) === false && /\S+\s+\S+/.test(txt)) {
      addFix(node, "Separate statements with semicolons");
    }
  });

  return fixes;
}
