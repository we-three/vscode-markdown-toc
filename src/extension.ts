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
	var disposable = vscode.commands.registerCommand('extension.markdownToc', () => {  new TocGenerator().process()});
	
	context.subscriptions.push(disposable);
}

export class TocGenerator {
  
  public minLevel: number = 2;
  public maxLevel: number = 4;
  public addNumbering: boolean = true;
  public addAnchor: boolean = true;

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
          let title: string = lineText.substring(headerLevel + 1);
          let endAnchor: string = "</a>";
          
          // Remove anchor in the title
          if(title.indexOf(endAnchor) > 0) {
            title = title.substring(title.indexOf(endAnchor)  + endAnchor.length);
          }
          
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
            title,
            copyObject(levels),
            lineNumber,
            lineText.length,
            headers.length));
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
        let numbering = this.buildNumbering(header.numbering);
        if(numbering != "") {
          tocLine = tocLine.concat(numbering);
        }
      }
      
      if(this.addAnchor) {
        tocLine = tocLine.concat(" [" + header.title+ "](#" + header.anchor +")");
      } else {
        tocLine = tocLine.concat(" " + header.title);
      }
      
      if(tocLine != null && tocLine != ""){
        tocSummary = tocSummary.concat(tocLine + "\n");
      }
    });
    tocSummary = tocSummary.concat(this._tocEndLine);
    
    console.log(tocSummary);
    editor.edit((editBuilder: vscode.TextEditorEdit)=>{
      headers.forEach(header => {
        let lineText : string = "";
        for (var index = 0; index < (header.level + this.maxLevel - this.minLevel); index++) {
          lineText = lineText.concat('#');
        }
        
        if(this.addNumbering) {
          lineText = lineText.concat(" " + this.buildNumbering(header.numbering));
        }
        
        lineText = lineText.concat(" ");
        
        if(this.addAnchor){
          lineText = lineText.concat("<a name='" + header.anchor +"'></a>");
        }
        
        lineText = lineText.concat(header.title);
        editBuilder.replace(new vscode.Range(header.lineNumber, 0, header.lineNumber, header.lineLength), lineText);
      });
      
      if(tocStartLineNumber + tocEndLineNumber == 0){
        editBuilder.insert(new vscode.Position(0, 0), tocSummary);
      } else {
        editBuilder.replace(new vscode.Range(tocStartLineNumber, 0, tocEndLineNumber, this._tocEndLine.length), tocSummary);
      }

      
      return Promise.resolve();
    });
    
    doc.save();
  }
  
  buildNumbering(numberings: Array<number>) : string {
    let numbering = " ";
    let lastLevel = (this.maxLevel - this.minLevel);
    
    for (let i = 0; i <= lastLevel; i++){
      if(numberings[i] > 0) {
        numbering = numbering.concat(numberings[i] + ".");
      }
    }
    
    return numbering;
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
  anchor: string;
  lineNumber: number;
  lineLength: number;

  constructor(headerLevel:number, 
      title: string, 
      levels: Array<number>, 
      lineNumber: number, 
      lineLength: number,
      index: number) {
    this.level = headerLevel;
    this.title = title;
    this.numbering = levels;
    this.lineNumber = lineNumber;
    this.lineLength = lineLength;
    this.anchor = title.replace(/[^a-z0-9\-_:\.]|^[^a-z]+/gi, "") + "-" + index;
  }
}