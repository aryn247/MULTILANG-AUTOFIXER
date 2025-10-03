import Parser = require("tree-sitter");
import cpp = require("tree-sitter-cpp");

export function getcppFixes(code: string) {
  const parser = new Parser();
  parser.setLanguage(cpp);

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

    // 1-10: Missing semicolons at statement ends
    if (/[^;\s]$/.test(txt) && !txt.endsWith(";") && /^[\s\S]*[a-zA-Z0-9_]+\s*=/.test(txt)) {
      addFix(node, ";");
    }

    // 11-15: Missing braces in control structures (if, else, for, while, switch, try-catch)
    if (/^(if|else|for|while|do|switch|case|default|try|catch)\s*[\(]?.*[\)]?\s*(?!\{)/.test(txt)) {
      addFix(node, "{}");
    }

    // 16-20: Missing parentheses in function declarations or calls
    if (/^\s*[a-zA-Z_][a-zA-Z0-9_]*\s+[a-zA-Z_][a-zA-Z0-9_]*\s*\(.*[^)]$/.test(txt) || /^\s*[a-zA-Z_][a-zA-Z0-9_]*\(.*[^)]$/.test(txt)) {
      addFix(node, ")");
    }

    // 21-25: Mismatched parentheses, brackets, braces
    if (txt.includes("(") && !txt.includes(")")) addFix(node, ")");
    if (txt.includes("{") && !txt.includes("}")) addFix(node, "}");
    if (txt.includes("[") && !txt.includes("]")) addFix(node, "]");

    // 26-30: Unclosed string literals (single, double, raw string literals)
    if (/^(\s*R?"|')(?:(?!\1).)*$/.test(txt)) {
      addFix(node, txt[0]);
    }

    // 31-35: Missing commas in parameter lists, initializer lists
    if (/,?[\s\S]*[a-zA-Z0-9_]+\s+[a-zA-Z0-9_]+\s*[^,)\]]/.test(txt)) {
      addFix(node, ",");
    }

    // 36-40: Missing or incorrect assignment operator
    if (/^[a-zA-Z0-9_]+\s+[^=]+\s*[^\s;]+;?/.test(txt)) {
      addFix(node, "=");
    }

    // 41-45: Missing return statements in non-void functions (heuristic)
    if (/^[a-zA-Z_][a-zA-Z0-9_]*\s+[a-zA-Z_][a-zA-Z0-9_]*\(.*\)\s*{/.test(txt) && !/return\s+/.test(txt)) {
      addFix(node, "Add return statement");
    }

    // 46-50: Misuse of C++ reserved keywords as identifiers
    const reserved = [
      "alignas", "alignof", "and", "and_eq", "asm", "atomic_cancel",
      "atomic_commit", "atomic_noexcept", "auto", "bitand", "bitor", "bool",
      "break", "case", "catch", "char", "char8_t", "char16_t", "char32_t",
      "class", "compl", "concept", "const", "consteval", "constexpr",
      "const_cast", "continue", "co_await", "co_return", "co_yield", "decltype",
      "default", "delete", "do", "double", "dynamic_cast", "else", "enum",
      "explicit", "export", "extern", "false", "float", "for", "friend", "goto",
      "if", "inline", "int", "long", "mutable", "namespace", "new", "noexcept",
      "not", "not_eq", "nullptr", "operator", "or", "or_eq", "private",
      "protected", "public", "reflexpr", "register", "reinterpret_cast",
      "requires", "return", "short", "signed", "sizeof", "static",
      "static_assert", "static_cast", "struct", "switch", "synchronized",
      "template", "this", "thread_local", "throw", "true", "try", "typedef",
      "typeid", "typename", "union", "unsigned", "using", "virtual", "void",
      "volatile", "wchar_t", "while", "xor", "xor_eq"
    ];
    reserved.forEach((word) => {
      if (txt.includes(word + " ") && !new RegExp("\\b" + word + "\\b").test(txt)) {
        addFix(node, `Check reserved keyword usage: ${word}`);
      }
    });

    // 51-55: Multiple statements on one line without proper semicolon separation
    if (/;[^#\n]/.test(txt) === false && /\S+\s+\S+/.test(txt)) {
      addFix(node, "Separate statements with semicolons");
    }
  });

  return fixes;
}
