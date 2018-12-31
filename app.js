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

// save
var saveData = (function () {
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    return function (blob, fileName) {
       // var json = JSON.stringify(data),
        //    blob = new Blob([json], {type: "octet/stream"}),
        var url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
    };
}());


// EVENTS
$('#section-time input, ' + 
	'#section-days input, ' + 
	'#section-books input, ' + 
	'#section-options input, ' + 
	'#section-format input').on('change keyup', updateDisplay);

// traditional ot/nt clicking
$('.order-traditional input').on('click', adjustBooks);
$('[name=bibleorder]').on('click', enableTestaments);

$('#download-ics').on('click', downloadics);
$('#download-pdf').on('click', downloadpdf);

function enableTestaments() {
	var check = $(this);

	check
		.closest('.order-group')
			.find('input[type=checkbox]')
				.prop('disabled',false)
			.end()
		.siblings('.order-group')
			.find('input[type=checkbox]')
			.prop('disabled',true);

}

function adjustBooks() {
	var check = $(this);
	
	if (check.closest('label').hasClass('books-testament')) {		
		// parent
		
		check
			.closest('details')
			.find('input')
			.prop('checked', check.prop('checked'));
		
	} else {
		
		var parent = check.closest('details').find('.books-testament input');
		
		if (check.prop('checked')) {
			// check others
			var allchecked = true;
			check.closest('.books-list').find('input').each(function() {
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

	updateDisplay();
}

function downloadics() {
	var code = generate('ics');

	var blob = new Blob([code], {type: "text/calendar;charset=utf-8"});
	saveData(blob, 'bibleplan.ics');

	//window.open( "data:text/calendar;charset=utf8," + escape(html));

	//html = html.replace(/\n/gi,'<br>');	
}

function downloadpdf() {
	var doc = new jsPDF({unit:'in', format:'letter'}),
		margin = 0.75;

	// create heading
	doc.text('Bible Reading Plan', margin, margin, {align:'left'});

	// main code
	var format = $('input:radio[name="formatstyle"]:checked').val();
	var code = generate(format);
	
	//

	setTimeout(function(){
        var data = doc.output('datauri')
		//$('iframe').attr('src', data);
		$('#output').html('<iframe class="pdf" type="application/pdf" src="' + data + '"></iframe>');
    }, 10)

	// demo
	

	//doc.save('bible-reading-plan.pdf')	
}

function updateDisplay() {

	var format = $('input:radio[name="formatstyle"]:checked').val();

	var code = generate(format);

	if ($('#options-sectioncolors').is(':checked')) {
		$('#output').addClass('plan-color');
	} else {
		$('#output').removeClass('plan-color');
	}

	if ($('#options-checkbox').is(':checked')) {
		$('#output').addClass('plan-checkbox');
	} else {
		$('#output').removeClass('plan-checkbox');
	}	

	$('#output').html(code);

	updateUrl();	
}

function generate(format) {
	
	var 
		startDate = new Date($('#time-startdate').val()),
		duration = parseInt($('#time-days').val(), 10),
		books = [],
		daysOfWeek = [],
		order = $('input:radio[name="bibleorder"]:checked').val();
	
	daysOfWeek = $('#section-days input:checked').map(function() { 
		return parseInt($(this).val(), 10) - 1;
	}).get();

	
 	if (order == 'traditional') {
		books = $('.order-traditional .books-list input[type=checkbox]:checked').map(function(index, el) { 
			return $(this).val();
		}).get();	
	} else if (order == 'chronological') {
		books = $('.order-chronological input[type=checkbox]:checked').map(function(index, el) { 
			return $(this).val();
		}).get();
	}
	
	
	// BUG
	var datastartDate = startDate.addDays(1);
	var data = getPlanData(order, datastartDate, duration, books, daysOfWeek, $('#options-dailypsalm').is(':checked'), $('#options-dailyproverb').is(':checked'));
	var code = window['build' + format](data, startDate, duration, books, daysOfWeek);	
	
	return code;
}

function getPlanData(order, startDate, numberOfDays, bookList, daysOfWeek, dailyPsalm, dailyProverb) {
	
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
			dayList: daysOfWeek,			
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
			chapters: [],								
		};
		
	
		
	// count reading days (within the plan length)
	for (var i=0; i<numberOfDays; i++) {
		var date = startDate.addDays(i);
		// is this an included day
		if (daysOfWeek.indexOf(date.getDay()) > -1) {
			data.readingDays++;
		}
	}
	
	if (order == 'traditional') {
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
		
		data.chaptersPerDay = data.totalChapters/data.readingDays;
		data.versesPerDay = data.totalVerses/data.readingDays;
		data.wordsPerDay = data.totalWords/data.readingDays;
		//data.minPerDay = data.totalWords/reading_days/wpm;
	} else {

		var chapters = [];

		if (bookList.indexOf('ot') > -1) {
			chapters = chapters.concat( bible.plans.chronological.ot );
		}
		if (bookList.indexOf('nt') > -1) {
			chapters = chapters.concat( bible.plans.chronological.nt );
		}		

		data.chapters = chapters;
		data.totalChapters = chapters.length;
		data.chaptersPerDay = data.totalChapters/data.readingDays;
	}
	
	
	// create an entry for each day	
	var date = startDate,
		lastBookIndex = -1,
		currentBookIndex = 0,
		currentBookUsfm = bookList[currentBookIndex],
		currentChapterNumber = 1,
		chapterIndex = 0,
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
		if (daysOfWeek.indexOf( dayInfo.date.getDay() ) == -1 ) {
			dayInfo.formattedReading = '';
			continue;
		}
			

		if (order == 'traditional') {
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
		} else {
			// chronological

			var chaptersForToday = data.chaptersPerDay + chaptersRemaining;

			while (chaptersForToday > 1 && chapterIndex < data.chapters.length) {
							
				// get this 
				var chapter = data.chapters[chapterIndex],
					parts = chapter.split('_'),
					usfm = parts[0],
					chapterNumber = parseInt(parts[1], 10);

				
				// add this one
				dayInfo.chapters.push({usfm:usfm, chapter: chapterNumber});			
									
				
				// iterate
				chapterIndex++;
				chaptersForToday--;
			}
			
			// double check we get remaining chapters
			// if (d == numberOfDays) {
			// 	while (chapterIndex < data.chapters.length) {
			// 		dayInfo.chapters.push({ usfm: currentBookUsfm, chapter: currentChapterNumber });			
							
			// 		chapterIndex++;
			// 	}
			// }	
			
			chaptersRemaining = chaptersForToday;
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

	
	html.push('<div class="plan-list">');
		
	var days = data.days;
	for (var i=0; i<days.length; i++) {
		var dayInfo = days[i],
			bookInfo = dayInfo.chapters.length > 0 ? bible.BIBLE_DATA_USFM[dayInfo.chapters[0].usfm] : null;
		//var fixeddate = dayInfo.date.addDays(1);
		//html.push('<tr>');
		html.push('<div class="entry section-' + (bookInfo != null ? bookInfo.section : '') + '">');
		html.push('<div class="date">' + dayInfo.date.monthAbbr() + ' ' + (dayInfo.date.getDate()) + '</div>');		
		//html.push('<span>' + formatChapterRange(dayInfo.chapters) + '</span>');		
		if (dayInfo.formattedReading != '') {
			html.push('<div class="verses">' + dayInfo.formattedReading + '</div>');		
		}
		html.push('</div>');
	}

	html.push('</div>');	
	
	return html.join('\n');
	
}

function buildics(data, days, bookList, dayList) {
	

	var ics = [];	
	
	ics.push('BEGIN:VCALENDAR');
	ics.push('VERSION:2.0');
	ics.push('PRODID:-//hacksw/handcal//NONSGML v1.0//EN');
		
	var days = data.days;
	for (var i=0; i<days.length; i++) {
		var dayInfo = days[i],
			formattedDate = dayInfo.date.getFullYear().toString() + (dayInfo.date.getMonth()+1).toString().padStart(2,'0') + dayInfo.date.getDate().toString().padStart(2,'0');
		
		if (dayInfo.formattedReading != '' && dayInfo.formattedReading != '---') {
			ics.push('BEGIN:VEVENT');
			ics.push('DTSTAMP:' + formattedDate + 'T000000Z');
			ics.push('DTSTART;VALUE=DATE:' + formattedDate + '');
			ics.push('DTEND;VALUE=DATE:' + formattedDate + '');
			ics.push('SUMMARY:' + dayInfo.formattedReading);		
			ics.push('END:VEVENT');
		}
	}

	ics.push('END:VCALENDAR');

	return ics.join('\n');
	
}



function buildcalendar(data, days, bookList, dayList, dailyPsalm, dailyProverb) {
	
	var daysOfWeek = ['Sunday','Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
	
	var html = [];

	html.push('<table class="plan-calendar">');
	
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
			(dayInfo.formattedReading != '' ? '<span class="verses">' + dayInfo.formattedReading + '</span>' : '') + 
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
			
	for (var i=2; i<20; i++) {
	//	html.push('.plan-books  .chapters-' + i + ' { min-width: ' + (0.25 * i + 0.01 * (i-1)) + 'in;  }');	
	}		
		
	html.push('</style>');
	
	html.push('<div class="plan-books">');

	var lastBookUsfm = '',
		lastChapterNumber = 0;
	
	for (var i=0; i<data.days.length; i++) {
		var dayInfo = data.days[i];
		
		//console.log(i);
		
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
					html.push('</div></div>');
				}
				
				// open this one
				html.push('<div class="book">');
				html.push('<div class="name"><span class="box title section-' + bookInfo.section + '">' + bookInfo.names.en + '</span></div>');				
				html.push('<div class="chapters">');
								
								
			}
			
			// simple
			//html.push('<span class="box chapter section-' + bookInfo.section + '">' + chapter.chapter + '</span>');
			
			// how many days is this run?
			var chaptersOnThisDay = 1,
				foundEnd = false,
				startChapter = dayInfo.chapters[j].chapter,
				endChapter = dayInfo.chapters[dayInfo.chapters.length-1].chapter;
			
			j++;
			while (j<dayInfo.chapters.length && !foundEnd) {
				var nextchapter = dayInfo.chapters[j];
				if (nextchapter.usfm == chapter.usfm) {
					chaptersOnThisDay++;
					j++;
				} else {
					j--;
					foundEnd = true;
					endChapter = dayInfo.chapters[j].chapter;
				}
			}
			
			html.push('<span class="box chapter section-' + bookInfo.section + ' chapters-' + chaptersOnThisDay + '">' + 
				(dayInfo.date.getMonth()+1) + '/' + (dayInfo.date.getDate()) + ': ' + startChapter + (startChapter != endChapter ? '-' + endChapter : '') +
			'</span>');
			
			lastBookUsfm = chapter.usfm;	
			
		}
		
	
	}
	
	
	// close last one	
	html.push('</div><div class="clear"></div></div>');	

	// close container
	html.push('</div>');
	
	
	return html.join('\n');
	
}

function updateUrl() {
	// params
	var start = $('#time-startdate').val(),
		total = $('#time-days').val(),
		format = $('input[name=formatstyle]:checked').val(),
		order = $('input[name=bibleorder]:checked').val(),	
		daysofweek = $( '#section-days input:checked' ).map(function() {
			return $( this ).val();
		  })
		  .get()
		  .join( ',' ),
		books = [];

	if (order == 'traditional') {
		if ($('.order-traditional .section-ot').is(':checked')) {
			books.push('ot');
		} else {
			$('.order-traditional .section-ot').closest('details').find('.books-list input').each(function() {
				if ($(this).is(':checked'))
					books.push($(this).val());
			});
		}

		if ($('.order-traditional .section-nt').is(':checked')) {
			books.push('nt');
		} else {
			$('.order-traditional .section-nt').closest('details').find('.books-list input').each(function() {
				if ($(this).is(':checked'))
					books.push($(this).val());
			});
		}		
	} else {
		if ($('.order-chronological .section-ot').is(':checked')) {
			books.push('ot');		
		}
		if ($('.order-chronological .section-nt').is(':checked')) {
			books.push('nt');
		}
	}

	// update URL
	history.replaceState({}, 'page', 
				'?start=' + start + 
				'&total=' + total + 
				'&format=' + format + 
				'&order=' + order + 
				'&daysofweek=' + daysofweek + 
				'&books=' + books.join(',') + 
			
				'&checkbox=' + ($('#options-checkbox').is(':checked') ? '1' : '0') +
				'&colors=' + ($('#options-sectioncolors').is(':checked') ? '1' : '0') +
				'&psalm=' + ($('#options-dailypsalm').is(':checked') ? '1' : '0') +
				'&proverb=' + ($('#options-dailyproverb').is(':checked') ? '1' : '0') +
				
		  		''				
				);

	
}


function startup() {

	var urlParams = new URLSearchParams(window.location.search);

	// start
	var startdate = null;
	if (urlParams.has('start')) {		
		startdate = new Date(urlParams.get('start'));
		// time zone screws it up?
		if (startdate) {
			startdate = startdate.addDays(1);
		}
	}
	if (!startdate) {
		var today = new Date(),
		startdate = new Date(today.getFullYear(), today.getMonth()+1, 1);
	}
	$('#time-startdate').val(startdate.toInputField() );		

	// total days
	var total = null;
	if (urlParams.has('total')) {
		total = urlParams.get('total');
	}
	if (!total) {
		total = 365;	
	}	
	$('#time-days').val( total );	
	

	// format
	var format = '';
	if (urlParams.has('format')) {		
		format = urlParams.get('format');
	} else {
		format = 'calendar';
	}
	$('input[name=formatstyle][value=' + format + ']').prop('checked', true);

	// days of week
	var daysofweek = '';
	if (urlParams.has('daysofweek')) {		
		daysofweek = urlParams.get('daysofweek')
	} else {
		daysofweek = '1,2,3,4,5,6,7';
	}
	daysofweek = daysofweek.split(',');
	for (var i=0; i<daysofweek.length; i++) {
		var dayval = daysofweek[i];
		$('#days-' + dayval).prop('checked', true);
	}

	// order
	var order = '';
	if (urlParams.has('order')) {		
		order = urlParams.get('order');
	} else {
		order = 'traditional';
	}
	$('input[name=bibleorder][value=' + order + ']').prop('checked', true);
	

	// books of bible	
	var books = '';
	if (order == 'traditional') {
		if (urlParams.has('books')) {		
			books = urlParams.get('books');
			books = books.split(',');

			if (books.indexOf('ot') > -1) {
				$('.order-traditional .section-ot')					
					.closest('details')
					.find('input')
					.prop('checked',true);
			}
			if (books.indexOf('nt') > -1) {
				$('.order-traditional .section-nt')					
					.closest('details')
					.find('input')
					.prop('checked',true);
			}			

			for (var i=0; i<books.length; i++) {
				$('#book-' + books[i]).prop('checked',true);
			}

		} else {
			$('.order-traditional input').prop('checked',true);
		}
		
		$('.order-chronological input[type=checkbox]')
			.prop('checked',true)
			.prop('disabled',true);
	} else {
		if (urlParams.has('books')) {		
			books = urlParams.get('books');
			books = books.split(',');

			if (books.indexOf('ot') > -1) {
				$('.order-chronological .section-ot')
					.prop('checked',true);
			}
			if (books.indexOf('nt') > -1) {
				$('.order-chronological .section-nt')					
					.prop('checked',true);
			}			
		} else {
			$('.order-chronological input').prop('checked',true);
		}

		$('.order-traditional input[type=checkbox]')
			.prop('checked',true)
			.prop('disabled',true);
	}
	


	// options
	if (urlParams.get('checkbox') == '1' || urlParams.get('checkbox') == '' || !urlParams.has('checkbox')) {	
		$('#options-checkbox').prop('checked',true);
	}	
	if (urlParams.get('colors') == '1') {	
		$('#options-sectioncolors').prop('checked',true);	
	}
	if (urlParams.get('dailypsalm') == '1') {	
		$('#options-dailypsalm').prop('checked',true);	
	}
	if (urlParams.get('dailyproverb') == '1') {	
		$('#options-dailyproverb').prop('checked',true);	
	}


	

	updateDisplay();
}
startup();