// TeXworksScript
// Title: Fic Conversion
// Description: A batch search and replace script intended for use
//              converting Ao3 HTML to Latex. Also converts to Latex
//              quotes, both single and double, converts many Unicode
//              to Latex commands, and addresses some common
//              typographical issues.
// Author: JellyCat (based on Lua code by Paulo Cereda:
//         https://tex.stackexchange.com/questions/84668/search-replace-script-for-texworks)
// Version: 1.6.0
// Script-Type: standalone
// Context: TeXDocument

// ===================================================
// Replacement Lists
// ===================================================

// First list is what to find in the doc, second is what to replace
// those with. Make sure both lists have the exact same number of
// items! This part is used for exact patterns like HTML codes or a
// specific Unicode->Latex command conversion.
// NOTE: -Remember to use \\ to define Latex functions.
//       -uline and sout require package ulem.

/* var patternsToLook =  [
    // Tweaks (used for converting unusual formatting)
    "<p class=\"MsoNoSpacing\">",  "</p><p>", "", // <-this contains u+0094. i'd have two nickels which isn't much, etc.
    // HTML (main)
    "<p>", "</p>", "<u>", "</u>", "<i>", "</i>", "<b>", "</b>", "<strong>", "</strong>", 
    "<br/>", "<br />", "<br>", "<em>", "</em>", "<strike>", "</strike>", "<blockquote>", "</blockquote>",
    // Remove empty par breaks
    "<p> </p>", "<p></p>",
    // Latex syntax 
    "...", "…", "—",
    // HTML character codes
    "&amp;", "&#38;", "&num;", "&#35;", "&dollar;", "&#36;", "&percnt;", "&#37;",
    "&quot;", "&#34;", "&hellip;", "&#8230;", "&mdash;", "&#8212;",
    //Accented letters actually work fine - check html versions?)

];
var valuesToReplace = [
    // Tweaks (used for converting unusual formatting)
    "<p>", "<p></p>", "\"",
    // HTML (main) (Could use \\par instead of \r if preferred. I just like 
    // to use double spacing between paragraphs.)
    "\r", "\r", "\\uline{", "}", "\\emph{", "}", "\\textbf{", "}", "\\textbf{", "}",
    "\r", "\r", "\r", "\\emph{", "}", "\\sout{", "}", "\\begin{quotation}", "\\end{quotation}",
    // Remove empty par breaks
    "","",
    // Latex syntax 
    "\\ldots{}", "\\ldots{}", "---",
    // HTML character codes
    "\\&", "\\&", "\\#", "\\#", "\\$", "\\$", "\\%", "\\%",
    "\"", "\"", "\\ldots{}", "\\ldots{}", "---", "---",
]; 41*/

var patterns = [
  {
    patternToLook: [
      '<p class="MsoNoSpacing">',
      "</p><p>",
      "<p>",
      "</p>",
      "<br/>",
      "<br />",
      "<br>",
    ],
    valueToReplace: "\r",
  },
  {
    patternToLook: ["", "&quot;", "&#34;"],
    valueToReplace: '"',
  },
  {
    patternToLook: ["<u>"],
    valueToReplace: "\\uline{",
  },
  {
    patternToLook: ["<i>", "<em>"],
    valueToReplace: "\\emph{",
  },
  {
    patternToLook: ["<b>", "<strong>"],
    valueToReplace: "\\textbf{",
  },
  {
    patternToLook: ["<strike>"],
    valueToReplace: "\\sout{",
  },
  {
    patternToLook: ["</u>", "</i>", "</b>", "</strong>", "</em>", "</strike>"],
    valueToReplace: "}",
  },
  {
    patternToLook: ["<blockquote>"],
    valueToReplace: "\\begin{quotation}",
  },
  {
    patternToLook: ["</blockquote>"],
    valueToReplace: "\\end{quotation}",
  },
  {
    patternToLook: ["<p> </p>", "<p></p>"],
    valueToReplace: "",
  },
  {
    patternToLook: ["...", "…", "&hellip;", "&#8230;"],
    valueToReplace: "\\ldots{}",
  },
  {
    patternToLook: ["—", "&mdash;", "&#8212;"],
    valueToReplace: "---",
  },
  {
    patternToLook: ["&amp;", "&#38;"],
    valueToReplace: "\\&",
  },
  {
    patternToLook: ["&num;", "&#35;"],
    valueToReplace: "\\#",
  },
  {
    patternToLook: ["&dollar;", "&#36;"],
    valueToReplace: "\\$",
  },
  {
    patternToLook: ["&percnt;", "&#37;"],
    valueToReplace: "\\%",
  },
];
// </p><p> </p><p> -> <p></p>  convert manual double spacing?
// ====================================================================
// Actual Code. Probably don't edit this unless you need to add
// additional functionality.
// ====================================================================

// Verify array lengths match.
// if (patternsToLook.length === valuesToReplace.length) {
// Grab the whole document text.
var text = TW.target.text;
if (text) {
  // Implement replacement lists.
  //for (var i = 0; i < patternsToLook.length; i++) {
  patterns.forEach(matchAndReplace);

  function matchAndReplace(pattern) {
    var currentPattern = pattern.patternToLook;
    var currentReplacement = pattern.valueToReplace;

    for (var i = 0; i < currentPattern.length; i++) {
      // Escape characters to treat as literal text, not regex rules.
      var escapedPattern = currentPattern.replace(
        /[-\/\\^$*+?.()|[\]{}]/g,
        "\\$&",
      );
      var regex = new RegExp(escapedPattern, "g");
    }

    text = text.replace(regex, currentReplacement);
  }
  //}
  // ===================================
  // Remove empty formatting markers
  // ===================================

  // text = text.replace(/\r(\s*)\\(\w+)\{\s*\}/g, ""); //empty commands on empty lines -> delete || unnecessary?
  text = text.replace(/\s*\\(textbf|emph|uline|sout)\{\s*\})/g, ""); // empty formatting commands
  // Empty Latex environments (quotation)?
  // ===================================
  // Misc fixes
  // ===================================

  text = text.replace(/([^\\])([#\$%&])/g, "$1\\$2"); // #,$,etc -> \#, \$, etc || how to handle ### ? currently -> \##\# (running 2x works)

  // ===================================
  // Replace spaces in wrong spots
  // ===================================

  text = text.replace(/(\w)\\(ldots)\{\s*\}([\w\\])/g, "$1\\$2{} $3"); // foo\ldots{}bar -> foo\ldots{} bar (preference)
  text = text.replace(/([\w,!'\.\?])\\(\w+)\{\s(.+?)\}/g, "$1 \\$2{$3}"); // foo\emph{ bar} -> foo \emph{bar}
  text = text.replace(/\\(\w+)\{(.+?)\s\}/g, "\\$1{$2} "); // \emph{bar } -> \emph{bar}\s
  text = text.replace(/[^\S\r\n]([,\.\?!])/g, "$1"); // words . -> words.
  text = text.replace(/([,\.\?!])([a-zA-Z]+)/g, "$1 $2"); // foo.bar -> foo. bar
  text = text.replace(/[\r\n]+[^\S\r\n]*[\r\n]+/g, "\r\r"); // replace triple+ par breaks (messy?)
  text = text.replace(/[^\S\r\n][^\S\r\n]/g, " "); // foo  bar -> foo bar
  text = text.replace(
    /\\(emph|textbf)\{(\w+)\}\s*\\\1\{(\w+[,\.\?!']*)\}/g,
    "\\$1{$2 $3}",
  ); // \emph{foo} \emph{bar} -> \emph{foo bar}

  // ===================================
  // Quote conversion and handling
  // ===================================

  /* Including smart/unicode quotes.
    Note that quote handling should almost alwayys be the last step - any additional 
    features should likely go above this. */

  text = text.replace(/([\s*\w"“\}])--([\s*\w"”])/g, "$1---$2"); // em dash conversion
  text = text.replace(/[^\S\r\n]---[^\S\r\n]/g, "---"); // close up em dashes

  /* Convert double quotes around em dashes. This is styled for
        dialog starting/ending mid-sentence since I encounter this
        most often. */
  text = text.replace(/"---|“---/g, "``---");
  text = text.replace(/---"|---”/g, "---''");
  text = text.replace("---}", "}---");
  // Convert opening double quotes
  text = text.replace(/(^|\s)[“"]/g, "$1``");
  // Convert closing double quotes: any remaining "
  text = text.replace(/[”"]/g, "''");

  // Convert opening single quotes
  text = text.replace(/(^|\s|``|\{)[‘']([^'])/g, "$1`$2"); // prevents replacing half of a double quote or plain apostrophes
  // Convert closing single quotes and apostrophes
  text = text.replace(/’/g, "'");

  // Move quotes outside formatting commands (needed? check spacing)
  text = text.replace(/('')\s*\}/g, "}''"); // ``foo \emph{bar''} -> ``foo \emph{bar}''
  text = text.replace(/(')\s*\}/g, "}'");

  // Insert spaces between text and open/close quotes
  text = text.replace(/('')(\w)/g, "$1 $2"); // ...foo''bar -> ...foo'' bar
  text = text.replace(/(\w|[,\.\?!]|\})(``)/g, "$1 $2"); // ...foo``bar -> ...foo ``bar

  // Replace document with cleaned text
  TW.target.selectAll();
  TW.target.insertText(text);
}
//}
// In case replacement lists are not the same length
//else {
//TW.information(null, "Uneven Lists",
// "The number of patterns and replacements must match.");
//}

/*
====================================================================
    TBD: 
====================================================================
-move punctuation inside formatting (\emph{Maybe}? -> \emph{Maybe?}) (outside can cause odd spacing)
-check support for other fic archives (Currently checked: Ao3, Fimfiction)
    -might not be possible for sites w/o an official "download" option. Formatting dependent?
-add support for html codes for symbols (or whatever this kind of thing is &amp;) in addition to 
    replacing regular & with \\& (#, %, $, etc)
===========
-investigate: find and fix formatting applied to partial words? (may not be possible) (how do word boundaries work with \ and {} ?)
    Ex: F\emph{oo bar}

===================================
    Someday TBD?:
===================================
-full fic conversion
    -open entire HTML
    -run coversion (Ao3):
        -grab section of text between <!--chapter content--> and <!--/chapter content-->
        -remove </div> and <div class="userstuff">
        -insert into new tex file
        -run replace script (posibly format \chapter{} as well)
        -save file as ch#.tex where #=loop number (+1 if index=0)
        -close new file
        -repeat at next instance of <!--chapter content-->

-handle calibre-ized HTML

*/
