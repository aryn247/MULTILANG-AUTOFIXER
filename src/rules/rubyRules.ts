const Parser = require("tree-sitter");
const ruby = require("tree-sitter-ruby");

export function getrubyFixes(code: string) {
  const parser = new Parser();
  parser.setLanguage(ruby as unknown as import("tree-sitter").Language);


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

    // 1-10: Missing 'end' statements for blocks (if, def, class, module, etc.)
    if (/^\s*(if|def|class|module|unless|begin|while|until|for)\b.*$/.test(txt) && !txt.includes("end")) {
      addFix(node, "Add missing 'end'");
    }

    // 11-15: Missing colons (rare in Ruby but sometimes required in ternary)
    if (/\?.*[^:]$/.test(txt)) {
      addFix(node, ":");
    }

    // 16-20: Unclosed string literals (single, double, heredoc)
    if (/^(['"])(?:(?!\1).)*$/.test(txt)) {
      addFix(node, txt[0]);
    }

    // 21-25: Missing commas in arrays or hashes
    if (/,?[\s\S]*[a-zA-Z0-9_]+\s+[a-zA-Z0-9_]+\s*[^,}\]]/.test(txt)) {
      addFix(node, ",");
    }

    // 26-30: Mismatched parentheses, brackets, braces
    if (txt.includes("(") && !txt.includes(")")) {
      addFix(node, ")");
    }
    if (txt.includes("{") && !txt.includes("}")) {
      addFix(node, "}");
    }
    if (txt.includes("[") && !txt.includes("]")) {
      addFix(node, "]");
    }

    // 31-35: Missing operators in expressions (like assignment or comparison)
    if (/^[a-zA-Z_][a-zA-Z0-9_]*\s+[^=><!]+/.test(txt)) {
      addFix(node, "Add missing operator");
    }

    // 36-40: Missing blocks for iterators (do..end or {...})
    if (/\b(each|map|select|reject|reduce|inject|times)\b.*[^do{]$/.test(txt)) {
      addFix(node, "Add missing block (do..end or {})");
    }

    // 41-45: Using reserved keywords as identifiers
    const reserved = [
      "BEGIN", "END", "alias", "and", "begin", "break", "case", "class", "def", "defined?",
      "do", "else", "elsif", "end", "ensure", "false", "for", "if", "in", "module", "next",
      "nil", "not", "or", "redo", "rescue", "retry", "return", "self", "super", "then", "true",
      "undef", "unless", "until", "when", "while", "yield"
    ];
    reserved.forEach((word) => {
      if (txt.includes(word + " ") && !new RegExp("\\b" + word + "\\b").test(txt)) {
        addFix(node, `Check reserved keyword usage: ${word}`);
      }
    });

    // 46-50: Multiple statements on one line without proper semicolons (rare, but possible with ;)
    if (/;[^#\n]/.test(txt) === false && /\S+\s+\S+/.test(txt)) {
      addFix(node, "Separate statements with semicolons");
    }
  });

  return fixes;
}
