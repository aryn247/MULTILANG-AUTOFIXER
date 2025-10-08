"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJavaFixes = getJavaFixes;
const Parser = require("tree-sitter");
const Java = require("tree-sitter-java");
function getJavaFixes(code) {
    const parser = new Parser();
    parser.setLanguage(Java);
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
        // 1-10: Missing semicolons at end of statements
        if (/[^;{}\s]$/.test(txt) && /;$/.test(txt) === false && /^\s*(int|float|double|char|boolean|String|var|long|void|public|private|protected|static|final|class|if|for|while|switch|try|return)/.test(txt)) {
            addFix(node, ";");
        }
        // 11-15: Missing curly braces for blocks
        if (/^(if|else if|else|for|while|do|switch|try|catch|finally)\s*[\(]?.*[\)]?\s*(?!\{)/.test(txt)) {
            addFix(node, "{}");
        }
        // 16-20: Missing parentheses in method calls or definitions
        if (/^\s*(public|private|protected)?\s*[a-zA-Z0-9]+\s+[a-zA-Z0-9]+\s*\(.*[^)]$/.test(txt) || /^\s*[a-zA-Z0-9]+\s*\(.*[^)]$/.test(txt)) {
            addFix(node, ")");
        }
        // 21-25: Mismatched parentheses, brackets, braces
        if (txt.indexOf("(") !== -1 && txt.indexOf(")") === -1) {
            addFix(node, ")");
        }
        if (txt.indexOf("{") !== -1 && txt.indexOf("}") === -1) {
            addFix(node, "}");
        }
        if (txt.indexOf("[") !== -1 && txt.indexOf("]") === -1) {
            addFix(node, "]");
        }
        // 26-30: Missing import statements for common classes (simple heuristic)
        if (/^[A-Z][a-zA-Z0-9_]*\s+[a-zA-Z0-9_]+;/.test(txt) && !txt.includes("import")) {
            addFix(node, "Missing import statement");
        }
        // 31-35: Unclosed string literals
        if (/^"(?:[^"\\]|\\.)*$/.test(txt)) {
            addFix(node, "\"");
        }
        // 36-40: Incorrect assignment operator usage or missing
        if (/^\s*[a-zA-Z0-9_]+\s+[^=]\s*[^;]+;/.test(txt)) {
            addFix(node, "=");
        }
        // 41-45: Missing return statement in non-void methods
        if (/^[^;{}]*\breturn\b/.test(txt) === false && /.*\(.*\).*/.test(txt) && !/void/.test(txt)) {
            addFix(node, "Missing return statement");
        }
        // 46-50: Usage of reserved keywords as identifiers
        const reserved = ["abstract", "assert", "boolean", "break", "byte", "case", "catch", "char",
            "class", "const", "continue", "default", "do", "double", "else", "enum",
            "extends", "final", "finally", "float", "for", "goto", "if", "implements",
            "import", "instanceof", "int", "interface", "long", "native", "new", "package",
            "private", "protected", "public", "return", "short", "static", "strictfp",
            "super", "switch", "synchronized", "this", "throw", "throws", "transient",
            "try", "void", "volatile", "while"];
        reserved.forEach((word) => {
            if (txt.includes(word + " ") && !new RegExp("\\b" + word + "\\b").test(txt)) {
                addFix(node, `Check reserved keyword usage: ${word}`);
            }
        });
        // 51-55: Missing package declarations in files with package structure
        if (/^\s*(class|interface|enum)\s+/.test(txt) && !txt.includes("package")) {
            addFix(node, "Missing package declaration");
        }
        // 56-60: Trailing commas in parameter lists or arrays (Java doesn't allow trailing commas)
        if (/,\s*[\)\]]/.test(txt)) {
            addFix(node, "Remove trailing comma");
        }
        // 61-65: Missing annotations (@Override, @Deprecated etc.) when needed (heuristic)
        if (/^public\s+(void|int|String|double|float|char|boolean)\s+.*\(.*\)\s*{/.test(txt) && !/@Override/.test(txt)) {
            addFix(node, "Consider adding @Override annotation if overriding");
        }
        // 66-70: Multiple statements on one line without proper separation (semicolon missing)
        if (/;[^#\n]/.test(txt) === false && /\S+\s+\S+/.test(txt)) {
            addFix(node, "Separate statements with semicolons");
        }
    });
    return fixes;
}
//# sourceMappingURL=javaRules.js.map