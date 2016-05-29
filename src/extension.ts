// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'; 

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "markdown-toc" is now active!'); 

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	var disposable = vscode.commands.registerCommand('extension.markdownToc', markdownTocOptions);
	
	context.subscriptions.push(disposable);
}

function markdownTocOptions() {
  var opts: vscode.QuickPickOptions = {matchOnDescription: true, placeHolder: "How many levels of headings do you want to include in the ToC?"}
  var items: vscode.QuickPickItem[] = [];

	items.push({ label: "1", description: "Only include Level 1 headings" });
	items.push({ label: "2", description: "Include Level 1 and Level 2 headings" });
	items.push({ label: "3", description: "Include Level 1, 2 and 3 headings" });
  
  vscode.window.showQuickPick(items).then((selection) => {
    generateToc();
  });
}

function generateToc() {
  new TocGenerator().process();
}

export class TocGenerator {
  
  public minLevel: number = 2;
  public maxLevel: number = 4;
  public addNumbering: boolean = true;

  private _toc: string = "";
  private _tocStartLine: string  = "<!-- vscode-markdown-toc -->";
  private _tocEndLine: string  = "<!-- /vscode-markdown-toc -->";
  
  process(){
    let headers = new Array<Header>();
    let tocStartLineNumber : number = 0;
    let tocEndLineNumber : number = 0;
    
    let editor = vscode.window.activeTextEditor;
    let doc = editor.document;
    let numLines = doc.lineCount;
    let levels = new Array<number>(); 
    
    for (var index = this.minLevel; index <= this.maxLevel; index++) {
      levels.push(0);
    }
    
    var insideTripleBacktickCodeBlock: boolean = false;

    for (var lineNumber = 0; lineNumber < numLines; lineNumber++) {
      let aLine = doc.lineAt(lineNumber);

      //Ignore empty lines
      if(aLine.isEmptyOrWhitespace) continue;
      
      //Ignore pre-formatted code blocks in the markdown
      if(aLine.firstNonWhitespaceCharacterIndex > 3) continue;
      
      let lineText = aLine.text.trim();      
      
      // Locate if toc was already generated
      if(lineText.startsWith(this._tocStartLine)){
        tocStartLineNumber = lineNumber;
        continue;
      } else if (lineText.startsWith(this._tocEndLine)) {
        tocEndLineNumber = lineNumber;
        continue;
      }
      
      //If we are within a triple-backtick code blocks, then ignore
      if(lineText.startsWith("```")) {
        if(insideTripleBacktickCodeBlock) continue;
        insideTripleBacktickCodeBlock = !insideTripleBacktickCodeBlock;
      }
      
      if(lineText.startsWith("#")) {
        let headerLevel : number = lineText.indexOf(" ");
          
        if(headerLevel >= this.minLevel && headerLevel <= this.maxLevel){
          let level: number = headerLevel - (this.maxLevel - this.minLevel);
          let previousLevel: number = headers.length > 3 ? headers[headers.length - 2].level : this.maxLevel;

          // Have to reset the sublevels
          if(level < previousLevel){
            for (var index = level; index < previousLevel; index++) {
              levels[index + 1] = 0;
            }
          }
          
          // increment current level
          levels[level]++;
          
          headers.push(new Header(
            level, 
            lineText.substring(headerLevel + 1),
            copyObject(levels),
            lineNumber));
        }
      }
    }
    
    var tocSummary = "";
    tocSummary = tocSummary.concat(this._tocStartLine + "\r\n");

    headers.forEach(header => {
      let tocLine = "";
      
      for(let i = 0; i < header.level; i++){
        tocLine = tocLine.concat("\t");
      }
      tocLine = tocLine.concat("*");
      
      if(this.addNumbering){
        let numbering = " ";
        let lastLevel = (this.maxLevel - this.minLevel);
        
        for (let i = 0; i <= lastLevel; i++){
          if(header.numbering[i] > 0) {
            numbering = numbering.concat(header.numbering[i] + ".");
          }
        }
        
        if(numbering != "") {
          tocLine = tocLine.concat(numbering);
        }
      }
      
      tocLine = tocLine.concat(" " + header.title);
      
      if(tocLine != null && tocLine != ""){
        tocSummary = tocSummary.concat(tocLine + "\n");
      }
    });
    tocSummary = tocSummary.concat(this._tocEndLine);
    
    console.log(tocSummary);
    editor.edit((editBuilder: vscode.TextEditorEdit)=>{
      editBuilder.replace(new vscode.Range(tocStartLineNumber, 0, tocEndLineNumber, this._tocEndLine.length), tocSummary);
      return Promise.resolve();
    });
    
    doc.save();
  }
}

function copyObject<T> (object:T): T {
    var objectCopy = <T>{};

    for (var key in object)
    {
        if (object.hasOwnProperty(key))
        {
            objectCopy[key] = object[key];
        }
    }

    return objectCopy;
}

/**
 * Header
 */
class Header {
  level: number;
  title: string;
  numbering: Array<number>;
  lineNumber: number;
  
  constructor(headerLevel:number, title: string, levels: Array<number>, lineNumber: number) {
    this.level = headerLevel;
    this.title = title;
    this.numbering = levels;
    this.lineNumber = lineNumber;
  }
}