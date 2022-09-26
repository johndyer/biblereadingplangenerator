(function(exports) {
	function parseReference(textReference, language) {
	
		var 
			bookid = null,
			bookInfo = null,
			chapter1 = -1,
			verse1 = -1,
			chapter2 = -1,
			verse2 = -1,
			input = new String(textReference).replace('&ndash;','-').replace('–','-').replace(/(\d+[\.:])\s+(\d+)/gi, '$1$2'),
			i, j, il, jl,
			afterRange = false,
			afterSeparator = false,
			startedNumber = false,
			currentNumber = '',
			name,
			possibleMatch = null,
			c;
		
		// default to english
		language = language || 'en';
		
			
		// take the entire reference (John 1:1 or 1 Cor) and move backwards until we find a letter or space
		// 'John 1:1' => 'John '
		// '1 Cor' => '1 Cor'
		// 'July15' => 'July'
		for (i=input.length; i>=0; i--) {
			if (/[A-Za-z\s]/.test(input.substring(i-1,i))) {
				possibleMatch = input.substring(0,i);					
				break;			
			}
		}
		
		if (possibleMatch != null) {
			
			// tear off any remaining spaces
			// 'John ' => 'John'
			possibleMatch = possibleMatch.replace(/\s+$/,'').replace(/\.+$/,'').toLowerCase();
			
			
			// find a complete name match
			var bookMatches = bible.BIBLE_DATA.filter(function(b) { return b.names[language].toLowerCase() == possibleMatch });
			if (bookMatches.length == 1) {
				bookInfo = bookMatches[0]; 
				bookid = bookInfo.bookid;
			} else {
				
				// find an abbreviation
				bookMatches = bible.BIBLE_DATA.filter(
												function(b) { 
													return b.abbr[language].filter(function(abbr) { 
														return abbr.toLowerCase() == possibleMatch; 
													}).length > 0;
												});					
				
				if (bookMatches.length > 0) {
					bookInfo = bookMatches[0]; 
					bookid = bookInfo.bookid;
				}			
			}
	
			if (bookid != null) {
	
				for (i = 0; i < input.length; i++) {
					c = input.charAt(i);
	
					if (c == ' ' || isNaN(c)) {
						if (!startedNumber)
							continue;
	
						if (c == '-' || c == '–') {
							afterRange = true;
							afterSeparator = false;
						} else if (c == ':' || c == ',' || c == '.') {
							afterSeparator = true;
						} else {
							// ignore
						}
	
						// reset
						currentNumber = '';
						startedNumber = false;
	
					} else {
						startedNumber = true;
						currentNumber += c;
	
						if (afterSeparator) {
							if (afterRange) {
								verse2 = parseInt(currentNumber, 10);
							} else { // 1:1
								verse1 = parseInt(currentNumber, 10);
							}
						} else {
							if (afterRange) {
								chapter2 = parseInt(currentNumber, 10);
							} else { // 1
								chapter1 = parseInt(currentNumber, 10);
							}
						}
					}
				}
				
				// for books with only one chapter, treat the chapter as a vers
				if (bookInfo.verses.length == 1) {
					
					// Jude 6 ==> Jude 1:6
					if (chapter1 > 1 && verse1 == -1) {
						verse1 = chapter1;
						chapter1 = 1;
					}
				}	
				
	
				// reassign 1:1-2	
				if (chapter1 > 0 && verse1 > 0 && chapter2 > 0 && verse2 <= 0) {
					verse2 = chapter2;
					chapter2 = chapter1;
				}
				
				// fix 1-2:5
				if (chapter1 > 0 && verse1 <= 0 && chapter2 > 0 && verse2 > 0) {
					verse1 = 1;
				}
	
				// just book
				if (bookid != null && chapter1 <= 0 && verse1 <= 0 && chapter2 <= 0 && verse2 <= 0) {
					chapter1 = 1;
					//verse1 = 1;
				}
	
				// validate max chapter
				if ( typeof bookInfo.verses  != 'undefined') {
					if (chapter1 == -1) {
						chapter1 = 1;
					} else if (chapter1 > bookInfo.verses.length) {
						chapter1 = bookInfo.verses.length;
						if (verse1 > 0)
							verse1 = 1;
					}
	
					// validate max verse
					if (verse1 > bookInfo.verses[chapter1 - 1]) {
						verse1 = bookInfo.verses[chapter1 - 1];
					}
					if (verse1 > 0 && verse2 <= verse1) {
						chapter2 = -1;
						verse2 = -1;
					}
				}
			}
		}
			
		// finalize
		return new Reference(bookid, chapter1, verse1, chapter2, verse2);
	
	}
	exports.parseReference = parseReference;
	
	
	var Reference = function() {
	
		var args = arguments;
		
		if (args.length == 0) {
			// error
			return this;		
		} else if (args.length == 1 && typeof args[0] == 'string') { // a string that needs to be parsed
			
			return parseReference(args[0]);
		
		} else if (args.length >= 2 && args.length <= 6) {
			
			this.bookid = args[0];
			this.chapter1 = args[1];
			if (args.length >= 3) this.verse1 = args[2];
			if (args.length >= 4) this.chapter2 = args[3];
			if (args.length >= 5) this.verse2 = args[4];
			
			return this;
		} else {
			return null;
		}
		
	}
	
	Reference.prototype = {
		
		bookid: null,
		
		chapter1: null,
		chapter2: null,
		verse1: null,
		verse2: null,
		language: 'en',
		
		isValid: function () {
			var self = this;
			return (self.getBook() != null && self.chapter1 > 0);
		},
		
		getBook: function() {
			var self = this;
			if (self.bookid == null) {
				return null;
			}
			var books = bible.BIBLE_DATA.filter(function(b) { return b.bookid == self.bookid; });
			if (books.length > 0) {
				return books[0];
			} else {
				return null;
			}
		},	
	
		chapterAndVerse: function (cvSeparator, vvSeparator, ccSeparator) {
			cvSeparator = cvSeparator || ':';
			vvSeparator = vvSeparator || '-';
			ccSeparator = ccSeparator || '-';
			
			var chapter1 = this.chapter1, 
				chapter2 = this.chapter2, 
				verse1 = this.verse1, 
				verse2 = this.verse2;
	
			if (chapter1 > 0 && verse1 <= 0 && chapter2 <= 0 && verse2 <= 0) // John 1
				return chapter1;
			else if (chapter1 > 0 && verse1 > 0 && chapter2 <= 0 && verse2 <= 0) // John 1:1
				return chapter1 + cvSeparator + verse1;
			else if (chapter1 > 0 && verse1 > 0 && chapter2 <= 0 && verse2 > 0) // John 1:1-5
				return chapter1 + cvSeparator + verse1 + vvSeparator + verse2;
			else if (chapter1 > 0 && verse1 <= 0 && chapter2 > 0 && verse2 <= 0) // John 1-2
				return chapter1 + ccSeparator + chapter2;
			else if (chapter1 > 0 && verse1 > 0 && chapter2 > 0 && verse2 > 0) // John 1:1-2:2
				return chapter1 + cvSeparator + verse1 + ccSeparator + ((chapter1 != chapter2) ? chapter2 + cvSeparator : '') + verse2;
			else
				return '?';
		},
	
		toString: function () {
			var self = this,
				book = self.getBook();
		
			if (book == null) 
				return "invalid";
	
			return book.names[self.language] + ' ' + self.chapterAndVerse();
		}	
	}
	
	
	exports.Reference = Reference;

})(window.bible);