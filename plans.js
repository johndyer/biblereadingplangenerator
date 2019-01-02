
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