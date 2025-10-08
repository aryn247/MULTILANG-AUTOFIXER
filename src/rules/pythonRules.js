"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPythonFixes = getPythonFixes;
const Parser = require("tree-sitter");
const python = require("tree-sitter-python");
function getPythonFixes(code) {
    const parser = new Parser();
    parser.setLanguage(python);
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
        // 1-10: Block structures missing colons
        if (/^\s*(def|class|if|else|elif|while|for|try|except|finally|with|async)\s.*[^:]$/.test(txt)) {
            addFix(node, ":"); // add missing colon
        }
        // 11-15: Function and call missing closing parenthesis
        if (/^\s*def\s+\w+\(.*[^)]$/.test(txt) || /^\s*\w+\(.*[^)]$/.test(txt)) {
            addFix(node, ")");
        }
        // 16-20: Missing commas in argument lists, collections
        if (/,[^,]*\w+\s+[^\),]*/.test(txt)) {
            addFix(node, ",");
        }
        // 21-25: Unclosed string literals (' or ")
        if (/^(['"])(?:(?!\1).)*$/.test(txt)) {
            addFix(node, txt[0]);
        }
        // 26-30: Indentation errors - basic check for spaces or tabs error nodes
        if (/^\s+$/.test(txt)) {
            addFix(node, "Check indentation");
        }
        // 31-35: Misplaced or missing assignment operator (=)
        if (/^\s*\w+\s+[^\=]\s*\S+/.test(txt)) {
            addFix(node, "=");
        }
        // 36-40: Mismatched brackets, braces, missing closing ], }, )
        if (txt.indexOf("[") !== -1 && txt.indexOf("]") === -1) {
            addFix(node, "]");
        }
        if (txt.indexOf("{") !== -1 && txt.indexOf("}") === -1) {
            addFix(node, "}");
        }
        if (txt.indexOf("(") !== -1 && txt.indexOf(")") === -1) {
            addFix(node, ")");
        }
        // 41-45: Using reserved keywords wrongly or misspelled
        const reservedWords = ["False", "await", "else", "import", "pass", "None", "break", "except", "in", "raise",
            "True", "class", "finally", "is", "return", "and", "continue", "for", "lambda", "try", "as", "def",
            "from", "nonlocal", "while", "assert", "del", "global", "not", "with", "async", "elif", "if", "or", "yield"];
        reservedWords.forEach((word) => {
            if (txt.includes(word + " ") && !new RegExp("\\b" + word + "\\b").test(txt)) {
                addFix(node, `Check keyword usage: ${word}`);
            }
        });
        // 46-50: Invalid operators or typo in operators (e.g., := in old Python)
        if (/:\=/.test(txt) && !txt.includes("walrus")) {
            addFix(node, "Replace := operator if unsupported");
        }
        // 51-55: Missing return in functions that expect it
        if (/def\s+\w+\(.*\):\s*[^r]return/.test(txt)) {
            addFix(node, "Add return statement");
        }
        // 56-60: Use of semicolons instead of colons at block boundaries
        if (/^\s*(def|if|while|for|class)\s.*;$/.test(txt)) {
            addFix(node, "Replace semicolon with colon");
        }
        // 61-65: Trailing commas misuse in function calls or definitions
        if (/,\s*\)/.test(txt)) {
            addFix(node, "Remove trailing comma");
        }
        // 66-70: Multiple statements on one line without proper separation
        if (/;[^#\n]/.test(txt)) {
            addFix(node, "Split statements; semicolons discouraged");
        }
        // Add additional rules based on project specifics...
    });
    return fixes;
}
//# sourceMappingURL=pythonRules.js.map