

function buildlist(lang, data, startDate, duration, bookList, dayList, showStats) {
	
	var html = [],
		today = new Date();

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

		html.push('<div class="entry ' + (isSameDay(today, dayInfo.date) ? ' is-today': '') + ' section-' + (bookInfo != null ? bible.SECTIONS[bookInfo.section] : '') + '">');
		html.push('<div class="date">' + dayInfo.date.monthAbbr(lang) + ' ' + (dayInfo.date.getDate()) + '</div>');		
		//html.push('<span>' + formatChapterRange(dayInfo.chapters) + '</span>');		
		if (dayInfo.formattedReading != '') {
			html.push('<div class="verses">' + dayInfo.formattedReading + '</div>');		
		}
		html.push('</div>');

		lastMonth = dayInfo.date.getMonth();
	}

	html.push('</div>');
	
	if (showStats) {
		html.push(createFinalStats(data.days))
	}	
	
	return html.join('\n');
	
}

function buildweeks(lang, data, startDate, duration, bookList, dayList, showStats) {
	
	var html = [],
		weekNumber = 1,
		today = new Date();

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
			
		html.push('<div class="entry ' + (isSameDay(today, dayInfo.date) ? ' is-today': '') + ' section-' + (bookInfo != null ? bible.SECTIONS[bookInfo.section] : '') + '">');
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
	
	if (showStats) {
		html.push(createFinalStats(data.days))
	}	
	
	return html.join('\n');
	
}

function isSameDay(d1, d2) {
	return d1.getFullYear() === d2.getFullYear() &&
	  d1.getDate() === d2.getDate() &&
	  d1.getMonth() === d2.getMonth();
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

function buildcsv(lang, data, startDate, duration, bookList, dayList, showStats) {

	let csv = [];
	
	csv.push('"Date","Passage"' + (showStats ? ',"Verse Count"' : ''));
		
	for (var i=0; i<data.days.length; i++) {
		let dayInfo = data.days[i],
			formattedDate = dayInfo.date.getFullYear().toString() + '-' +
							(dayInfo.date.getMonth()+1).toString().padStart(2,'0') +  '-' +
							dayInfo.date.getDate().toString().padStart(2,'0');
			

		csv.push('"' + formattedDate + '","' + dayInfo.formattedReading + '"' + (showStats ? ',"' + dayInfo.versesForToday + '"' : ''));
	}

	return csv.join('\n');
}



function buildcalendar(lang, data, startDate, duration, bookList, dayList, showStats) {
	
	//var daysOfWeek = ['Sunday','Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
	
	var html = [],
		today = new Date();

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
					(isSameDay(today, dayInfo.date) ? ' is-today': '') +
			'">' + 
			'<span class="date">' + (firstday ? dayInfo.date.monthAbbr(lang) + ' ' : '') + dayInfo.date.getDate() + '</span>' + 
			//'<span class="verses">' + formatChapterRange(dayInfo.chapters) + '</span>' + 
			(dayInfo.formattedReading != '' ? 
				'<span class="verses">' + dayInfo.formattedReading + '</span>' +
				(showStats ?
					'<span class="stats">' +
						'verses: ' + dayInfo.versesForToday + '<br>' +
						// (dayInfo.wordsForToday > 0 ? 
						// 	'words: ' + dayInfo.wordsForToday + '<br>' +					
						// 	'minutes: ' + (dayInfo.wordsForToday/250).toFixed(2)
						// 	: 
						// 	''
						// ) + 						
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

	if (showStats) {
		html.push(createFinalStats(data.days))
	}
	
	
	return html.join('\n');
	
}

function createFinalStats(days) {
	var stats = getPlanStats(days),
		html = `
			<div class="plan-stats">
				<table>
					<tr>
						<th>Average Verses:</th>
						<td>${stats.avg.toFixed(2)}</td>
					</tr>
					<tr>
						<th>Longest Day:</th>
						<td>${(days[stats.maxIndex].date.getMonth()+1) + '/' + days[stats.maxIndex].date.getDate()} - ${stats.max} verses</td>
					</tr>	
					<tr>
						<th>Shortest Day:</th>
						<td>${(days[stats.minIndex].date.getMonth()+1) + '/' + days[stats.minIndex].date.getDate()} - ${stats.min} verses</td>
					</tr>										
				</table>
			</div>
		`;
	return html;

}

function buildbooks(lang, data, startDate, duration, bookList, dayList, showStats) {
	
	var html = [],
		today = new Date();

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
			
			html.push('<span class="box chapter ' + (isSameDay(today, dayInfo.date) ? ' is-today': '') + ' section-' + bible.SECTIONS[bookInfo.section] + ' chapters-' + chaptersOnThisDay + '">' + 
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