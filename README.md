# Markdown TOC

##  1. <a name='Summary'></a>Summary 

<!-- vscode-markdown-toc -->
* [Summary](#Summary)
* [Features](#Features)
* [Usage](#Usage)
* [Exemple](#Exemple)
* [About](#About)
* [Roadmap](#Roadmap)

<!-- /vscode-markdown-toc -->

A [Visual Studio Code](https://code.visualstudio.com/) extension that generates a table of contents for your markdown file.

##  2. <a name='Features'></a>Features 

* Generate a Table of Content base on markdown title (from level 2 to 4).
* Replace an existing toc when generate it again
* Numbering your table of contents
* Insert anchor on your titles
* Auto-saving when a toc is generated 

##  3. <a name='Usage'></a>Usage

* Open any markdown file
* Open the command palette (`Ctrl+Shift+P`)
* Type "Generate"
* Choose "Generate TOC for markdown"

##  4. <a name='Exemple'></a>Exemple

```markdown
<!-- vscode-markdown-toc -->
* 1. [Summary](#Summary)
* 2. [Features](#Features)
* 3. [Usage](#Usage)
* 4. [Exemple](#Exemple)
* 5. [About](#About)
* 6. [Roadmap](#Roadmap)

<!-- /vscode-markdown-toc -->

##  1. <a name='Summary'></a>Summary 
##  2. <a name='Features'></a>Features 
##  3. <a name='Usage'></a>Usage
##  4. <a name='Exemple'></a>Exemple 
##  5. <a name='About'></a>About
##  6. <a name='Roadmap'></a>Roadmap
```

##  5. <a name='About'></a>About

This plugin is based on the work of [Kiran Rao](https://github.com/curioustechizen/vscode-markdown-toc), I've updated it to my needs and push my work on [GitHub](https://github.com/joffreykern/vscode-markdown-toc) and published it in the [marketplace](https://marketplace.visualstudio.com/items?itemName=joffreykern.markdown-toc). 

##  6. <a name='Roadmap'></a>Roadmap

* Add a configuration to 
    * enable/disable anchoring
    * enable/disable numbering
    * increase/decrease title's level managed 
* Unit testing

Fell free to submit issues or merge requests ! 