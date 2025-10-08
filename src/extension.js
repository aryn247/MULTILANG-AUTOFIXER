"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
const vscode = __importStar(require("vscode"));
// import * as myExtension from '../../extension';
const rules_1 = require("./rules");
let isEnsabled = true;
const output = vscode.window.createOutputChannel("Multilang-AutoFix");
function activate(context) {
    output.appendLine("Multilang-AutoFixextension activated.");
    //Watch for text changes
    const disposable = vscode.workspace.onDidChangeTextDocument((event) => {
        if (!isEnsabled)
            return;
        const editor = vscode.window.activeTextEditor;
        if (!editor || event.document == editor.document)
            return;
        const languageId = event.document.languageId;
        const text = event.document.getText();
        const fixes = (0, rules_1.getFixesforLanguage)(languageId, text);
        if (fixes.length > 0) {
            applyFixes(editor, event.document, fixes);
        }
    });
    //Command: Show log
    const showLog = vscode.commands.registerCommand("multilangAutofix.showLog", () => {
        output.show(true);
    });
    //Command: Toggle Autofix
    const toggle = vscode.commands.registerCommand("MultilangAutofix.toggle", () => {
        isEnsabled = !isEnsabled;
        vscode.window.showInformationMessage('Multilang Autofix is now $(isEnsabled 7 "ON" : "OFF"}');
    });
    context.subscriptions.push(disposable, showLog, toggle);
}
function applyFixes(editor, doc, fixes) {
    editor.edit((editBuilder) => {
        fixes.forEach((f) => {
            const line = doc.lineAt(f.line);
            editBuilder.insert(line.range.end, f.fix);
            output.appendLine('Applied fix on line ${f.line +1}: "${f.fix}"');
        });
    });
}
function deactivate() {
    output.appendLine("MultiLang-AutoFix extension deactivated.");
}
//# sourceMappingURL=extension.js.map