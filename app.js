//  date helpers
Date.prototype.addDays = function(d) {
	return new Date(this.getTime() + d*24*60*60*1000);
}
var months = 'Jan Feb Mar Apr May Jun July Aug Sep Oct Nov Dec'.split(' ');
Date.prototype.pretty = function(d) {
	return months[this.getMonth()] + ' ' + this.getDate() + ', ' + this.getFullYear();
}
Date.prototype.monthAbbr = function(d) {
	return months[this.getMonth()];
}
Date.prototype.formatted = function(d) {
	return this.getFullYear() + '/' + (1+this.getMonth()) + '/' + this.getDate();
}
Date.prototype.toInputField = function(d) {
	
	var t = this,
		m = t.getMonth()+1,
		d = t.getDate(),
		y = t.getFullYear(),
		f = y.toString() + '-' + (m > 9 ? m :'0' + m) + '-' + (d > 9 ? d :'0' + d);	

	return f;
}


// setup checkboxes

var today = new Date(),
	nextmonth = new Date(today.getFullYear(), today.getMonth()+1, 1);

$('#time-startdate').val(nextmonth.toInputField() );
// $('#enddate').val((today.getFullYear()+1) + '-' + (today.getMonth()+1) + '-' + today.getDate() );
$('#time-days').val(365 );

// begin with all checked
$('#section-books input, #section-days input').prop('checked',true);

// ot/nt clicking
$('.books-section input').on('click', function() {
	var check = $(this);
	if (check.closest('label').hasClass('books-testament')) {
		
		// parent
		check
			.closest('.books-section')
			.find('input')
			.prop('checked', check.prop('checked'));
		
	} else {
		
		var parent = check.closest('.books-section').find('.books-testament input');
		
		if (check.prop('checked')) {
			// cehck others
			var allchecked = true;
			check.closest('.books-section').find('.books-list input').each(function() {
				if (!$(this).prop('checked')) {
					allchecked = false;
					return false;
				}
			});
			parent.prop('checked',allchecked);
		} else {
			parent.prop('checked',false);
		}
		
		
	}

	generate();
});

$('#action button').on('click', generate);

$('#section-days input, #section-options input, #section-format input').on('change', generate);

var planWindow = null; // global variable
function generate() {
	
	var 
		startDate = new Date($('#time-startdate').val()),
		days = parseInt($('#time-days').val(), 10),
		formatstyle = $('input:radio[name="formatstyle"]:checked').val(),
		booksList = [],
		daysList = [];
	
	
	$('.books-list input:checked').each(function() { 
		booksList.push( $(this).val() );
	});
	
	$('#section-days input:checked').each(function() { 
		daysList.push( parseInt($(this).val(), 10) );
	});	
	
	
	// BUG
	var datastartDate = startDate.addDays(1);

	var data = getPlanData(datastartDate, days, booksList, daysList, $('#options-dailypsalm').is(':checked'), $('#options-dailyproverb').is(':checked'));
	console.log(data);
	
	console.log('build', formatstyle);
	var html = window['build' + formatstyle](data, startDate, days, booksList, daysList);
	
	
	
	/*
	if (planWindow == null || planWindow.closed) {
		planWindow = window.open('about:blank', 'BiblePlanWindow', 'resizable,scrollbars,status');
	} else {
		planWindow.focus();
	}
	
	planWindow.document.write('<!doctype html><html><head><title>Bible Plan</title></head><body>' + html + '</body></html>');
	*/
	
	
	var iframe = $('#output')
		.css({height: '20em', width: '100%'})
		.show()
		[0];
		
	var iframeDoc = (iframe.contentWindow) ?
					 iframe.contentWindow : 
					 (iframe.contentDocument.document) ? iframe.contentDocument.document : iframe.contentDocument;
	iframeDoc.document.open();
	iframeDoc.document.write(html);
	iframeDoc.document.close();
	
	$(iframe).height( $(iframeDoc).height() );
	
}

function getPlanData(startDate, numberOfDays, bookList, dayList, dailyPsalm, dailyProverb) {
	
	var psalmNumber = 1;
	var psalmMax = 150;
	var proverbNumber = 1;
	var proverbMax = 31;
	var rangeIncludesPsalm = false;
	var rangeIncludesProverbs = false;

	var
		data = {
			startDate: startDate,
			numberOfDays: numberOfDays,
			bookList: bookList,			
			dayList: dayList,			
			totalBooks: 0,
			totalChapters: 0,
			totalVerses: 0,
			totalWords: 0,		
			chaptersPerDay: 0,
			versesPerDay: 0,
			wordsPerDay: 0,
			minPerDay: 0,
			readingDays: 0,
			days: [],								
		};
		
	
		
	// get days
	for (var i=0; i<numberOfDays; i++) {
		var date = startDate.addDays(i);
		// is this an included day
		if (dayList.indexOf(date.getDay()) > -1) {
			data.readingDays++;
		}
	}
	
	// get sums of chapters, books, ect.	
	for (var i=0; i<bookList.length; i++) {
		var usfm = bookList[i],
			bookInfo = bible.BIBLE_DATA_USFM[ usfm ];
		
		// chapters
		data.totalChapters += bookInfo.verses.length; 
		
		// verses
		for (var j=0; j<bookInfo.verses.length; j++) {
			data.totalVerses += bookInfo.verses[j];	
			data.totalWords += bookInfo.words[j];			
		}		
	}
	
	data.chaptersPerDay = data.totalChapters/data.readingDays,
	data.versesPerDay = data.totalVerses/data.readingDays;
	data.wordsPerDay = data.totalWords/data.readingDays;
	//data.minPerDay = data.totalWords/reading_days/wpm;	
	
	
	// create an entry for each day	
	var date = startDate,
		lastBookIndex = -1,
		currentBookIndex = 0,
		currentBookUsfm = bookList[currentBookIndex],
		currentChapterNumber = 1,
		chaptersRemaining = 0,
		wordsRemaining = 0,
		date = startDate,
		ended = false;
					
	for (var d=1; d<=numberOfDays && !ended; d++) {

		rangeIncludesPsalm = false;
		rangeIncludesProverb = false;
		
		var dayInfo = {
			day: d,
			date: date,
			wordsForToday: 0,
			versesForToday: 0,
			formattedReading: '',
			chapters: []
		};		
		data.days.push(dayInfo);
		
		// iterate the date here, because we'll skip days below
		date = date.addDays(1);
		
		// skip unused days
		if (dayList.indexOf( dayInfo.date.getDay() ) == -1 ) {
			dayInfo.formattedReading = '---';
			continue;
		}
			
		var logic = 'words';
		
		
		if (logic == 'chapters') {
			
			var chaptersForToday = data.chaptersPerDay + chaptersRemaining;

			while (chaptersForToday > 1) {
				var bookInfo = bible.BIBLE_DATA_USFM[currentBookUsfm];
				if (bookInfo == null) {
					break;
				}				
				
				// check if there is still a chapter in this book. If not, iterate)
				if (currentChapterNumber > bookInfo.verses.length) {
					lastBookIndex = currentBookIndex;
					currentBookIndex++;
					currentChapterNumber = 1;
					currentBookUsfm = bookList[currentBookIndex];				
					bookInfo = bible.BIBLE_DATA_USFM[ currentBookUsfm ];

					if (bookInfo == null) {
						break;
					}
				}
				
				// add this next one
				dayInfo.chapters.push({usfm:currentBookUsfm, chapter: (currentChapterNumber)});			
					
				// total up verses for the day
				dayInfo.versesForToday += bookInfo.verses[currentChapterNumber-1];
				dayInfo.wordsForToday += bookInfo.words[currentChapterNumber-1];
	
				lastBookIndex = currentBookIndex;
				currentChapterNumber++;
				chaptersForToday--;
			}
			
			// double check we get remaining chapters
			if (d == numberOfDays && bookInfo != null) {
				while (currentChapterNumber <= bookInfo.verses.length) {
					dayInfo.chapters.push({ usfm: currentBookUsfm, chapter: currentChapterNumber });			
					
					dayInfo.versesForToday += bookInfo.verses[currentChapterNumber-1];
					dayInfo.wordsForToday += bookInfo.words[currentChapterNumber-1];
						
					lastChapterNumber = currentChapterNumber;			
					currentChapterNumber++;
				}
			}	
			
			chaptersRemaining = chaptersForToday;		
			
		} else if (logic == 'words') {
			
			var
				wordsForDay = data.wordsPerDay + wordsRemaining,			
				lastChapterNumber = 0;
						
			while (wordsForDay > 0) {
				var bookInfo = bible.BIBLE_DATA_USFM[currentBookUsfm];
				
				// check if the number of words is more or less than half of what's left
				var wordsInChapter = bookInfo.words[currentChapterNumber-1];
				if (wordsInChapter/2 > wordsForDay) {
					// go to next day
					break;
				}
				
				// add this next one
				dayInfo.chapters.push({usfm:currentBookUsfm, chapter: (currentChapterNumber)});			
					
				// total up verses for the day
				dayInfo.versesForToday += bookInfo.verses[currentChapterNumber-1];
				dayInfo.wordsForToday += wordsInChapter;
	
				wordsForDay = wordsForDay - wordsInChapter;
							
				// store
				lastBookUsfm = currentBookUsfm;
				lastChapterNumber = currentChapterNumber;
				
				
				// iterate
				currentChapterNumber++;
				
				if (currentBookUsfm == 'REV' && currentChapterNumber == 23) {
					console.log('whoops');
				}
				
				// check if there is still a chapter in this book. If not, move to next book
				if (currentChapterNumber > bookInfo.verses.length) {
					lastBookIndex = currentBookIndex;
					
					// if this is the last book, then stop
					if (currentBookIndex == bookList.length-1) {
						bookInfo = null;
						ended = true;					
						break;
					}
					
					currentBookIndex++;
									
					// reset to next book
					currentChapterNumber = 1;				
					currentBookUsfm = bookList[currentBookIndex];				
					bookInfo = bible.BIBLE_DATA_USFM[ currentBookUsfm ];
					if (typeof bookInfo == 'undefined') {
						bookInfo = null;
						ended = true;						
						break;	
					}
				}			
			}
	
			// is this the final day? 
			// if so, double check we get remaining chapters
			if (d == numberOfDays && bookInfo != null) {
				while (currentChapterNumber <= bookInfo.verses.length) {
					dayInfo.chapters.push({ usfm: currentBookUsfm, chapter: currentChapterNumber });			
					
					dayInfo.versesForToday += bookInfo.verses[currentChapterNumber-1];
					dayInfo.wordsForToday += bookInfo.words[currentChapterNumber-1];
						
					lastChapterNumber = currentChapterNumber;			
					currentChapterNumber++;
				}
			}
						
			// store the remainder for the next day
			wordsRemaining = wordsForDay;
			
			//console.log(wordsRemaining);
		}

		// both ways
		dayInfo.formattedReading = formatChapterRange(dayInfo.chapters);

		rangeIncludesPsalm = false;
		rangeIncludesProverb = false;
		for (var cc=0; cc<dayInfo.chapters.length; cc++) {
			if (dayInfo.chapters[cc].usfm == 'PSA') {
				rangeIncludesPsalm = true;
			}
			if (dayInfo.chapters[cc].usfm == 'PRO') {
				rangeIncludesProverb = true;
			}			
		}

		if (dailyPsalm && !rangeIncludesPsalm) {
			dayInfo.formattedReading += '; Ps ' + psalmNumber;
			psalmNumber++;
			if (psalmNumber > psalmMax) {
				psalmNumber = 1;
			}
		}

		if (dailyProverb && !rangeIncludesProverb) {
			dayInfo.formattedReading += '; Pro ' + proverbNumber;
			proverbNumber++;
			if (proverbNumber > proverbMax) {
				proverbNumber = 1;
			}
		}		



	}	
	
	return data;	
}

function appendDaysToSunday(days) {
	while (days[0].date.getDay() > 0) {

		var emptyDay =  dayInfo = {
			day: days[0].day-1,
			date: days[0].date.addDays(-1),
			wordsForToday: 0,
			versesForToday: 0,
			formattedReading: '',
			chapters: []
		};
		
		
		days.splice(0,0,emptyDay);
	}	
	
	return days;	
	
}


function formatChapterRangeComma(chapters, isFullname) {
	
	isFullname = isFullname || false;
	
	if (!chapters || chapters == null || chapters.length == 0) {return '';}
	
	var formatted = '',
		lastBookUsfm = '',
		lastChapterNumber = 0;
	
	for (var i=0; i<chapters.length; i++) {
		var chapter = chapters[i],
			bookInfo = bible.BIBLE_DATA_USFM[chapter.usfm];
		
		// new book
		if (chapter.usfm != lastBookUsfm)  {
			if (i > 0) {
				formatted += '; ';
			}
			
			
			formatted += bookInfo.abbr.en[0] + 
							( bookInfo.verses.length > 1 ? ' ' + (chapter.chapter) : '');

		} else {
			if (i > 0) {
				formatted += ', ';
			}			
			
			formatted += chapter.chapter.toString();
		}
		
		lastBookUsfm = chapter.usfm;
	}
	
	
	return formatted;
}

function formatChapterRange(chapters, isFullname) {
	
	isFullname = isFullname || false;
	
	if (!chapters || chapters == null || chapters.length == 0) {return '';}
	
	var formatted = '',
		lastBookUsfm = '',
		lastChapterNumber = 0,
		firstChapterOfBook = 0;
	
	for (var i=0; i<chapters.length; i++) {
		var chapter = chapters[i],
			bookInfo = bible.BIBLE_DATA_USFM[chapter.usfm];
		
		// new book
		if (chapter.usfm != lastBookUsfm)  {
			if (i > 0) {
				if (firstChapterOfBook != lastChapterNumber) {
					formatted += '-' + lastChapterNumber.toString();
				}
				formatted += '; ';
			}
						
			formatted += bookInfo.abbr.en[0] + 
							( bookInfo.verses.length > 1 ? ' ' + (chapter.chapter) : '');
							
			firstChapterOfBook = chapter.chapter;

		} else {
			if (i == chapters.length-1) {
				formatted += '-' + chapter.chapter.toString();
			} else {
				
				// wait for it
			}
			
			
		}
		
		lastChapterNumber = chapter.chapter;
		lastBookUsfm = chapter.usfm;
	}
	
	
	return formatted;
}



function buildlist(data, days, bookList, dayList, dailyPsalm, dailyProverb) {
	

	var html = [];
	/*
	html.push('<style>');
	html.push('* { margin: 0; padding: 0; box-sizing: border-box;}');
	html.push('body { font-size: 16px; line-height: 1.2; font-family: Helvetica; }');	
	html.push('table td,table th { padding: 0.35em; vertical-align: top;  }');	
	html.push('table th { white-space: nowrap;  }');	
	html.push('</style>');
	
	
	html.push('<table>');
	
	html.push('<tbody>');
	
	var days = data.days;
	for (var i=0; i<days.length; i++) {
		var dayInfo = days[i];
		
		html.push('<tr>');
		html.push('<th>' + dayInfo.date.pretty() + '</th>');		
		html.push('<td>' + formatChapterRange(dayInfo.chapters) + '</td>');
		html.push('<td>' + dayInfo.versesForToday + '</td>');
		html.push('<td>' + dayInfo.wordsForToday + '</td>');		
		html.push('<td>' + (dayInfo.wordsForToday / 200.0).toString() + '&nbsp;mins' + '</td>');				
		
		html.push('</tr>');
	}
	html.push('</tbody>');
	html.push('</table>');
	*/
	
	html.push('<style>');
	html.push('* { margin: 0; padding: 0; box-sizing: border-box;}');
	html.push('body { font-size: 12px; line-height: 1.2; font-family: Helvetica; }');	
	html.push('#container { padding: 3em; -webkit-column-count: 3; -webkit-column-rule: 1px solid #ccc; -moz-column-count: 3; -moz-column-rule: 1px solid #ccc; column-count: 3; column-rule: 1px solid #ccc; }');	
		html.push('.date { width: 5em; padding-right: 1.5em; text-align: right; display: inline-block; }');	
	html.push('</style>');
	
	
	html.push('<div id="container">');
		
	var days = data.days;
	for (var i=0; i<days.length; i++) {
		var dayInfo = days[i];
		//var fixeddate = dayInfo.date.addDays(1);
		//html.push('<tr>');
		html.push('<span class="date">' + dayInfo.date.monthAbbr() + ' ' + (dayInfo.date.getDate()) + '</span>');		
		//html.push('<span>' + formatChapterRange(dayInfo.chapters) + '</span>');		
		html.push('<span>' + dayInfo.formattedReading + '</span>');		
		html.push('<br />');
	}
	html.push('</tbody>');
	html.push('</table>');
	
	
	
	return html.join('\n');
	
}



function buildcalendar(data, days, bookList, dayList, dailyPsalm, dailyProverb) {
	
	var daysOfWeek = ['Sunday','Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
	
	var html = [];
	html.push('<style>');
	html.push('* { margin: 0; padding: 0; box-sizing: border-box;}');
	html.push('body { font-size: 12px; line-height: 1.2; font-family: Helvetica; }');
	html.push('table { border-collapse: collapse; }');		
	html.push('table td,table th  { padding: 1em; vertical-align: top; width: 14%; border: 1px solid #ccc; }');	
	html.push('table .date { display: block; font-size: 0.7em; text-align: right; }');		
	html.push('table .verse { display: block;  }');	
	html.push('table .monthstart { border-left-color: #000; border-top-color: #000;  }');		
	html.push('table .monthend { border-right-color: #000; border-bottom-color: #000; }');			
	html.push('table .firstweek { border-top-color: #000;  }');		
	html.push('table .lastweek { border-bottom-color: #000;  }');	
	
	if ($('#options-colorcalendar').is(':checked')) {
		html.push('.section-pentateuch { background: #cbf4fb; #469eac;  }');		
		html.push('.section-historical { background: #e2f7bd; #839f50;  }');	
		html.push('.section-poetic { background: #fbf5c3; #beb45a;  }');	
		html.push('.section-major { background: #f7ddef; #b38fa8;  }');	
		html.push('.section-minor { background: #f7ddef; #b18da7;  }');	
		html.push('.section-gospel { background: #fdc6ca; #ce1f2c;  }');	
		html.push('.section-acts { background: #fbe6ac; #deb545;  }');	
		html.push('.section-paul { background: #bafdf6; #008376;  }');	
		html.push('.section-general { background: #c0f9ae; #5d974b;  }');	
		html.push('.section-revelation { background: #b0a6f3; #6b6499;  }');	
	}
	html.push('</style>');
	
	
	html.push('<table>');
	
	// create daily heading
	html.push('<thead><tr>');
	//html.push('<th>&nbsp;</th>');
	for (var i=0; i<daysOfWeek.length; i++) {
		var dayName = daysOfWeek[i];
		html.push('<th>' + dayName + '</th>');
	}	
	html.push('</tr></thead>');
	
	// fill in until Sunday
	var days = appendDaysToSunday(data.days);
	
	html.push('<tbody>');
	
	var weekNumber = 1,
		lastMonth = -1;
	for (var i=0; i<days.length; i++) {
		var dayInfo = days[i],
			bookInfo = dayInfo.chapters.length > 0 ? bible.BIBLE_DATA_USFM[dayInfo.chapters[0].usfm] : null;
		
		// open on sunday
		if (dayInfo.date.getDay() == 0) {
			html.push('<tr>');
			//html.push('<th>' + weekNumber + '</th>');
		}

		var firstdayofmonth = new Date(dayInfo.date.getFullYear(), dayInfo.date.getMonth(), 1);
		var lastdayofmonth = new Date(dayInfo.date.getFullYear(), dayInfo.date.getMonth()+1, 0);
		var firstday = (dayInfo.date.getDate() == 1);
		var lastday = (dayInfo.date.getDate() == lastdayofmonth.getDate()  );
		
		var firstdayofweek = firstdayofmonth.getDay();
		var lastdayofweek = lastdayofmonth.getDay();
		var firstweek = dayInfo.date.getDate() < 7 && dayInfo.date.getDay() < 8 - firstdayofweek;
		var lastweek = dayInfo.date.getDate() > lastdayofmonth.getDate()-7; //  && dayInfo.date.getDay() < 8 - lastdayofweek;;
		
		html.push('<td class="' + 
					(bookInfo != null ? 'section-' + bookInfo.section : '') + 
					(firstday ? ' monthstart' : '') + 
					(lastday ? ' monthend' : '') + 
					(firstweek ? ' firstweek' : '') + 
					(lastweek ? ' lastweek' : '') + 
			'">' + 
			'<span class="date">' + (firstday ? dayInfo.date.monthAbbr() + ' ' : '') + dayInfo.date.getDate() + '</span>' + 
			//'<span class="verses">' + formatChapterRange(dayInfo.chapters) + '</span>' + 
			'<span class="verses">' + dayInfo.formattedReading + '</span>' + 
		'</td>');		
		
		// close on saturday
		if (dayInfo.date.getDay() == 6) {
			html.push('</tr>');
			weekNumber++;
		}
		
		lastMonth = dayInfo.date.getMonth()		
	}
	html.push('</tbody>');
	html.push('</table>');
	
	
	return html.join('\n');
	
}



function buildbooks(data, days, bookList, dayList, dailyPsalm, dailyProverb) {
	
	var html = [];
	html.push('<style>');
	html.push('* { margin: 0; padding: 0; box-sizing: border-box;}');
	html.push('body { font-size: 7pt; line-height: 1.2; font-family: Helvetica; color: #fff; }');	
	
	html.push('.clear { clear:both; }');
	html.push('.box { margin: 0 0.01in 0.05in 0; border: solid 1px #111; height: 0.15in; padding: 1pt; display: inline-block;}');		
	html.push('.book { margin: 0 0 0.05in 0; }');	
		html.push('.name { width: 1in; float: left; margin-right: 0.1in;}');	
		html.push('.title { width: 1in;  }');	
		html.push('.chapters { width: 3in; float: left; }');		
		html.push('.chapter { width: 0.15in;  }');	
		
	for (var i=2; i<20; i++) {
		html.push('.days-' + i + ' { width: ' + (0.15 * i + 0.01 * (i-1)) + 'in;  }');	
	}		
	
	html.push('.section-pentateuch { background: #cbf4fb; #469eac;  }');		
	html.push('.section-historical { background: #e2f7bd; #839f50;  }');	
	html.push('.section-poetic { background: #fbf5c3; #beb45a;  }');	
	html.push('.section-major { background: #f7ddef; #b38fa8;  }');	
	html.push('.section-minor { background: #f7ddef; #b18da7;  }');	
	html.push('.section-gospel { background: #fdc6ca; #ce1f2c;  }');	
	html.push('.section-acts { background: #fbe6ac; #deb545;  }');	
	html.push('.section-paul { background: #bafdf6; #008376;  }');	
	html.push('.section-general { background: #c0f9ae; #5d974b;  }');	
	html.push('.section-revelation { background: #b0a6f3; #6b6499;  }');	
	html.push('</style>');
	
	var lastBookUsfm = '',
		lastChapterNumber = 0;
		
	/*
	for (var bookId in bookList) {
		var bookInfo = bible.BIBLE_DATA_USFM[bookId];
		
		html.push('<div class="book" class="' + '');
		
		
	}
	*/	
	

	for (var i=0; i<data.days.length; i++) {
		var dayInfo = data.days[i];
		
		console.log(i);
		
		// ignore empty days
		if (dayInfo.chapters.length == 0) {
			continue;
		}
		
		for (var j=0; j<dayInfo.chapters.length; j++) {
			var chapter = dayInfo.chapters[j],
				bookInfo = bible.BIBLE_DATA_USFM[chapter.usfm];
				
			if (lastBookUsfm != bookInfo.usfm) {
				
				// close last one
				if (lastBookUsfm != '') {					
					html.push('</div><div class="clear"></div></div>');
				}
				
				// open this one
				html.push('<div class="book">');
				html.push('<div class="name"><span class="box title section-' + bookInfo.section + '">' + bookInfo.names.en + '</span></div>');				
				html.push('<div class="chapters">');
								
								
			}
			
			// simple
			//html.push('<span class="box chapter section-' + bookInfo.section + '">' + chapter.chapter + '</span>');
			
			// how many days is this run?
			var daysCount = 1,
				foundEnd = false;
			
			j++;
			while (j<dayInfo.chapters.length && !foundEnd) {
				var nextchapter = dayInfo.chapters[j];
				if (nextchapter.usfm == chapter.usfm) {
					daysCount++;
					j++;
				} else {
					j--;
					foundEnd = true;
				}
			}
			
			html.push('<span class="box chapter section-' + bookInfo.section + ' days-' + daysCount + '">' + 
				(dayInfo.date.getMonth()+1) + '/' + (dayInfo.date.getDate()+1) + 
			'</span>');
			
			lastBookUsfm = chapter.usfm;	
			
		}
		
	
	}
	
	
	// close last one	
	html.push('</div><div class="clear"></div></div>');	
	
	
	return html.join('\n');
	
}

generate();