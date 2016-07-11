# Markdown TOC

##  1. <a name='Summary-0'></a>Summary 

<!-- vscode-markdown-toc -->
* 1. [Summary](#Summary-0)
* 2. [Features](#Features-1)
* 3. [Usage](#Usage-2)
* 4. [Exemple](#Exemple-3)
* 5. [About](#About-4)
* 6. [Roadmap](#Roadmap-5)
<!-- /vscode-markdown-toc -->


A [Visual Studio Code](https://code.visualstudio.com/) extension that generates a table of contents for your markdown file.

##  2. <a name='Features-1'></a>Features 

* Generate a Table of Content base on markdown title (from level 2 to 4).
* Replace an existing toc when generate it again
* Numbering your table of contents
* Insert anchor on your titles
* Auto-saving when a toc is generated 

##  3. <a name='Usage-2'></a>Usage

* Open any markdown file
* Open the command palette (`Ctrl+Shift+P`)
* Type "Generate"
* Choose "Generate TOC for markdown"

##  4. <a name='Exemple-3'></a>Exemple

```markdown
<!-- vscode-markdown-toc -->
* 1. [Summary](#Summary-0)
* 2. [Features](#Features-1)
* 3. [Usage](#Usage-2)
* 4. [Exemple](#Exemple-3)
* 5. [About](#About-4)
* 6. [Roadmap](#Roadmap-5)
<!-- /vscode-markdown-toc -->

##  1. <a name='Summary-0'></a>Summary 
##  2. <a name='Features-1'></a>Features 
##  3. <a name='Usage-2'></a>Usage
##  4. <a name='Exemple-3'></a>Exemple 
##  5. <a name='About-4'></a>About
##  6. <a name='Roadmap-5'></a>Roadmap
```

##  5. <a name='About-4'></a>About

This plugin is based on the work of [Kiran Rao](https://github.com/curioustechizen/vscode-markdown-toc), I've updated it to my needs and push my work on [GitHub](https://github.com/joffreykern/vscode-markdown-toc) and published it in the [marketplace](https://marketplace.visualstudio.com/items?itemName=joffreykern.markdown-toc). 

##  6. <a name='Roadmap-5'></a>Roadmap

* Add a configuration to 
    * enable/disable anchoring
    * enable/disable numbering
    * increase/decrease title's level managed 
* Update anchoring to be based on something better than ``index in my list``... If you add another title at the top of your document, every titles will be updates.
* Unit testing

Fell free to submit issues or merge requests ! 