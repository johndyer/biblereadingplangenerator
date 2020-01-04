
function getPlanData(lang, order, startDate, numberOfDays, bookList, daysOfWeek, dailyPsalm, dailyProverb, combineOTandNT) {
	
	var psalmNumber = 1;
	var psalmMax = 150;
	var proverbNumber = 1;
	var proverbMax = 31;
	var rangeIncludesPsalm = false;
	var rangeIncludesProverb = false;


	var data = {
			startDate: startDate,
			numberOfDays: numberOfDays,
			bookList: bookList,			
			dayList: daysOfWeek,	
			readingDays: 0,
			days: [],			
			chapterGroups: [],							
		};

	const chapterGroupModel = {
		name: 'default',
		// totals
		chapters: [], 
		totalBooks: 0,
		totalChapters: 0,
		totalVerses: 0,
		totalWords: 0,		
		chaptersPerDay: 0,
		versesPerDay: 0,
		wordsPerDay: 0,

		// for daily iterations
		chaptersRemaining: 0,
		wordsRemaining: 0,
		firstDayWithReadingHasPassed: false,
		currentBookIndex: 0,
		currentBookUsfm: null,
		currentChapterNumber: -1,
		chapterIndex: 0,		
	};
		
	// count reading days (within the plan length)
	for (var i=0; i<numberOfDays; i++) {
		var date = startDate.addDays(i);
		// is this an included day
		if (daysOfWeek.indexOf(date.getDay()) > -1) {
			data.readingDays++;
		}
	}

	// first/main list
	data.chapterGroups.push( Object.create(chapterGroupModel) );
	
	// create chapter lists and groups
	if (order == 'traditional') {

		// determine if a second group is needed
		if (combineOTandNT) {
			var hasNT = false,
				hasOT = false;

			for (var i=0; i<bookList.length; i++) {
				var usfm = bookList[i];
				if (bible.NT_BOOKS.indexOf(usfm) > -1) {
					hasNT = true;
				}
				if (bible.OT_BOOKS.indexOf(usfm) > -1 || bible.DC_BOOKS.indexOf(usfm) > -1) {
					hasOT = true;
				}
			}

			if (hasOT && hasNT) {
				// NT list
				data.chapterGroups.push( Object.create(chapterGroupModel) );

				data.chapterGroups[0].name = 'OT';
				data.chapterGroups[1].name = 'NT';				
				data.chapterGroups[1].chapters = [];
			}
		}

		// create list
		for (var i=0; i<bookList.length; i++) {
			var usfm = bookList[i],
				bookInfo = bible.BIBLE_DATA[ usfm ],
				chapterGroup = null;

			// find the correct group to add this chapter to
			if (combineOTandNT && bible.NT_BOOKS.indexOf(usfm) > -1 && data.chapterGroups.length > 1) {
				chapterGroup = data.chapterGroups[1];
			} else {
				chapterGroup = data.chapterGroups[0];
			}

			// chapters
			for (var j=0; j<bookInfo.chapters.length; j++) {				
				chapterCode = usfm + '_' + (j+1);
				
				chapterGroup.chapters.push(chapterCode);				
			}	
		}

	} else if (order == 'chronological') {
		// chronological

		if (bookList.indexOf('OT') > -1) {
			data.chapterGroups[0].chapters = data.chapterGroups[0].chapters.concat( bible.plans.chronological.OT );
		}		

		if (bookList.indexOf('NT') > -1) {
			var ntChapterGroup = data.chapterGroups[0];
			if (combineOTandNT) {
				// NT list
				data.chapterGroups.push( Object.create( chapterGroupModel) );
				
				ntChapterGroup = data.chapterGroups[1];

				data.chapterGroups[0].name = 'OT';
				data.chapterGroups[1].name = 'NT';
				data.chapterGroups[1].chapters = [];
			}
			ntChapterGroup.chapters = ntChapterGroup.chapters.concat( bible.plans.chronological.NT );
		}
	} else if (order == 'mcheyne') {
		data.chapterGroups.push( Object.create( chapterGroupModel) );
		data.chapterGroups.push( Object.create( chapterGroupModel) );
		data.chapterGroups.push( Object.create( chapterGroupModel) );

		data.chapterGroups[0].chapters = bible.plans.mcheyne["1"];
		data.chapterGroups[1].chapters = bible.plans.mcheyne["2"];
		data.chapterGroups[2].chapters = bible.plans.mcheyne["3"];
		data.chapterGroups[3].chapters = bible.plans.mcheyne["4"];
	} else if (order == 'thematic') {	
		
		var chapterArray = [],
			themes = ['epistles','law','history','psalms','poetry','prophecy','gospels'];
		
		themes.forEach(function(themeName) {
			chapterArray = chapterArray.concat(bible.plans.thematic[themeName]);
		});

		data.chapterGroups[0].chapters = chapterArray;
	}
	
	// calculate totals
	data.chapterGroups.forEach(function(chapterGroup) {

		chapterGroup.chapters.forEach(function(chapterCode, index) {
			if (chapterCode) {
				var parts = chapterCode.split('_');			
					usfm = parts[0]
					chapterNumber = parseInt(parts[1], 10);
					bookInfo = bible.BIBLE_DATA[usfm];
				
				// total up verses and words for group
				chapterGroup.totalVerses += bookInfo.chapters[chapterNumber-1];	
				chapterGroup.totalWords += (bookInfo.words) ? bookInfo.words[chapterNumber-1] : 500;
			} else {
				debugger;
			}
		});

		// full totals
		chapterGroup.totalChapters = chapterGroup.chapters.length;
		chapterGroup.chaptersPerDay = chapterGroup.totalChapters/data.readingDays;
		chapterGroup.versesPerDay = chapterGroup.totalVerses/data.readingDays;
		chapterGroup.wordsPerDay = chapterGroup.totalWords/data.readingDays;
	});
		
	// create an entry for each day	
	var date = startDate,
		ended = false;
					
	for (var d=1; d<=numberOfDays && !ended; d++) {
		
		var dayInfo = {
			day: d,
			date: date,			
			chapterGroups: [],

			// merged down from groups
			formattedReading: '',
			chapters: [],
			wordsForToday: 0,
			versesForToday: 0,
		};		
		data.days.push(dayInfo);

		// create groups
		data.chapterGroups.forEach(function(chapterGroup) {
			dayInfo.chapterGroups.push({			
				wordsForToday: 0,
				versesForToday: 0,			
				chapters: [],
			});
		});
		
		// iterate the date here, because we'll skip days below
		date = date.addDays(1);
		
		// skip unused days
		if (daysOfWeek.indexOf( dayInfo.date.getDay() ) == -1 ) {
			dayInfo.formattedReading = '';
			continue;
		}  
			
		var logic = 'chapters'; //'words';

		var urlParams = new URLSearchParams(window.location.search);
		if (urlParams.get('logic') == 'words') {
			logic = 'words';
		}

		if (logic == 'chapters') {

			// create a list of chapters for this day 
			// from all the chapters groups

			data.chapterGroups.forEach(function(dataChapterGroup, chapterGroupIndex) {

				var dayChapterGroup = dayInfo.chapterGroups[chapterGroupIndex];

				var chaptersForToday = dataChapterGroup.chaptersPerDay + dataChapterGroup.chaptersRemaining;

				if (d == 1 && chaptersForToday < 1) {
					chaptersForToday = 1;
				}

				// last one
				if (d == numberOfDays) {
					chaptersForToday = dataChapterGroup.chapters.length - dataChapterGroup.chapterIndex + 1;
				}
	
				while (chaptersForToday >= 1 && dataChapterGroup.chapterIndex < dataChapterGroup.chapters.length) {
					var chapterCode = dataChapterGroup.chapters[dataChapterGroup.chapterIndex],
						parts = chapterCode.split('_');
					
					dataChapterGroup.currentBookUsfm = parts[0]
					dataChapterGroup.currentChapterNumber = parseInt(parts[1], 10);
					bookInfo = bible.BIBLE_DATA[dataChapterGroup.currentBookUsfm];
					
					// add this next one
					dayChapterGroup.chapters.push({
										usfm: dataChapterGroup.currentBookUsfm, 
										chapter: dataChapterGroup.currentChapterNumber
									});			
						
					// total up verses for the day
					dayChapterGroup.versesForToday += bookInfo.chapters[dataChapterGroup.currentChapterNumber-1];
					dayChapterGroup.wordsForToday += bookInfo.words ? bookInfo.words[dataChapterGroup.currentChapterNumber-1] : 500;
						
					chaptersForToday--;
					dataChapterGroup.chapterIndex++;
				}
				
				dataChapterGroup.chaptersRemaining = chaptersForToday;
			});
							
		} else if (logic == 'words') {
			
			data.chapterGroups.forEach(function(dataChapterGroup, chapterGroupIndex) {

				var dayChapterGroup = dayInfo.chapterGroups[chapterGroupIndex];

				var wordsForDay = dataChapterGroup.wordsPerDay + dataChapterGroup.wordsRemaining;

				// last one
				if (d == numberOfDays) {
					wordsForDay = 10000000; // temp: just a big number 
				}			
							
				while (wordsForDay > 0 && dataChapterGroup.chapterIndex < dataChapterGroup.chapters.length) {
					var chapterCode = dataChapterGroup.chapters[dataChapterGroup.chapterIndex],
						parts = chapterCode.split('_');
					
					dataChapterGroup.currentBookUsfm = parts[0];
					dataChapterGroup.currentChapterNumber = parseInt(parts[1], 10);
					bookInfo = bible.BIBLE_DATA[dataChapterGroup.currentBookUsfm];
					
					// check if the number of words is more or less than half of what's left
					var wordsInChapter = bookInfo.words ? bookInfo.words[dataChapterGroup.currentChapterNumber-1] : 500;
					if (wordsInChapter/2 > wordsForDay && firstDayWithReadingHasPassed) {
						break;
					}
					firstDayWithReadingHasPassed = true;

					// add this next one
					dayChapterGroup.chapters.push({
							usfm: dataChapterGroup.currentBookUsfm, 
							chapter: dataChapterGroup.currentChapterNumber});			
						
					// total up verses for the day
					dayChapterGroup.versesForToday += bookInfo.chapters[dataChapterGroup.currentChapterNumber-1];
					dayChapterGroup.wordsForToday += wordsInChapter;
		
					wordsForDay = wordsForDay - wordsInChapter;	
					
					dataChapterGroup.chapterIndex++;						
				}
							
				// store the remainder for the next day
				dataChapterGroup.wordsRemaining = wordsForDay;
			});
			
		}


		// merge down and format		
		dayInfo.chapterGroups.forEach(function(dayChapterGroup) {
			dayInfo.wordsForToday += dayChapterGroup.wordsForToday;
			dayInfo.versesForToday += dayChapterGroup.versesForToday;
			dayInfo.chapters = dayInfo.chapters.concat(dayChapterGroup.chapters);
		});

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

function formatChapterGroupsRange(lang, chapterGroups, isFullname) {
	var mergedChapters = [].concat.apply([], chapterGroups);
	return formatChapterRange(lang, mergedChapters, isFullName)
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



function buildlist(lang, data, startDate, duration, bookList, dayList, showStats) {
	
	var html = [];

	html.push('<div class="plan-list">');
		
	var days = data.days,
		lastMonth = -1;

	for (var i=0; i<days.length; i++) {
		var dayInfo = days[i],
			bookInfo = dayInfo.chapters.length > 0 ? bible.BIBLE_DATA[dayInfo.chapters[0].usfm] : null;
		//var fixeddate = dayInfo.date.addDays(1);
		//html.push('<tr>');
		if (lastMonth != dayInfo.date.getMonth()) {
			html.push('<div class="entry month-divider">' + dayInfo.date.monthName(lang) + '</div>');
		}

		html.push('<div class="entry section-' + (bookInfo != null ? bible.SECTIONS[bookInfo.section] : '') + '">');
		html.push('<div class="date">' + dayInfo.date.monthAbbr(lang) + ' ' + (dayInfo.date.getDate()) + '</div>');		
		//html.push('<span>' + formatChapterRange(dayInfo.chapters) + '</span>');		
		if (dayInfo.formattedReading != '') {
			html.push('<div class="verses">' + dayInfo.formattedReading + '</div>');		
		}
		html.push('</div>');

		lastMonth = dayInfo.date.getMonth();
	}

	html.push('</div>');	
	
	return html.join('\n');
	
}

function buildweeks(lang, data, startDate, duration, bookList, dayList, showStats) {
	
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


function buildics(lang, data, startDate, duration, bookList, dayList, showStats) {
	

	var ics = [];	
	
	ics.push('BEGIN:VCALENDAR');
	ics.push('VERSION:2.0');
	ics.push('PRODID:-//hacksw/handcal//NONSGML v1.0//EN');

	function formatDate(date) {
		return date.getFullYear().toString() + 
				(date.getMonth()+1).toString().padStart(2,'0') + 
				date.getDate().toString().padStart(2,'0');
	}
		
	var days = data.days;
	for (var i=0; i<days.length; i++) {
		var dayInfo = days[i],
			startFormatted = formatDate(dayInfo.date),
			endDate = dayInfo.date.addDays(1),
			endFormatted = formatDate(endDate);
		
		if (dayInfo.formattedReading != '' && dayInfo.formattedReading != '---') {
			ics.push('BEGIN:VEVENT');
			//ics.push('DTSTAMP:' + startFormatted + 'T000000Z');
			ics.push('DTSTART;VALUE=DATE:' + startFormatted + '');
			ics.push('DTEND;VALUE=DATE:' + endFormatted + '');
			ics.push('SUMMARY:' + dayInfo.formattedReading);		
			ics.push('END:VEVENT');
		}
	}

	ics.push('END:VCALENDAR');

	return ics.join('\n');
	
}



function buildcalendar(lang, data, startDate, duration, bookList, dayList, showStats) {
	
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
			(dayInfo.formattedReading != '' ? 
				'<span class="verses">' + dayInfo.formattedReading + '</span>' +
				(showStats ?
					'<span class="stats">' +
						'words: ' + dayInfo.wordsForToday + 
						'<br>' +
						'verses: ' + dayInfo.versesForToday + 
					'</span>' 
					: '')
				: '') + 
			
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

function buildbooks(lang, data, startDate, duration, bookList, dayList, showStats) {
	
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