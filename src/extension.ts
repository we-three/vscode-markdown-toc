// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'; 
import { List } from './linq';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "markdown-toc" is now active!'); 

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	var command = vscode.commands.registerCommand('extension.markdownToc', () => 
  {  
    new TocGenerator().process()
  });
	
	context.subscriptions.push(command);
}

export class TocGenerator {
  private _configuration: TocConfiguration;

  private _tocStartLine: string  = "<!-- vscode-markdown-toc -->";
  private _tocEndLine: string  = "<!-- /vscode-markdown-toc -->";
  private _tocStartLineNumber : number = 0;
  private _tocEndLineNumber : number = 0;
  private _endAnchor: string = "</a>";

  process(){
    let editor = vscode.window.activeTextEditor;
    let doc = editor.document;

    this._configuration = this.readConfiguration(doc);
    let headers : List<Header> = this.buildHeaders(this.buildLineHeaders(doc));
    let tocSummary : string = this.buildSummary(headers);
    console.log(tocSummary);

    editor.edit((editBuilder: vscode.TextEditorEdit)=>{
      headers.ForEach(header => {
        let lineText : string = "";
        for (var index = 0; index < (header.level + this._configuration.MaxLevel - this._configuration.MinLevel); index++) {
          lineText = lineText.concat('#');
        }
        
        if(this._configuration.Numbering) {
          lineText = lineText.concat(" " + this.buildNumbering(header.numbering));
        }
        
        if(this._configuration.Anchor){
          lineText = lineText.concat(" <a name='" + header.anchor +"'></a>");
        }
        
        lineText = lineText.concat(header.title);
        editBuilder.replace(new vscode.Range(header.lineNumber, 0, header.lineNumber, header.lineLength), lineText);
      });
      
      if(this._tocStartLineNumber + this._tocEndLineNumber == 0){
        editBuilder.insert(new vscode.Position(0, 0), tocSummary);
      } else {
        editBuilder.replace(new vscode.Range(this._tocStartLineNumber, 0, this._tocEndLineNumber, this._tocEndLine.length), tocSummary);
      }
      
      return Promise.resolve();
    });
    
    if(this._configuration.AutoSave) {
      doc.save();
    }
  }

  buildSummary(headers : List<Header>) : string {
    let tocSummary : string = this._tocStartLine + "\r\n";

    headers.ForEach(header => {
      let tocLine : string = "";
      
      for(let i = 0; i < header.level; i++){
        tocLine = tocLine.concat("\t");
      }
      tocLine = tocLine.concat("*");
      
      if(this._configuration.Numbering){
        let numbering = this.buildNumbering(header.numbering);
        if(numbering != "") {
          tocLine = tocLine.concat(numbering);
        }
      }
      
      if(this._configuration.Anchor) {
        tocLine = tocLine.concat(" [" + header.title + "](#" + header.anchor + ")");
      } else {
        tocLine = tocLine.concat(" " + header.title);
      }
      
      if(tocLine != null && tocLine != ""){
        tocSummary = tocSummary.concat(tocLine + "\n");
      }
    });

    tocSummary = tocSummary.concat("\n" + this._configuration.Build());
    tocSummary = tocSummary.concat("\n" + this._tocEndLine);

    return tocSummary;
  }
  
  buildNumbering(numberings: Array<number>) : string {
    let numbering = " ";
    let lastLevel = (this._configuration.MaxLevel - this._configuration.MinLevel);
    
    for (let i = 0; i <= lastLevel; i++){
      if(numberings[i] > 0) {
        numbering = numbering.concat(numberings[i] + ".");
      }
    }
    
    return numbering;
  }

  buildHeaders(lines: List<Header>) : List<Header> {
    let headers : List<Header> = new List<Header>();
    let levels = new Array<number>(); 

    for (var index = this._configuration.MinLevel; index <= this._configuration.MaxLevel; index++) {
      levels.push(0);
    }

    lines.Where(x => x.level >= this._configuration.MinLevel && x.level <= this._configuration.MaxLevel).ForEach(header => {
      header.level = header.level - (this._configuration.MaxLevel - this._configuration.MinLevel);      

      if(this._configuration.Anchor) {
        header.setAnchorUnique(headers.Count(x => x.anchor == header.anchor));
      }

      if(this._configuration.Numbering) {
        // Have to reset the sublevels
        for (var index = header.level; index < this._configuration.MaxLevel - this._configuration.MinLevel; index++) {
          levels[index + 1] = 0;
        }

        // increment current level
        levels[header.level]++;

        header.numbering = copyObject(levels);
      }

      headers.Add(header);
    });

    return headers;
  }

  readConfiguration(doc: vscode.TextDocument) : TocConfiguration {
    let tocConfiguration: TocConfiguration = new TocConfiguration();
    let readingConfiguration: boolean = false;
    
    for (var lineNumber = 0; lineNumber < doc.lineCount; lineNumber++) {
      let lineText: string = doc.lineAt(lineNumber).text.trim();

      // Break the loop, cause we read the configuration
      if(lineText.startsWith(tocConfiguration.EndLine)) {
        break;
      }

      if(lineText.startsWith(tocConfiguration.StartLine)) {
        readingConfiguration = true;
        continue;
      }

      if(readingConfiguration) {
        tocConfiguration.Read(lineText);
      }
    }

    return tocConfiguration;
  }

  buildLineHeaders(doc: vscode.TextDocument) : List<Header> {
    let headers = new List<Header>();
    let insideTripleBacktickCodeBlock: boolean = false;

    for (var lineNumber = 0; lineNumber < doc.lineCount; lineNumber++) {
      let aLine = doc.lineAt(lineNumber);

      //Ignore empty lines
      if(aLine.isEmptyOrWhitespace) continue;
      
      //Ignore pre-formatted code blocks in the markdown
      if(aLine.firstNonWhitespaceCharacterIndex > 3) continue;
      
      let lineText = aLine.text.trim();
      
      // Locate if toc was already generated
      if(lineText.startsWith(this._tocStartLine)){
        this._tocStartLineNumber = lineNumber;
        continue;
      } else if (lineText.startsWith(this._tocEndLine)) {
        this._tocEndLineNumber = lineNumber;
        continue;
      }
      
      //If we are within a triple-backtick code blocks, then ignore
      if(lineText.startsWith("```")) {
        insideTripleBacktickCodeBlock = !insideTripleBacktickCodeBlock;
      }

      if(insideTripleBacktickCodeBlock){
        continue;
      }
      
      if(lineText.startsWith("#")) {
        let headerLevel : number = lineText.indexOf(" ");
        let title: string = lineText.substring(headerLevel + 1);
          
        // Remove anchor in the title
        if(title.indexOf(this._endAnchor) > 0) {
          title = title.substring(title.indexOf(this._endAnchor)  + this._endAnchor.length);
        }

        headers.Add(new Header(
          headerLevel,
          title, 
          lineNumber, 
          lineText.length));
      }
    }

    return headers;
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

class TocConfiguration {
  public Numbering: boolean;
  public Anchor: boolean;
  public AutoSave: boolean;
  public MinLevel: number;
  public MaxLevel: number;

  public StartLine: string = "<!-- vscode-markdown-toc-config";
  public EndLine: string = "/vscode-markdown-toc-config -->";

  private _numberingKey: string = "numbering=";
  private _anchorKey: string = "anchor=";
  private _autoSaveKey: string = "autoSave=";
  private _minLevelKey: string = "minLevel=";
  private _maxLevelKey: string = "maxLevel=";

  constructor(numbering: boolean = true,
    anchor: boolean = true,
    autoSave: boolean = true,
    minLevel: number = 2,
    maxLevel: number = 4) {
      this.Numbering = numbering;
      this.Anchor = anchor;
      this.AutoSave = autoSave;
      this.MinLevel = minLevel;
      this.MaxLevel = maxLevel;
  }

  public Read(lineText: string) {
    if(this.readable(lineText, this._numberingKey)) {
      this.Numbering = this.toBoolean(lineText, this._numberingKey);
    } else if (this.readable(lineText, this._autoSaveKey)) {
      this.AutoSave = this.toBoolean(lineText, this._autoSaveKey);
    }
    // else if (this.readable(lineText, this._anchorKey)) {
    //   this.Anchor = this.toBoolean(lineText, this._anchorKey);
    // } else if (this.readable(lineText, this._minLevelKey)) {
    //   this.MinLevel = this.toNumber(lineText, this._minLevelKey);
    // } else if (this.readable(lineText, this._maxLevelKey)) {
    //   this.MaxLevel = this.toNumber(lineText, this._maxLevelKey);
    // }
  }

  public Build() : string {
    let configuration : string = this.StartLine;
    configuration = configuration.concat("\n\t" + this._numberingKey + this.Numbering);
    configuration = configuration.concat("\n\t" + this._autoSaveKey + this.AutoSave);
    // configuration = configuration.concat("\n\t" + this._anchorKey + this.Anchor);
    // configuration = configuration.concat("\n\t" + this._minLevelKey + this.MinLevel);
    // configuration = configuration.concat("\n\t" + this._maxLevelKey + this.MaxLevel);
    configuration = configuration.concat("\n\t" + this.EndLine);

    return configuration;
  }

  private readable(lineText: string, key:string): boolean {
    return (lineText.startsWith(key));
  }

  private toBoolean(lineText: string, key: string) : boolean {
    lineText = this.extractValue(lineText, key);
    return (lineText.startsWith("y") || lineText.startsWith("true"));
  }

  private toNumber(lineText: string, key: string) : number {
    return Number.parseInt(this.extractValue(lineText, key));
  }

  private extractValue(lineText: string, key: string) : string {
    return lineText.substr(key.length, (lineText.length - key.length)).trim().toLowerCase();
  }
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

  constructor(headerLevel: number,
      title: string,
      lineNumber: number,
      lineLength: number) {
        this.level = headerLevel;
        this.title = title;
        this.lineNumber = lineNumber;
        this.lineLength = lineLength;
        this.anchor = this.title.replace(/[^a-z0-9\-_:\.]|^[^a-z]+/gi, "");
  }

  setAnchorUnique(index: number){
    if(index > 0){
      this.anchor = this.anchor + "-" + index;
    }
  }
}