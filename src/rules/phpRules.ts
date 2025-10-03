import Parser = require("tree-sitter");
import php = require("tree-sitter-php");

export function getphpFixes(code: string) {
  const parser = new Parser();
  parser.setLanguage(php);

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

    // 1-10: Missing semicolon at end of statements
    if (/[^;\s]$/.test(txt) && !txt.endsWith(";") && /^[\s\S]*[\$a-zA-Z_]\s*=/.test(txt)) {
      addFix(node, ";");
    }

    // 11-15: Missing curly braces in control structures (if, else, for, while)
    if (/^(if|else|elseif|for|while|foreach|switch|try|catch|finally)\s*[\(]?.*[\)]?\s*(?!\{)/.test(txt)) {
      addFix(node, "{}");
    }

    // 16-20: Missing parentheses in function calls or definitions
    if (/^\s*function\s+[a-zA-Z0-9_]+\s*\(.*[^)]$/.test(txt) || /^\s*[a-zA-Z0-9_]+\s*\(.*[^)]$/.test(txt)) {
      addFix(node, ")");
    }

    // 21-25: Mismatched parentheses, brackets, braces
    if (txt.includes("(") && !txt.includes(")")) addFix(node, ")");
    if (txt.includes("{") && !txt.includes("}")) addFix(node, "}");
    if (txt.includes("[") && !txt.includes("]")) addFix(node, "]");

    // 26-30: Unclosed string literals (single, double, heredoc/nowdoc not handled)
    if (/^(['"])(?:(?!\1).)*$/.test(txt)) {
      addFix(node, txt[0]);
    }

    // 31-35: Missing commas in array definitions or parameter lists
    if (/,?[\s\S]*[a-zA-Z0-9_\$]+\s+[a-zA-Z0-9_\$]+\s*[^,)\]]/.test(txt)) {
      addFix(node, ",");
    }

    // 36-40: Incorrect assignment or missing assignment operator (=)
    if (/^[\$a-zA-Z_]+[^=]\s*[^;]+;?/.test(txt)) {
      addFix(node, "=");
    }

    // 41-45: Missing return statement in non-void functions (heuristic)
    if (/function\s+[a-zA-Z0-9_]*\s*\([^)]*\)\s*{/.test(txt) && !/return\s+/.test(txt)) {
      addFix(node, "Add return statement");
    }

    // 46-50: Using reserved keywords as variable/function names
    const reserved = [
      "abstract", "and", "array", "as", "break", "callable", "case", "catch",
      "class", "clone", "const", "continue", "declare", "default", "die", "do",
      "echo", "else", "elseif", "empty", "enddeclare", "endfor", "endforeach",
      "endif", "endswitch", "endwhile", "eval", "exit", "extends", "final",
      "finally", "for", "foreach", "function", "global", "goto", "if", "implements",
      "include", "include_once", "instanceof", "insteadof", "interface", "isset", "list",
      "namespace", "new", "or", "print", "private", "protected", "public", "require",
      "require_once", "return", "static", "switch", "throw", "trait", "try", "unset",
      "use", "var", "while", "xor", "yield",
    ];
    reserved.forEach((word) => {
      if (txt.includes(word + " ") && !new RegExp("\\b" + word + "\\b").test(txt)) {
        addFix(node, `Check reserved keyword usage: ${word}`);
      }
    });

    // 51-55: Missing PHP opening tags "<?php"
    if (!code.startsWith("<?php")) {
      addFix(node, "Add <?php opening tag");
    }

    // 56-60: Multiple statements on one line without semicolons (basic check)
    if (/;[^#\n]/.test(txt) === false && /\S+\s+\S+/.test(txt)) {
      addFix(node, "Separate statements with semicolons");
    }
  });

  return fixes;
}
