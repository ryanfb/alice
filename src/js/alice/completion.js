Alice.Completion = Class.create({
  initialize: function(candidates, editor) {
    var range = this.getRange();
    if (!range) return;

    this.element = range.startContainer;
    this.editor = editor;
    if (this.element == this.editor) {
      this.addTextNode();
    }

    this.value = this.element.data || "";
    this.index = range.startOffset;

    this.findStem();
    this.matches = this.matchAgainst(candidates);
    this.matchIndex = -1;
  },

  addTextNode: function() {
    // gross hack to make this work when
    // element is the editor div, which only
    // happens when the editor is blank

    this.editor.innerHTML = "";
    var node = document.createTextNode("");
    this.editor.appendChild(node);
    var selection = window.getSelection();
    selection.removeAllRanges();
    selection.selectNode(node);
    range = selection.getRangeAt(0);
    this.element = node;
  },

  getRange: function() {
    var selection = window.getSelection();
    if (selection.rangeCount > 0) {
      return selection.getRangeAt(0);
    }
    if (document.createRange) {
      return document.createRange();
    }
    return null;
  },

  setRange: function(range) {
    if (!range) return;
    var selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  },

  next: function() {
    if (!this.matches.length) return;
    if (++this.matchIndex == this.matches.length) this.matchIndex = 0;
    this.complete();
  },

  prev: function() {
    if (!this.matches.length) return;
    if (--this.matchIndex <= 0) this.matchIndex = this.matches.length - 1;
    this.complete();
  },

  complete: function() {
    var match = this.matches[this.matchIndex];
    match += this.leftOffset == 0 ? ":\u00a0" : "\u00a0";
    this.restore(match, this.leftOffset + match.length);
  },
  
  restore: function(stem, index) {
    // add a new text node if our element was deleted (select-all delete)
    if (!this.element.parentNode)
      this.addTextNode();

    this.element.data = this.stemLeft + (stem || this.stem) + this.stemRight;
    this.setCursorToIndex(Object.isUndefined(index) ? this.index : index);
  },
  
  setCursorToIndex: function(index) {
    var range = this.getRange();
    range.setStart(this.element, index);
    range.setEnd(this.element, index);
    this.setRange(range);
  },

  findStem: function() {
    var left = [], right = [], chr, index, length = this.value.length;

    for (index = this.index - 1; index >= 0; index--) {
      chr = this.value.charAt(index);
      if (!Alice.Completion.PATTERN.test(chr)) break;
      left.unshift(chr);
    }

    for (index = this.index; index < length; index++) {
      chr = this.value.charAt(index);
      if (!Alice.Completion.PATTERN.test(chr)) break;
      right.push(chr);
    }

    this.stem = left.concat(right).join("");
    this.stemLeft  = this.value.substr(0, this.index - left.length);
    this.stemRight = this.value.substr(this.index + right.length);
    this.leftOffset = this.index - left.length;
  },
  
  matchAgainst: function(candidates) {
    return candidates.grep(new RegExp("^" + RegExp.escape(this.stem), "i"));
  }
});

Alice.Completion.PATTERN = /[A-Za-z0-9\[\\\]^_{|}-]/;
