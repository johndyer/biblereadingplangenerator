
function getPlanData(lang, order, startDate, numberOfDays, bookList, daysOfWeek, dailyPsalm, dailyProverb) {
	
	var psalmNumber = 1;
	var psalmMax = 150;
	var proverbNumber = 1;
	var proverbMax = 31;
	var rangeIncludesPsalm = false;
	var rangeIncludesProverb = false;

	var combineNTandOT = true;

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
			chapterGroups: [],							
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

		var otlist = [],
			ntlist = [],
			completeList = [];

		// get sums of chapters, books, ect.	
		for (var i=0; i<bookList.length; i++) {
			var usfm = bookList[i],
				bookInfo = bible.BIBLE_DATA[ usfm ];
			
			// chapters
			data.totalChapters += bookInfo.chapters.length; 
			
			// verses
			for (var j=0; j<bookInfo.chapters.length; j++) {
				data.totalVerses += bookInfo.chapters[j];	
				data.totalWords += (bookInfo.words) ? bookInfo.words[j] : 500;			

				chapterCode = usfm + '_' + (j+1);
				if (combineNTandOT) {
					completeList.push(chapterCode);
				} else {
					if (bible.NT_BOOKS.indexOf(usfm) > -1) {
						ntlist.push(chapterCode);
					} else if (bible.OT_BOOKS.indexOf(usfm) > -1 || bible.DC_BOOKS.indexOf(usfm) > -1) {
						otlist.push(chapterCode);
					}
				}					
			}	
		}
		
		if (combineNTandOT) {
			data.chapterGroups.push(completeList);
		} else {
			if (otlist.length > 0) {
				data.chapterGroups.push(otlist);
			}
			if (ntlist.length > 0) {
				data.chapterGroups.push(ntlist);	
			}			
		}

		data.chapters = [].concat.apply([], data.chapterGroups);
		data.chaptersPerDay = data.totalChapters/data.readingDays;
		data.versesPerDay = data.totalVerses/data.readingDays;
		data.wordsPerDay = data.totalWords/data.readingDays;
		//data.minPerDay = data.totalWords/reading_days/wpm;		

	} else {

		if (combineNTandOT) {
			if (bookList.indexOf('OT') > -1) {
				data.chapterGroups.push( bible.plans.chronological.OT );
			}
			if (bookList.indexOf('NT') > -1) {
				data.chapterGroups.push( bible.plans.chronological.NT );
			}			

		} else {

			var chapters = [];

			if (bookList.indexOf('OT') > -1) {
				chapters = chapters.concat( bible.plans.chronological.OT );
			}
			if (bookList.indexOf('NT') > -1) {
				chapters = chapters.concat( bible.plans.chronological.NT );
			}	
					
			data.chapterGroups.push(chapters);
		}

		// merge down
		data.chapters = [].concat.apply([], data.chapterGroups);
		data.totalChapters = data.chapters.length;
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
		firstDayWithReadingHasPassed = false,
		date = startDate,
		ended = false;
					
	for (var d=1; d<=numberOfDays && !ended; d++) {
		
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
			
		var logic = 'chapters'; //'words';

		if (logic == 'chapters') {
				
			var chaptersForToday = data.chaptersPerDay + chaptersRemaining;

			// last one
			if (d == numberOfDays) {
				chaptersForToday = data.chapters.length - chapterIndex + 1;
			}

			while (chaptersForToday > 1) {
				var chapterCode = data.chapters[chapterIndex],
					parts = chapterCode.split('_');
				
				currentBookUsfm = parts[0]
				currentChapterNumber = parseInt(parts[1], 10);
				bookInfo = bible.BIBLE_DATA[currentBookUsfm];
				
				// add this next one
				dayInfo.chapters.push({usfm: currentBookUsfm, chapter: currentChapterNumber});			
					
				// total up verses for the day
				dayInfo.versesForToday += bookInfo.chapters[currentChapterNumber-1];
				dayInfo.wordsForToday += bookInfo.words ? bookInfo.words[currentChapterNumber-1] : 500;
					
				chaptersForToday--;
				chapterIndex++;
			}
			
			chaptersRemaining = chaptersForToday;		
			
		} else if (logic == 'words') {
			
			var wordsForDay = data.wordsPerDay + wordsRemaining;

			// last one
			if (d == numberOfDays) {
				wordsForDay = 10000000; // temp: just a big number 
			}			
						
			while (wordsForDay > 0 && chapterIndex < data.chapters.length) {
				var chapterCode = data.chapters[chapterIndex],
					parts = chapterCode.split('_');
				
				currentBookUsfm = parts[0]
				currentChapterNumber = parseInt(parts[1], 10);
				bookInfo = bible.BIBLE_DATA[currentBookUsfm];
				
				// check if the number of words is more or less than half of what's left
				var wordsInChapter = bookInfo.words ? bookInfo.words[currentChapterNumber-1] : 500;
				if (wordsInChapter/2 > wordsForDay && firstDayWithReadingHasPassed) {
					break;
				}
				firstDayWithReadingHasPassed = true;

				// add this next one
				dayInfo.chapters.push({usfm:currentBookUsfm, chapter: (currentChapterNumber)});			
					
				// total up verses for the day
				dayInfo.versesForToday += bookInfo.chapters[currentChapterNumber-1];
				dayInfo.wordsForToday += wordsInChapter;
	
				wordsForDay = wordsForDay - wordsInChapter;	
				
				chapterIndex++;						
			}
						
			// store the remainder for the next day
			wordsRemaining = wordsForDay;
			
		}


		// both ways
		dayInfo.formattedReading = formatChapterRange(lang, dayInfo.chapters);

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


function formatChapterRangeComma(lang, chapters, isFullname) {
	
	isFullname = isFullname || false;
	
	if (!chapters || chapters == null || chapters.length == 0) {
		return '';
	}
	
	var formatted = '',
		lastBookUsfm = '',
		lastChapterNumber = 0;

	for (var i=0; i<chapters.length; i++) {
		var chapter = chapters[i],
			bookInfo = bible.BIBLE_DATA[chapter.usfm];
		
		// new book
		if (chapter.usfm != lastBookUsfm)  {
			if (i > 0) {
				formatted += '; ';
			}			
			
			formatted += bible.getAbbr(bookInfo, lang) + 
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

function formatChapterRange(lang, chapters, isFullname) {
	
	isFullname = isFullname || false;
	
	if (!chapters || chapters == null || chapters.length == 0) {
        return '';
    }
	
	var formatted = '',
		previousBookUsfm = '',
		previousChapterNumber = 0,
		previousChapterWasRange = false,
		firstChapterOfBook = 0;
	
	for (var i=0; i<chapters.length; i++) {
		var chapter = chapters[i],
			bookInfo = bible.BIBLE_DATA[chapter.usfm];

		// new book
		if (chapter.usfm != previousBookUsfm)  {
			// past the first entry for this day
			if (i > 0) {
				// 
				if (firstChapterOfBook != previousChapterNumber) {
					formatted += '-' + previousChapterNumber.toString();
				}
				formatted += '; ';
			}
			
			// stary with the book name/abbr
			formatted += bible.getAbbr(bookInfo, lang);

			// add the first chapter (unless it's a single chapter book)
			if (bookInfo.chapters.length > 1) {
                formatted +=  ' ' + (chapter.chapter);
            }
			
			// store the first chapter we're using
			firstChapterOfBook = chapter.chapter;

		} else {

			// check that it's in sequence
			if (chapter.chapter-1 == previousChapterNumber) {

				// same book, but last entry
				if (i == chapters.length-1) {
					formatted += '-' + chapter.chapter.toString();
					previousChapterWasRange = false;
				} else {
					// wait for next one
					previousChapterWasRange = true;
					//formatted += ',' + chapter.chapter.toString();					
				}
			} else {
				if (previousChapterWasRange) {
					formatted += '-' + previousChapterNumber.toString();
				}
				formatted += ', ' + chapter.chapter.toString();
				previousChapterWasRange = false;
			}
			
		}
		
		// store
		previousChapterNumber = chapter.chapter;
		previousBookUsfm = chapter.usfm;
	}
	
	
	return formatted;
}



function buildlist(lang, data, days, bookList, dayList, dailyPsalm, dailyProverb) {
	
	var html = [];

	html.push('<div class="plan-list">');
		
	var days = data.days;
	for (var i=0; i<days.length; i++) {
		var dayInfo = days[i],
			bookInfo = dayInfo.chapters.length > 0 ? bible.BIBLE_DATA[dayInfo.chapters[0].usfm] : null;
		//var fixeddate = dayInfo.date.addDays(1);
		//html.push('<tr>');
		html.push('<div class="entry section-' + (bookInfo != null ? bible.SECTIONS[bookInfo.section] : '') + '">');
		html.push('<div class="date">' + dayInfo.date.monthAbbr(lang) + ' ' + (dayInfo.date.getDate()) + '</div>');		
		//html.push('<span>' + formatChapterRange(dayInfo.chapters) + '</span>');		
		if (dayInfo.formattedReading != '') {
			html.push('<div class="verses">' + dayInfo.formattedReading + '</div>');		
		}
		html.push('</div>');
	}

	html.push('</div>');	
	
	return html.join('\n');
	
}

function buildweeks(lang, data, days, bookList, dayList, dailyPsalm, dailyProverb) {
	
	var html = [],
		weekNumber = 1;

	html.push('<div class="plan-weeks">');

	// open first one
	html.push('<div class="week-block">');
	html.push('<div class="entry"><span class="week">Week ' + weekNumber + "</span></div>");
	weekNumber++;
		
	var days = data.days;
	for (var i=0; i<days.length; i++) {
		var dayInfo = days[i],
			bookInfo = dayInfo.chapters.length > 0 ? bible.BIBLE_DATA[dayInfo.chapters[0].usfm] : null;

		if (dayInfo.date.getDay() == 0 && i > 0) {
			html.push('</div>');
			html.push('<div class="week-block">');
			html.push('<div class="entry"><span class="week">Week ' + weekNumber + "</span></div>");
			weekNumber++;
		}

		if (dayInfo.formattedReading == '') {
			continue;
		}
			
		html.push('<div class="entry section-' + (bookInfo != null ? bible.SECTIONS[bookInfo.section] : '') + '">');
		html.push('<div class="date">' + dayInfo.date.monthAbbr(lang) + ' ' + (dayInfo.date.getDate()) + '</div>');		
		
		if (dayInfo.formattedReading != '') {
			html.push('<div class="verses">' + dayInfo.formattedReading + '</div>');		
		}
		html.push('</div>');
	}
	// close week
	html.push('</div>');

	// close list
	html.push('</div>');	
	
	return html.join('\n');
	
}


function buildics(lang, data, days, bookList, dayList) {
	

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



function buildcalendar(lang, data, days, bookList, dayList, dailyPsalm, dailyProverb) {
	
	//var daysOfWeek = ['Sunday','Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
	
	var html = [];

	html.push('<table class="plan-calendar">');
	
	// create calendar weekday heading
	html.push('<thead><tr>');
	var firstSunday = new Date();
	while (firstSunday.getDay() > 0) {
		firstSunday = firstSunday.addDays(-1);
	}
	for (var i=0; i<7; i++) {		
		var dayOfWeek = firstSunday.addDays(i);		
		html.push('<th>' + dayOfWeek.toLocaleDateString(lang, {weekday:"long"}) + '</th>');		
	}	
	
	html.push('</tr></thead>');
	
	// fill in until Sunday
	var days = appendDaysToSunday(data.days);
	
	html.push('<tbody>');
	
	var weekNumber = 1,
		lastMonth = -1;
	for (var i=0; i<days.length; i++) {
		var dayInfo = days[i],
			bookInfo = dayInfo.chapters.length > 0 ? bible.BIBLE_DATA[dayInfo.chapters[0].usfm] : null;
		
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
					(bookInfo != null ? 'section-' + bible.SECTIONS[bookInfo.section] : '') + 
					(firstday ? ' monthstart' : '') + 
					(lastday ? ' monthend' : '') + 
					(firstweek ? ' firstweek' : '') + 
					(lastweek ? ' lastweek' : '') + 
			'">' + 
			'<span class="date">' + (firstday ? dayInfo.date.monthAbbr(lang) + ' ' : '') + dayInfo.date.getDate() + '</span>' + 
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

function buildbooks(lang, data, days, bookList, dayList, dailyPsalm, dailyProverb) {
	
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
				bookInfo = bible.BIBLE_DATA[chapter.usfm];
				
			if (lastBookUsfm != chapter.usfm) {
				
				// close last one
				if (lastBookUsfm != '') {					
					html.push('</div></div>');
				}
				
				// open this one
				html.push('<div class="book">');
				html.push('<div class="name"><span class="box title section-' + bible.SECTIONS[bookInfo.section] + '">' + bible.getName(bookInfo, lang) + '</span></div>');				
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
			
			html.push('<span class="box chapter section-' + bible.SECTIONS[bookInfo.section] + ' chapters-' + chaptersOnThisDay + '">' + 
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