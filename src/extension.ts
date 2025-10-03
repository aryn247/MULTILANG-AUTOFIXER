import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
// import * as myExtension from '../../extension';
import { getFixesForLanguage } from "./rules"



let isEnsabled = true;
const output =vscode.window.createOutputChannel("Multilang-AutoFix");

export function activate(context:vscode.ExtensionContext) { output.appendLine("Multilang-AutoFixextension activated.");

	//Watch for text changes
const disposable = vscode.workspace.onDidChangeTextDocument((event) => {
	if (!isEnsabled) return;

	const editor = vscode.window.activeTextEditor;
	if (!editor|| event.document ! == editor.document) return ;
	const languageId=	event.document.languageId;
	const text = event.document.getText();
	const fixes = getFixesForLanguage(languageId,text);
	
	if ( fixes.length>0){
		applyFixes(editor,event.document,fixes);
	}
}) ;

//Command: Show log
const showLog = vscode.commands.registerCommand(
	"multilangAutofix.showLog",
	() => {
		output.show(true);
	}
);

//Command: Toggle Autofix
const toggle= vscode.commands.registerCommand(
	"MultilangAutofix.toggle",
	()=>{
		isEnsabled = !isEnsabled;
		vscode.window.showInformationMessage(
			'Multilang Autofix is now $(isEnsabled 7 "ON" : "OFF"}'
		);
	}
);

context.subscriptions.push(disposable,showLog, toggle);
}

function applyFixes(
	editor: vscode.TextEditor,
	doc: vscode.TextDocument,
	fixes: { line: number; fix:string} []
){
	editor.edit((editBuilder) => {
		fixes.forEach((f)=> {
			const line = doc.lineAt(f.line);
			editBuilder.insert(line.range.end, f.fix);
			output.appendLine('Applied fix on line ${f.line +1}: "${f.fix}"');
		});
	});
}

export function deactivate() {
	output.appendLine("MultiLang-AutoFix extension deactivated.") ;
}
