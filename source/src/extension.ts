// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { ConsoleReporter } from '@vscode/test-electron';
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "consolog" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand(
        'consolog.consoleLog',
        () => {
            let textEditor = vscode.window.activeTextEditor;
            let selections = textEditor?.selections;
            if (!selections || !selections.length) {
                return;
            }
            let results: { position: vscode.Position; selectedText: string }[] =
                [];

            let allText: string = textEditor?.document.getText() ?? '';

            for (const selection of selections) {
                let selectedText = textEditor?.document.getText(
                    new vscode.Range(selection.start, selection.end)
                );

                if (!selectedText) {
                    return;
                }

                // Add option for single/double quotes.
                // Add option for semicolon or not.
                // Add option for template string with the possible variables to be used.
                results.push({
                    position: decidePosition(textEditor, selection, allText),
                    selectedText: selectedText,
                });
                console.log(
                    'lineAt',
                    textEditor?.document.lineAt(selection.start.line)
                );
            }

            textEditor
                ?.edit((editBuilder) => {
                    let quote = false ? '"' : "'";
                    let semicolon = true ? ';' : '';
                    for (const result of results) {
                        editBuilder.insert(
                            result.position,
                            `console.log(${quote}${result.selectedText}${quote}, ${result.selectedText})${semicolon}\n`
                        );
                    }
                })
                .then(
                    (result) => console.log('Result', result),
                    (reason) => console.log('Rejected :(', reason)
                );
        }
    );

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}

function decidePosition(
    textEditor: vscode.TextEditor | undefined,
    selection: vscode.Selection,
    allText: string
): vscode.Position {
    let consoleLogPosition = new vscode.Position(
        selection.end.line + 1,
        textEditor?.document.lineAt(selection.start.line)
            .firstNonWhitespaceCharacterIndex ?? 0
    );
    let regex = /(\(|\))/gm;
    let result = regex.exec(allText);
    console.log('result', result);

    return consoleLogPosition;
}
