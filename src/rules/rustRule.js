"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getrustFixes = getrustFixes;
const Parser = require("tree-sitter");
const rust = require("tree-sitter-rust");
function getrustFixes(code) {
    const parser = new Parser();
    parser.setLanguage(rust);
    const tree = parser.parse(code);
    const fixes = [];
    const addFix = (node, fixText) => {
        fixes.push({ line: node.startPosition.row + 1, fix: fixText });
    };
    const errorNodes = [
        ...tree.rootNode.descendantsOfType("ERROR"),
        ...tree.rootNode.descendantsOfType("MISSING"),
    ];
    errorNodes.forEach((node) => {
        const txt = node.text;
        // 1-10: Missing curly braces for function, if, loop blocks
        if (/^(fn|if|else if|else|loop|while|for)\s*(\(.*\))?\s*(?!\{)/.test(txt)) {
            addFix(node, "{}");
        }
        // 11-15: Missing semicolons at statement ends where required
        if (/[^;\{\}\s]$/.test(txt) && !txt.endsWith(";") && /^[\s\S]*[a-zA-Z0-9_]+\s*=/.test(txt)) {
            addFix(node, ";");
        }
        // 16-20: Missing parentheses in function calls or definitions
        if (/^fn\s+[a-zA-Z0-9_]+\s*\(.*[^)]$/.test(txt) || /^[a-zA-Z0-9_]+\s*\(.*[^)]$/.test(txt)) {
            addFix(node, ")");
        }
        // 21-25: Mismatched parentheses, braces, brackets
        if (txt.includes("(") && !txt.includes(")"))
            addFix(node, ")");
        if (txt.includes("{") && !txt.includes("}"))
            addFix(node, "}");
        if (txt.includes("[") && !txt.includes("]"))
            addFix(node, "]");
        // 26-30: Unclosed string literals (double quotes, raw strings)
        if (/^("|\br)(?:(?!\1).)*$/.test(txt)) {
            addFix(node, txt[0]);
        }
        // 31-35: Missing commas in tuples, arguments, arrays
        if (/,?[\s\S]*[a-zA-Z0-9_]+\s+[a-zA-Z0-9_]+\s*[^,)\]]/.test(txt)) {
            addFix(node, ",");
        }
        // 36-40: Missing or incorrect assignment operator
        if (/^[a-zA-Z0-9_]+\s+[^=]+\s*[^\s;]+;?/.test(txt)) {
            addFix(node, "=");
        }
        // 41-45: Missing return statements in non-unit functions (heuristic)
        if (/^fn\s+[a-zA-Z0-9_]+\s*\([^)]*\)\s*->\s*[a-zA-Z0-9_]+\s*{/.test(txt) && !/return\s+/.test(txt)) {
            addFix(node, "Add return statement");
        }
        // 46-50: Misuse of reserved Rust keywords as identifiers
        const reserved = [
            "as", "break", "const", "continue", "crate", "else", "enum", "extern",
            "false", "fn", "for", "if", "impl", "in", "let", "loop", "match", "mod",
            "move", "mut", "pub", "ref", "return", "self", "Self", "static", "struct",
            "super", "trait", "true", "type", "unsafe", "use", "where", "while", "async",
            "await", "dyn"
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
//# sourceMappingURL=rustRule.js.map