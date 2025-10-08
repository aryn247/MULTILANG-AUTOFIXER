"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFixesforLanguage = getFixesforLanguage;
const pythonRules_1 = require("./pythonRules");
const jsRules_1 = require("./jsRules");
const javaRules_1 = require("./javaRules");
const cppRules_1 = require("./cppRules");
const cRules_1 = require("./cRules");
const phpRules_1 = require("./phpRules");
const goRules_1 = require("./goRules");
const rubyRules_1 = require("./rubyRules");
const rustRule_1 = require("./rustRule");
function getFixesforLanguage(languageId, code) {
    switch (languageId) {
        case "python":
            return (0, pythonRules_1.getPythonFixes)(code);
        case "javascript":
        case " typescript":
            return (0, jsRules_1.getJSFixes)(code);
        case "java":
            return (0, javaRules_1.getJavaFixes)(code);
        case "cpp":
            return (0, cppRules_1.getcppFixes)(code);
        case "c":
            return (0, cRules_1.getcFixes)(code);
        case "php":
            return (0, phpRules_1.getphpFixes)(code);
        case "go":
            return (0, goRules_1.getgoFixes)(code);
        case "ruby":
            return (0, rubyRules_1.getrubyFixes)(code);
        case "rust":
            return (0, rustRule_1.getrustFixes)(code);
        default:
            return [];
    }
}
//# sourceMappingURL=index.js.map