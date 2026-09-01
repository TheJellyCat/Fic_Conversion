# Fic Conversion - A TexWorks Script
A script intended for use converting Ao3 HTML to Latex. Also converts to Latex quotes (both single and double), converts many Unicode characters to Latex commands, and addresses some common typographical issues. This also contains a batch search and replace feature to automate frequent replacements.

Still in development.

### Support confirmed for:
- Ao3
- FimFiction

Note that some authors or old fics may use unusual/non-standard formatting that has not been checked. Let me know if you find something!

## Features:
- Easy to edit batch search-and-replace function! If there are words, names, or other "patterns" that you find yourself frequently having to replace, you can add them in and make all replacements throughout the document all at once. All additional features can be commented out if you wish to only use the search-and-replace function. Useful for things such as:
  - names that are frequently misspelled
  - fixing repeated uppercase/lowercase errors
  - replacing text-based section breaks with fancy ones
  - anything else your typesetting heart desires...

- Latex replacement for HTML formatting `(<p>, <i>, <b>, etc)`
  -   includes support for the Latex package ulem for underline and strike-through
  -   includes HTML character code recognition for common characters `(#, &, ", etc)`
  -   Note that this uses the search-and-replace aspect, so turning that off will break this.
- Latex replacement for Unicode characters, including smart quotes (ellipsis, em dash)
  -   Quotes/smart quotes around em dashes are currently formatted for the more common use of dialog ending or beginning abruptly, i.e. `"Like I said---"` or `"---my entire evil plan."` Some manual adjustment may be needed for other cases.
  -   Spacing around ellipses does not have hard and fast rules, so this is styled by default for my preference: `"The words... they have spaces!"` The first line under the "Replace spaces in wrong spots" section controls this if you would like to change it.
  -   Em dashes are closed up. `So---like here---there are no spaces`. This is also a stylistic choice.
-   Fixes for common typographical errors
    - double spaces `like  this`
    - missing spaces `like.This` or `like,"This."`
- Additionally includes fixes that are not visible in published documents, but clean up the code for the sake of it:
  - remove empty formatting commands
  - move trailing/leading spaces out of formatting commands `So like\emph{ this} one` or `Like \emph{this }one`
  - combine split formatting `\emph{Like} \emph{this}.`
    - Note this excludes underline and strike-through where separation of formatted words is visible.
      
Each of these features, excluding quote conversion, is a single line and can be independently turned off or changed. Note that this may occasionally introduce quirks to quote conversion. I've attempted to write things in a way that keep these separate, but let me know if you find that something breaks!
