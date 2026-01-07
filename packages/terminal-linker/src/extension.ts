// extension.ts
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    console.log('Terminal Link Provider Extension aktiviert');

    // Terminal Link Provider registrieren
    const linkProvider = vscode.window.registerTerminalLinkProvider({
        provideTerminalLinks: (context: vscode.TerminalLinkContext, token: vscode.CancellationToken) => {
            const links: vscode.TerminalLink[] = [];
            
            // Beispiel-Patterns (können in settings.json konfiguriert werden)
            const patterns = [
                // File Search: 📄filename oder 📁directory
                {
                    regex: /([📄📁])([^\s]+)/g,
                    urlTemplate: null,
                    isFileSearch: true
                },
                // Codebase Search: 🔹NUSqE (emoji + alphanumerischer Code)
                {
                    regex: /([^\w\s])([A-Za-z0-9]{5,25})\b/g,
                    urlTemplate: null,
                    isCodebaseSearch: true
                },
                // JIRA Tickets: ABC-1234
                {
                    regex: /\b[A-Z]{2,}-\d+\b/g,
                    urlTemplate: 'https://jira.example.com/browse/$0'
                },
                // GitHub Issues: #123
                {
                    regex: /#(\d+)\b/g,
                    urlTemplate: 'https://github.com/your-org/your-repo/issues/$1'
                },
                // File paths mit Zeilennummern: file.ts:123
                {
                    regex: /([a-zA-Z0-9_\-\/\.]+\.(ts|js|py|java|cpp|c|h)):(\d+)/g,
                    urlTemplate: null, // Spezialbehandlung für Dateien
                    isFilePath: true
                }
            ];

            // Konfigurierbare Patterns aus Settings laden
            const config = vscode.workspace.getConfiguration('terminalLinkProvider');
            const customPatterns = config.get<Array<{pattern: string, url: string}>>('customPatterns', []);

            // Alle Patterns durchgehen
            [...patterns, ...customPatterns.map(cp => ({
                regex: new RegExp(cp.pattern, 'g'),
                urlTemplate: cp.url,
                isFilePath: false
            }))].forEach(patternConfig => {
                const matches = [...context.line.matchAll(patternConfig.regex)];
                
                matches.forEach(match => {
                    if (match.index !== undefined) {
                        const startIndex = match.index;
                        const length = match[0].length;
                        
                        // TerminalLink erstellen
                        const link: vscode.TerminalLink = {
                            startIndex,
                            length,
                            tooltip: patternConfig.isFileSearch
                                ? `Datei suchen: ${match[0]}`
                                : patternConfig.isCodebaseSearch
                                ? `Codebase durchsuchen: ${match[0]}`
                                : patternConfig.isFilePath 
                                ? `Datei öffnen: ${match[0]}` 
                                : `Link öffnen: ${match[0]}`,
                            data: {
                                match: match[0],
                                groups: match.slice(1),
                                urlTemplate: patternConfig.urlTemplate,
                                isFilePath: patternConfig.isFilePath,
                                isCodebaseSearch: patternConfig.isCodebaseSearch,
                                isFileSearch: patternConfig.isFileSearch
                            }
                        };
                        
                        links.push(link);
                    }
                });
            });

            return links;
        },
        
        handleTerminalLink: (link: vscode.TerminalLink) => {
            const data = link.data as any;
            
            if (data.isFileSearch) {
                // Dateisuche ausführen
                const searchTerm = data.groups[1]; // Der Dateiname ohne Emoji
                
                // Quick Open mit Dateisuche
                vscode.commands.executeCommand('workbench.action.quickOpen', searchTerm);
                
            } else if (data.isCodebaseSearch) {
                // Codebase-Suche ausführen
                const searchTerm = data.groups[1]; // Der alphanumerische Teil ohne das Emoji
                
                // VS Code's eingebaute Suche verwenden
                vscode.commands.executeCommand('workbench.action.findInFiles', {
                    query: searchTerm,
                    triggerSearch: true,
                    matchWholeWord: false,
                    isCaseSensitive: true,
                    isRegex: false
                });
                
            } else if (data.isFilePath) {
                // Datei öffnen
                const [filePath, lineNum] = data.match.split(':');
                const line = parseInt(lineNum) - 1; // 0-basiert
                
                // Workspace root finden
                const workspaceFolders = vscode.workspace.workspaceFolders;
                if (workspaceFolders) {
                    const fullPath = vscode.Uri.joinPath(workspaceFolders[0].uri, filePath);
                    vscode.window.showTextDocument(fullPath, {
                        selection: new vscode.Range(line, 0, line, 0)
                    });
                }
            } else if (data.urlTemplate) {
                // URL generieren
                let url = data.urlTemplate;
                
                // $0 durch gesamten Match ersetzen
                url = url.replace('$0', data.match);
                
                // $1, $2, etc. durch Capture Groups ersetzen
                data.groups.forEach((group: string, index: number) => {
                    url = url.replace(`$${index + 1}`, group);
                });
                
                // URL öffnen
                vscode.env.openExternal(vscode.Uri.parse(url));
            }
        }
    });

    context.subscriptions.push(linkProvider);
}

export function deactivate() {}