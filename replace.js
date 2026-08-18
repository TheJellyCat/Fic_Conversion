// TeXworksScript
// Title: Fic Conversion
// Description: A batch search and replace script intended for use
//              converting Ao3 HTML to Latex. Also converts to Latex 
//              quotes, both single and double, converts many Unicode
//              to Latex commands, and addresses some common 
//              typographical issues.
// Author: JellyCat (based on Lua code by Paulo Cereda:
//         https://tex.stackexchange.com/questions/84668/search-replace-script-for-texworks)
// Version: 1.5.8
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

var patternsToLook =  [
    //HTML (tweaks) (used for converting unusual formatting)
    "<p class=\"MsoNoSpacing\">",  "</p><p>",
    // HTML (main)
    "<p>", "</p>", "<u>", "</u>", "<i>", "</i>", "<b>", "</b>", "<strong>", "</strong>", 
    "<br/>", "<br />", "<br>", "<em>", "</em>", "<strike>", "</strike>", "<blockquote>", "</blockquote>",
    // Remove empty par breaks
    "<p> </p>", "<p></p>",
    // Latex syntax 
    "...", "…", "—",
    // Common characters that need escape
    "&amp;","%", "#", "$",
    //Accented letters (tbd: figure out a regex for more generic diacritic conversion)

];
var valuesToReplace = [
    //HTML (tweaks) (used for converting unusual formatting)
    "<p>", "<p></p>",
    // HTML (main) (Could use \\par instead of \r if preferred. I just like 
    // to use double spacing between paragraphs.)
    "\r", "\r", "\\uline{", "}", "\\emph{", "}", "\\textbf{", "}", "\\textbf{", "}",
    "\r", "\r", "\r", "\\emph{", "}", "\\sout{", "}", "\\begin{quotation}", "\\end{quotation}",
    // Remove empty par breaks
    "","",
    // Latex syntax 
    "\\ldots{}", "\\ldots{}", "---",
    // Common characters that need escape
    "\\&","\\%", "\\#", "\\$",
];
// </p><p> </p><p> -> <p></p>  convert manual double spacing?
// ====================================================================
// Actual Code. Probably don't edit this unless you need to add 
// additional functionality.
// ====================================================================

// Verify array lengths match.
if (patternsToLook.length === valuesToReplace.length) {
    // Grab the whole document text.
    var text = TW.target.text;
    if (text) {
        // Implement replacement lists.
        for (var i = 0; i < patternsToLook.length; i++) {
            var currentPattern = patternsToLook[i];
            var currentReplacement = valuesToReplace[i];
            
            // Escape characters to treat as literal text, not regex rules.
            var escapedPattern = currentPattern.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
            var regex = new RegExp(escapedPattern, "g");
            
            text = text.replace(regex, currentReplacement);  
        }
    // ===================================
    // Remove empty formatting markers
    // ===================================

        text = text.replace(/\r(\s*)\\(\w+)\{\s*\}/g, ""); // return(0+spaces)\command{0+spaces} -> delete
        text = text.replace(/\s*\\(textbf\{\s*\})|(emph\{\s*\})/g, ""); // need to expand this somehow w/o including other commands
                                                                        // Also want to cover sout, uline.
                                                                        // Empty Latex environments?
    // ===================================
    // Replace spaces in wrong spots
    // ===================================
  
        text = text.replace(/(\w)\\(ldots)\{\s*\}([\w|\\])/g, "$1\\$2{} $3"); // foo\ldots{}bar -> foo\ldots{} bar (preference)
        text = text.replace(/([\w,!'\.\?])\\(\w+)\{\s(.+?)\}/g, "$1 \\$2{$3}"); // foo\emph{ bar} -> foo \emph{bar}
        text = text.replace(/\\(\w+)\{(.+?)\s\}/g, "\\$1{$2} "); // \emph{bar } -> \emph{bar}\s
        text = text.replace(/\u0020[,\.\?!]/g, "$1"); // words . -> words.
        text = text.replace(/([,\.\?!])(\w+)/g, "$1 $2"); // foo.bar -> foo. bar
        text = text.replace(/[\r\n]+[^\S\r\n]*[\r\n]+/g, "\r\r"); // replace triple+ par breaks (messy?)
        text = text.replace(/[^\S\r\n][^\S\r\n]/g, " "); // foo  bar -> foo bar
        text = text.replace(/\\emph\{(\w+)\}\s*\\emph\{(\w+[,\.\?!']*)\}/g, "\\emph{$1 $2}"); // \emph{foo} \emph{bar} -> \emph{foo bar}

    // ===================================
    // Quote conversion and handling
    // ===================================

    /* Including smart/unicode quotes.
    Note that quote handling should be the last step - any additional 
    features should go above this. */

        /* Convert double quotes around em dashes. This is styled for
        dialog starting/ending mid-sentence since I encounter this
        most often. */
        text = text.replace(/"---|“---/g, "``---");
        text = text.replace(/---"|---”/g, "---''");
        text = text.replace("---}", "}---");
        // Convert opening double quotes
        text = text.replace(/(^|\s|\{|\})[“"]/g, "$1``");
        // Convert closing double quotes: any remaining " 
        text = text.replace(/[”"]/g, "''");

        // Convert opening single quotes
        text = text.replace(/(^|\s|``|\{)[‘']([^'])/g, "$1`$2"); // prevents replacing half of a double quote or plain apostrophes
        // Convert closing single quotes and apostrophes
        text = text.replace(/’/g, "'");
        
        // Move quotes outside formatting commands (needed?)
        text = text.replace(/('')\s*\}/g, "}''"); // ``foo \emph{bar''} -> ``foo \emph{bar}''
        text = text.replace(/(')\s*\}/g, "}'");

        // Insert spaces between text and open/close quotes
        text = text.replace(/('')(\w)/g, "$1 $2"); // ...foo''bar -> ...foo'' bar
        text = text.replace(/(\w|[,\.\?!]|\})(``)/g, "$1 $2"); // ...foo``bar -> ...foo ``bar
        
        // Replace document with cleaned text
        TW.target.selectAll();
        TW.target.insertText(text);
    }
} 
// In case replacement lists are not the same length
else {
    TW.information(null, "Uneven Lists", 
    "The number of patterns and replacements must match.");
}

/*
====================================================================
    TBD: 
====================================================================
-combine split formatting (\emph{No} \emph{way!}) w/ various spacing (??)
-move punctuation inside formatting (\emph{Maybe}? -> \emph{Maybe?})
-check support for other fic archives
    -might not be possible for sites w/o an official "download" option. Formatting dependent?
-add support for UK quotation mark style (??)
    -toggle on/off
-add support for html codes for symbols (or whatever this kind of thing is &amp;) in addition to 
    replacing regular & with \\& (#, %, $, etc)
===========
-investigate: find and fix formatting applied to partial words? (may not be possible)
    Ex: F\emph{oo bar}

===================================
    Someday TBD?:
===================================
-full fic conversion
    -paste in entire HTML
    -run coversion:
        -loop through entire text
        -grab section of text between <!--chapter content--> and <!--/chapter content-->
        -remove </div> and <div class="userstuff">
        -insert into new tex file
        -run replace script
        -save file as ch#.tex where #=loop number (+1 if index=0)
        -close file
        -repeat at next instance of <!--chapter content-->

-handle calibre-ized HTML

*/