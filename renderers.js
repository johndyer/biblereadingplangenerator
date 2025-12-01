

function buildlist(lang, data, startDate, duration, bookList, dayList, showStats, showDailyStats, noDates, includeUrls) {
	
	var html = [],
		today = new Date();

	html.push('<div class="plan-list">');
		
	var days = data.days,
		lastMonth = -1;

	for (var i=0; i<days.length; i++) {
		var dayInfo = days[i],
			bookInfo = dayInfo.chapters.length > 0 ? bible.BIBLE_DATA[dayInfo.chapters[0].usfm] : null;

		var dayKey = currentKey + '-' + i.toString();
		//var fixeddate = dayInfo.date.addDays(1);
		//html.push('<tr>');
		if (lastMonth != dayInfo.date.getMonth() && !noDates) {
			html.push('<div class="entry month-divider">' + dayInfo.date.monthName(lang) + '</div>');
		}

		html.push('<div class="entry ' + (isSameDay(today, dayInfo.date) ? ' is-today': '') + ' section-' + (bookInfo != null ? bible.SECTIONS[bookInfo.section] : '') + '">');
		html.push('<div class="date">' + (noDates ? '' : dayInfo.date.monthAbbr(lang) + ' ' + (dayInfo.date.getDate())) + '</div>');		
		//html.push('<span>' + formatChapterRange(dayInfo.chapters) + '</span>');		
		if (dayInfo.formattedReading != '') {

			html.push(
			`<div class="verses"> 
				<input type="checkbox" class="reading-check" id="${dayKey}" ${getLocalStorage(dayKey, false) ? " checked" : ""} />
				<label for="${dayKey}">${includeUrls ? dayInfo.formattedReadingUrls : dayInfo.formattedReading}</label> 
			</div>`);

			//html.push('<div class="verses">' + (includeUrls ? dayInfo.formattedReadingUrls : dayInfo.formattedReading) + '</div>');		
		}
		html.push('</div>');

		lastMonth = dayInfo.date.getMonth();
	}

	html.push('</div>');
	
	if (showStats) {
		html.unshift(createFinalStats(data.days));
	}	
	
	return html.join('\n');
	
}

function buildweeks(lang, data, startDate, duration, bookList, dayList, showStats, showDailyStats, noDates, includeUrls) {
	
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

			var dayKey = currentKey + '-' + i.toString();

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
		html.push('<div class="date">' + (noDates ? '' : dayInfo.date.monthAbbr(lang) + ' ' + (dayInfo.date.getDate())) + '</div>');		
		
		if (dayInfo.formattedReading != '') {
			html.push(
				`<div class="verses"> 
					<input type="checkbox" class="reading-check" id="${dayKey}" ${getLocalStorage(dayKey, false) ? " checked" : ""} />
					<label for="${dayKey}">${includeUrls ? dayInfo.formattedReadingUrls : dayInfo.formattedReading}</label> 
				</div>`);			
			//html.push('<div class="verses">' + (includeUrls ? dayInfo.formattedReadingUrls : dayInfo.formattedReading) + '</div>');		
		}
		html.push('</div>');
	}
	// close week
	html.push('</div>');

	// close list
	html.push('</div>');
	
	if (showStats) {
		html.unshift(createFinalStats(data.days))
	}	
	
	return html.join('\n');
	
}

function isSameDay(d1, d2) {
	return d1.getFullYear() === d2.getFullYear() &&
	  d1.getDate() === d2.getDate() &&
	  d1.getMonth() === d2.getMonth();
  }

function buildics(lang, data, startDate, duration, bookList, dayList, showStats, showDailyStats, noDates, includeUrls) {
	

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
			if (includeUrls) {
				ics.push('X-ALT-DESC;FMTTYPE=text/html:<!doctype html><html><body>' + dayInfo.formattedReadingUrls + '</body></html>');
			}	
			ics.push('END:VEVENT');
		}
	}

	ics.push('END:VCALENDAR');

	return ics.join('\n');
	
}

function buildcsv(lang, data, startDate, duration, bookList, dayList, showStats, showDailyStats) {

	let csv = [];
	
	csv.push('"Date","Passage"' + (showStats ? ',"Verse Count"' : ''));
		
	for (var i=0; i<data.days.length; i++) {
		let dayInfo = data.days[i],
			formattedDate = dayInfo.date.getFullYear().toString() + '-' +
							(dayInfo.date.getMonth()+1).toString().padStart(2,'0') +  '-' +
							dayInfo.date.getDate().toString().padStart(2,'0');
			

		csv.push('"' + formattedDate + '","' + dayInfo.formattedReading + '"' + (showDailyStats ? ',"' + dayInfo.versesForToday + '"' : ''));
	}

	return csv.join('\n');
}



function buildcalendar(lang, data, startDate, duration, bookList, dayList, showStats, showDailyStats, noDates, includeUrls) {
	
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
	var lengthBeforeSetToSunday = data.days.length;
	var days = appendDaysToSunday(data.days);
	var numberOfDaysAdded = data.days.length - lengthBeforeSetToSunday;
	
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
		
		var dayKey = currentKey + '-' + (i-numberOfDaysAdded).toString();

		html.push('<td class="' + 
					(bookInfo != null ? 'section-' + bible.SECTIONS[bookInfo.section] : '') + 
					(!noDates && firstday ? ' monthstart' : '') + 
					(!noDates && lastday ? ' monthend' : '') + 
					(!noDates && firstweek ? ' firstweek' : '') + 
					(!noDates && lastweek ? ' lastweek' : '') + 
					(!noDates && isSameDay(today, dayInfo.date) ? ' is-today': '') +
			'">' + 
			'<span class="date">' + (noDates ? '' : (firstday ? dayInfo.date.monthAbbr(lang) + ' ' : '') + dayInfo.date.getDate()) + '</span>' + 
			//'<span class="verses">' + formatChapterRange(dayInfo.chapters) + '</span>' + 
			(dayInfo.formattedReading != '' ? 
				`<span class="verses"> 
					<input type="checkbox" class="reading-check" id="${dayKey}" ${getLocalStorage(dayKey, false) ? " checked" : ""} />
					<label for="${dayKey}">${includeUrls ? dayInfo.formattedReadingUrls : dayInfo.formattedReading}</label> 
				</span>` +
				(showDailyStats ?
					'<span class="stats">' +
						'verses: ' + dayInfo.versesForToday + '<br>' +
						(dayInfo.wordsForToday > 0 ? 
							'words: ' + dayInfo.wordsForToday + '<br>' +					
							'minutes: ' + (dayInfo.wordsForToday/250).toFixed(2)
							: 
							''
						) + 						
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
		html.unshift(createFinalStats(data.days))
	}
	
	
	return html.join('\n');
	
}

function createFinalStats(days) {

	// calendar view adds dummy days to the front, so the stats need to be offset for that
	var daysOffset = 0; //(days[0].day < 1) ? Math.abs(days[0].day) + 1 : 0;

	var verseStats = getPlanStats(days),
		wordStats = getPlanWordStats(days);

	console.log('STATS',verseStats);
	
	var	html = `
			<div class="plan-stats">
				<table>
					<tr>
						<th>Average Verses:</th>
						<td>${verseStats.avg.toFixed(2)}</td>
					</tr>`;
	if (!isNaN(wordStats.avg)) {
		html += `
					<tr>
						<th>Average Words:</th>
						<td>${wordStats.avg.toFixed(2)}</td>
					</tr>
					<tr>
						<th>Average Time:</th>
						<td>${(wordStats.avg/200).toFixed(2)} minutes</td>
					</tr>`;
	}
	html += `					
					<tr>
						<th>Longest Day:</th>
						<td>${(days[verseStats.maxIndex + daysOffset].date.getMonth()+1) + '/' + days[verseStats.maxIndex + daysOffset].date.getDate()} - ${verseStats.max} verses</td>
					</tr>	
					<tr>
						<th>Shortest Day:</th>
						<td>${(days[verseStats.minIndex + daysOffset].date.getMonth()+1) + '/' + days[verseStats.minIndex + daysOffset].date.getDate()} - ${verseStats.min} verses</td>
					</tr>										
				</table>
			</div>
		`;
	return html;

}

function buildbooks(lang, data, startDate, duration, bookList, dayList, showStats, showDailyStats, noDates) {
	
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
				(noDates ? '' : (dayInfo.date.getMonth()+1) + '/' + (dayInfo.date.getDate()) + ': ' ) + 
				startChapter + (startChapter != endChapter ? '-' + endChapter : '') +
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

function buildcircle(lang, data, startDate, duration, bookList, dayList, showStats, showDailyStats, noDates) {

	// simplify the format for the circle
	// get the CSS class for the slivers

	var dateEntries = [];
	for (var i=0; i<data.days.length; i++) {
		var entry = data.days[i];
		var bookInfo = entry.chapters.length > 0 ? bible.BIBLE_DATA[entry.chapters[0].usfm] : null;		
		var cssClass = 'section-' + (bookInfo != null ? bible.SECTIONS[bookInfo.section] : '');

		dateEntries.push({
			date: entry.date,
			text: entry.formattedReading,
			sliceColor: '#fff',
			sliceCssClass: cssClass,
		});
	}

	var svgNode = renderSvgCircle(dateEntries, lang, noDates);
	
	var outer = document.createElement('div');
	outer.appendChild(svgNode);

	var colorList = document.createElement('div');
	colorList.innerHTML =  generateColorListHtml();
	outer.appendChild(colorList);

	var topright = svgNode.cloneNode(true);
	topright.setAttribute("viewBox", "0 0 500 500");
	topright.setAttribute("style", "margin: 20px 0");
	outer.appendChild(topright);

	var bottomright = svgNode.cloneNode(true);
	bottomright.setAttribute("viewBox", "-500 0 500 500");
	bottomright.setAttribute("style", "margin: 20px 0");
	outer.appendChild(bottomright);	

	var bottomleft = svgNode.cloneNode(true);
	bottomleft.setAttribute("viewBox", "-500 -500 500 500");
	bottomleft.setAttribute("style", "margin: 20px 0");
	outer.appendChild(bottomleft);	
	
	var topleft = svgNode.cloneNode(true);
	topleft.setAttribute("viewBox", "0 -500 500 500");
	topleft.setAttribute("style", "margin: 20px 0");
	outer.appendChild(topleft);	
	

	return outer.outerHTML;

	//return svgNode.outerHTML;
}

function renderSvgCircle(dateEntries, lang, noDates) {

	/* internal functions */

	function getCoordinatesForPercent(percent) {
		const x = Math.cos(2 * Math.PI * percent);
		const y = Math.sin(2 * Math.PI * percent);

		return [x, y];
	}



	const settings = {
		mainSize: 1000,		
		radius: 490,
		mainCircleFill: '#fcfcfc',
		mainCircleStroke: '#111111',
		monthLineLength: 180,
		monthLineStroke: '#999',
		weekLineLength: 150,
		weekLineStroke: '#bbb',
		dayLineLength: 150,
		dayLineStroke: '#ddd',

		monthFontFamily: 'Helvetica, Arial',
		monthFontColor: '#333',
		monthFontSize: '10px',

		entryFontColor: '#333',
		entryFontFamily: 'Helvetica, Arial',
		entryFontSize: '6px',

		dateFontColor: '#999',
		dateFontFamily: 'Consolas, Courier New, monospace',		

		titleText: 'Bible Reading Plan',
		titleFontFamily: 'Helvetica, Arial',
		titleFontSize: '24px',
		titleFontFill: '#111',  		
	};

	const segments = dateEntries.length;

	if (segments <= 180) {
		settings.entryFontSize = '8px';
	}
	if (segments <= 60) {
		settings.entryFontSize = '10px';
	}

	
	// main nodes
	//const targetDiv = document.getElementById('svg-area');
	const svgNode = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	svgNode.setAttributeNS(null, 'height', 890); //settings.mainSize);
	svgNode.setAttributeNS(null, 'width', 890); //settings.mainSize);
	svgNode.setAttributeNS(null, 'viewBox', '-' + (settings.mainSize/2) + ' -' + (settings.mainSize/2) + ' ' + (settings.mainSize) + ' ' + (settings.mainSize));
	svgNode.setAttributeNS(null, 'transform', 'rotate(-90)');
	//targetDiv.appendChild(svgNode);
	//document.body.appendChild(svgNode);

	const circleNode = createSvgNode('circle', {
			'r': settings.radius, 
			'fill': settings.mainCircleFill, 
			'stroke': settings.mainCircleStroke, 
			'stroke-width': 0.5});
	svgNode.appendChild(circleNode);
	

	for (var i=0; i<segments; i++) {
	
		const dateEntry = dateEntries[i];		
		const planDate = dateEntry.date;
	
		const secondHalf = i>segments/2;
		const segmentAddition = 0.5; // move half way
		const lineLocation = getCoordinatesForPercent(i/segments);
		const sliceEndLocation = getCoordinatesForPercent((i+1)/segments);
		const textLocation = getCoordinatesForPercent((i+segmentAddition)/segments);   
	
		// SLICE
	
		const sliceNode = createSvgNode('path', {			
			'fill': dateEntry.sliceColor, 
			'class': dateEntry.sliceCssClass,
			'style': 'opacity: 0.3',
			'd': [
				`M ${lineLocation[0]*settings.radius} ${lineLocation[1]*settings.radius}`, // Move
				`A ${settings.radius} ${settings.radius} 0 0 1 ${sliceEndLocation[0]*settings.radius} ${sliceEndLocation[1]*settings.radius}`, // Arc
				`L 0 0`, // Line
			  ].join(' ')
		});
		svgNode.appendChild(sliceNode);
	   
	
		// LINEs
		const lineLength = planDate.getDate() == 1 ? settings.monthLineLength : settings.dayLineLength;
		const lineColor = planDate.getDate() == 1 ? settings.monthLineStroke : planDate.getDay() == 0 ? settings.weekLineStroke : settings.dayLineStroke;
		const lineNode = createSvgNode('line', {
							'x1': (settings.radius) * lineLocation[0] /* + center */, 
							'y1': (settings.radius) * lineLocation[1] /* + center */, 
							'x2': (settings.radius-lineLength) * lineLocation[0] /* + center */,
							'y2': (settings.radius-lineLength) * lineLocation[1] /* + center */,
							'stroke': lineColor});
		svgNode.appendChild(lineNode);     
	
		// MONTH NAMEs
		if (!noDates && planDate.getDate() == 1 ) {

			const curveEndLocation = getCoordinatesForPercent((i+30)/segments);

			const monthRadius = 250;			
			const id = 'mpath-' + planDate.getMonth();
	
			const monthPath = createSvgNode('path', {
				'id': id, 
				'fill': 'transparent', 
				'stroke': 'transparent', 				
				'd': `M ${monthRadius * lineLocation[0]} ${monthRadius * lineLocation[1]} A ${monthRadius} ${monthRadius} 0 0 1 ${monthRadius * curveEndLocation[0]} ${monthRadius * curveEndLocation[1]}`
			});
			svgNode.appendChild(monthPath);
	
			const monthTextNode = createSvgNode('text', {
				'font-family': settings.monthFontFamily,
				'font-size': settings.monthFontSize,
				'fill': settings.monthFontColor,      
			});
			svgNode.appendChild(monthTextNode);
			monthTextNode.appendChild(
					createTextPath( planDate.toLocaleDateString(lang, {month:"long"}).toUpperCase(), {
						'href': '#' + id, 
						'startOffset':'50%', 
						'text-anchor':'middle'
					})
			);
		}

		const 
			textInset = 3,			
			textX = (settings.radius-textInset) * textLocation[0],
			textY = (settings.radius-textInset) * textLocation[1],
			textR = ((i+segmentAddition)/segments * 360 + (secondHalf ? -180 : 0));  		
	
		// CREATE Text
		const textNode = createSvgNode('text', {
			'x': textX, 
			'y': textY,  			
			'transform': 'rotate(' + textR + ' ' + textX + ' ' +  textY + ')',			
			'font-family': settings.entryFontFamily,
			'font-size': settings.entryFontSize,
			'fill': settings.entryFontColor,   
			'dominant-baseline': 'middle',
			'text-anchor': secondHalf ? 'start' : 'end',     
		});
	 
		if (!secondHalf) {
			textNode.appendChild(createTSpan(dateEntry.text + ' ', {"padding-right": '10px'}));
		}

		
		const mm = dateEntry.date.getMonth() + 1;
		const dd = dateEntry.date.getDate();
		let formattedDate = [
				(mm>9 ? '' : '0') + mm,
				(dd>9 ? '' : '0') + dd
			   ].join('/');
			
		if (noDates) {
			formattedDate = (i+1).toString().padStart(segments.toString().length, '0');
		}
	
		textNode.appendChild( 
					createTSpan(' ' + formattedDate + ' ', {
						'fill': settings.dateFontColor, 
						'font-family': settings.dateFontFamily,
					}) 
				);
		
		if (secondHalf) {
			textNode.appendChild(createTSpan(' ' + dateEntry.text));
		}
	
		svgNode.appendChild(textNode);
	
		// adjust position
 
	}
	
	// INNER CIRCLE
	const innerCircle = createSvgNode('circle', {r: 240, /* cx: center, cy: center, */ fill: '#fff', stroke: '#ccc'});
	svgNode.appendChild(innerCircle);
	
	const innerCircle2 = createSvgNode('circle', {r: 200, /* cx: center, cy: center, */ fill: '#fff', stroke: '#ccc'});
	svgNode.appendChild(innerCircle2);
	
	// TITLE
	const titleNode = createSvgNode('text', {
		'font-family': settings.titleFontFamily, 
		'font-size': settings.titleFontSize, 
		'fill': settings.titleFontFill,		 		
		'transform': 'rotate(90)',
		'dominant-baseline': 'middle',
		'text-anchor': 'middle',    
	});
	svgNode.appendChild(titleNode);
	titleNode.appendChild(createTSpan(settings.titleText));
	
	//document.body.removeChild(svgNode);

	return svgNode;

}


function buildcirclecal(lang, data, startDate, duration, bookList, dayList, showStats, showDailyStats, noDates) {

	/*
	var dateEntries = [];
	for (var i=0; i<data.days.length; i++) {
		var entry = data.days[i];
		var bookInfo = entry.chapters.length > 0 ? bible.BIBLE_DATA[entry.chapters[0].usfm] : null;		
		var cssClass = 'section-' + (bookInfo != null ? bible.SECTIONS[bookInfo.section] : '');

		dateEntries.push({
			date: entry.date,
			text: entry.formattedReading,
			sliceColor: '#fff',
			sliceCssClass: cssClass,
		})
	}
	*/

    // base measurements: 300,300
    let start = 300;
    let depth = 25;

    // how many days is this?
    let totalDays = data.days.length;
   
    let weeks = Math.ceil(totalDays/7);

    // make 7 layers (empty for mow)
    let layers = [];
    for (let inner=1; inner<=7; inner++) {
        layers.push({
            segments: Array( weeks ), 
			//segments: weeks,
            dayLabels: Array.from({length:weeks}, (_,i)=> ''), 
            textLabels: Array.from({length:weeks}, (_,i)=> ''), 
			cssClasses: Array.from({length:weeks}, (_,i)=> ''), 
            outerR: start - ((inner-1) * depth),
            innerR: start - (inner * depth),      
            gapDeg: 0,
            colors: Array.from({length:weeks}, (_,i)=>'#eeeeee')
        })
    }

    // add days to first week to ensure sunday start
	while (data.days[0].date.getDay() > 0) {

		let emptyDay = {
			date: data.days[0].date.addDays(-1),
			formattedReading: '',
            empty: true
		};
			
		data.days.splice(0,0,emptyDay);
    }
    // add days to final week to ensure saturday end
	while (data.days[data.days.length-1].date.getDay() < 6) {

		let emptyDay = {
			date: data.days[data.days.length-1].date.addDays(1),
			formattedReading: '',
            empty: true
		};
			
		data.days.push(emptyDay);
    }

    let dayArray = [6,5,4,3,2,1,0];

    // fill in the layers with day info
    for (var dayIndex=0; dayIndex < data.days.length; dayIndex++) {

        var passage = data.days[dayIndex];
        var layerIndex = dayArray[ data.days[dayIndex].date.getDay() ];
        var weekIndex = Math.floor( (dayIndex) / 7 );

		var segment = {monthLabel: '', dayLabel: '', weeksInMonth: 0, firstIsSunday: 0, textLabel: '', color: '#ffffff', isFirstOfMonth: false, isFirstWeek: false};
		
		if (!passage.empty) {

			segment.color = passage.date.getMonth() % 2 == 0 ? '#eeeeee' : '#dddddd';			
			segment.textLabel = passage.formattedReading;
			segment.dayLabel = passage.date.getDate();

			segment.isFirstWeek = passage.date.getDate() <= 7; 

			if (passage.date.getDate() == 1) {
				segment.isFirstOfMonth = true;
				segment.firstIsSunday = passage.date.getDay() == 0 ? 1 : 0;
				segment.dayLabel = passage.date.toLocaleDateString(lang, {month:"short"}) + ' ' + passage.date.getDate();
				
				segment.monthLabel = passage.date.toLocaleDateString(lang, {month:"long"});

				// count the number of weeks
				let weekStartDay = 0; // sunday
				let weekCount = 0;
				let currentDate = passage.date;
				let endDate = new Date(passage.date.getFullYear(), passage.date.getMonth() + 1, 0);
				while(currentDate.getTime() <= endDate.getTime()){
					if(currentDate.getDay() === weekStartDay){
						weekCount++;
					}
					currentDate.setDate(currentDate.getDate() + 1);
				}
				segment.weeksInMonth = weekCount;				

			}



			
			
			var entry = data.days[dayIndex];
			var bookInfo = entry.chapters && entry.chapters.length > 0 ? bible.BIBLE_DATA[entry.chapters[0].usfm] : null;		
			
			segment.cssClass = 'section-' + (bookInfo != null ? bible.SECTIONS[bookInfo.section] : '');				;				
		}

		layers[layerIndex].segments[weekIndex] = segment;
    }

	var svgNode = renderSvgCircleCal(layers);

	var outer = document.createElement('div');

	outer.appendChild(svgNode);

	var colorList = document.createElement('div');
	colorList.innerHTML =  generateColorListHtml();
	outer.appendChild(colorList);

	var topright = svgNode.cloneNode(true);
	topright.setAttribute("viewBox", "300 0 300 300");
	topright.setAttribute("style", "margin: 20px 0");
	outer.appendChild(topright);

	var bottomright = svgNode.cloneNode(true);
	bottomright.setAttribute("viewBox", "300 300 300 300");
	bottomright.setAttribute("style", "margin: 20px 0");
	outer.appendChild(bottomright);	

	var bottomleft = svgNode.cloneNode(true);
	bottomleft.setAttribute("viewBox", "0 300 300 300");
	bottomleft.setAttribute("style", "margin: 20px 0");
	outer.appendChild(bottomleft);	
	
	var topleft = svgNode.cloneNode(true);
	topleft.setAttribute("viewBox", "0 0 300 300");
	topleft.setAttribute("style", "margin: 20px 0");
	outer.appendChild(topleft);		

	return outer.outerHTML;
	//return svgNode.outerHTML;
}

function renderSvgCircleCal(layers) {

	/* utility functions */
	function degToRad(d) {
		return d * Math.PI / 180;
	}
	
	function polar(cx, cy, r, a) {
		const rad = degToRad(a - 90);
		return { 
				x: cx + r * Math.cos(rad), 
				y: cy + r * Math.sin(rad) 
		};
	}

	function largeArc(a) {
		return a > 180 ? 1 : 0;
	}

	function makeWedgePath(cx, cy, r0, r1, a0, a1) {
		const p0 = polar(cx, cy, r1, a0);
		const p1 = polar(cx, cy, r1, a1);
		const q0 = polar(cx, cy, r0, a0);
		const q1 = polar(cx, cy, r0, a1);

		return `
			M ${p0.x} ${p0.y}
			A ${r1} ${r1} 0 ${largeArc(a1 - a0)} 1 ${p1.x} ${p1.y}
			L ${q1.x} ${q1.y}
			A ${r0} ${r0} 0 ${largeArc(a1 - a0)} 0 ${q0.x} ${q0.y}
			Z
		`;
	}

	function makeCornerOutline(cx, cy, r0, r1, a0, a1) {
		const p0 = polar(cx, cy, r1, a0);
		const p1 = polar(cx, cy, r1, a1);
		const q0 = polar(cx, cy, r0, a0);
		const q1 = polar(cx, cy, r0, a1);

		return `
			M ${q1.x} ${q1.y}
			A ${r0} ${r0} 0 ${largeArc(a1 - a0)} 0 ${q0.x} ${q0.y}
			L ${p0.x} ${p0.y}			
		`;
	}	

	function makeTopOutline(cx, cy, r0, r1, a0, a1) {
		const p0 = polar(cx, cy, r1, a0);
		const p1 = polar(cx, cy, r1, a1);
		const q0 = polar(cx, cy, r0, a0);
		const q1 = polar(cx, cy, r0, a1);

		return `
			M ${q0.x} ${q0.y}
			L ${p0.x} ${p0.y}
		`;
	}		

	/* ---------- Arc path for text ---------- */
	/* This creates an arc along the *middle* radius of the wedge */
	function makeArcPath(cx, cy, radius, a0, a1) {
		const p0 = polar(cx, cy, radius, a0);
		const p1 = polar(cx, cy, radius, a1);
		return `
			M ${p0.x} ${p0.y}
			A ${radius} ${radius} 0 ${largeArc(a1 - a0)} 1 ${p1.x} ${p1.y}
		`;
	}


	/// START
	let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	svg.setAttribute("viewBox", "0 0 600 600");
	svg.setAttribute("width",890);
	svg.setAttribute("height",890);
	//svg.setAttribute("style","margin: 0");
	svg.innerHTML = ""; // clear SVG
	
	const cx = 300;
 	const cy = 300;


	// INNER CIRCLE
	const innerCircle = createSvgNode('circle', {r: layers[layers.length-1].innerR, cx: cx, cy: cy, fill: '#fff', stroke: '#ccc'});
	svg.appendChild(innerCircle);
	
	const innerCircle2 = createSvgNode('circle', {r: layers[layers.length-1].innerR-20, cx: cx, cy: cy,  fill: '#fff', stroke: '#ccc'});
	svg.appendChild(innerCircle2);

	const outlineCircle = createSvgNode('circle', {r: layers[0].outerR, cx: cx, cy: cy,  fill: 'transparent', stroke: '#ccc'});
	svg.appendChild(outlineCircle);
	
	// layers

	layers.forEach((layer, layerIndex) => {
		
		const {
			segments,
			//dayLabels = [],
			//textLabels = [],
			//cssClasses = [],
			innerR,
			outerR,
			gapDeg = 0,
			//colors = null
		} = layer;
		
		//const segments = layer.ls

		const full = 360;
		const rawAngle = full / segments.length;
		const segAngle = rawAngle - gapDeg;
		const textRadius = (innerR + outerR) / 2;  // place text at mid-radius

		for (let i = 0; i < segments.length; i++) {
			const segment = segments[i];
			const start = i * rawAngle + gapDeg / 2;
			const end = start + segAngle;
			const color = segment.color;
			/*
			const color = typeof colors === "function"
				? colors(i)
				: Array.isArray(colors)
					? colors[i % colors.length]
					: `hsl(${(i/segments.length)*360} 60% 65%)`;
			*/

			/* ----- Wedge shape ----- */
			const wedge = document.createElementNS("http://www.w3.org/2000/svg", "path");
			wedge.setAttribute("d", makeWedgePath(cx, cy, innerR, outerR, start, end));
			wedge.setAttribute("fill", color);
			wedge.setAttribute("style","stroke: #fff; stroke-width:0.5; opacity: 0.5;"); // should be CSS?
			//wedge.classList.add("wedge");
			wedge.classList.add(segment.cssClass);

			// for interactive work
			wedge.dataset.layer = layerIndex;
			wedge.dataset.index = i;
			svg.appendChild(wedge); 


			// create left and top
			if (segment.isFirstOfMonth && !segment.firstIsSunday) {
				const wedgeOutline = document.createElementNS("http://www.w3.org/2000/svg", "path");
				wedgeOutline.setAttribute("d", makeCornerOutline(cx, cy, innerR, outerR, start, end));
				wedgeOutline.setAttribute("fill", 'transparent');
				wedgeOutline.setAttribute("style","stroke: #333; stroke-width:0.5;"); // should be CSS?
				svg.appendChild(wedgeOutline); 
			}
			// just top
			if (segment.isFirstWeek) {
				const wedgeOutline = document.createElementNS("http://www.w3.org/2000/svg", "path");
				wedgeOutline.setAttribute("d", makeTopOutline(cx, cy, innerR, outerR, start, end));
				wedgeOutline.setAttribute("fill", 'transparent');
				wedgeOutline.setAttribute("style","stroke: #333; stroke-width:0.5;"); // should be CSS?
				svg.appendChild(wedgeOutline); 
			}			


			// calculate position of text (foreignObject)
			const mid = start + segAngle / 2;
			const rMid = (innerR + outerR) / 2;
			const { x, y } = polar(cx, cy, rMid, start+1.5) // mid);
			
			// foreignObject (so text can flow)
			const fomid = start+2.1;
			const fopos = polar(cx, cy, innerR+2.5, fomid);        
			const outerSvg = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject");
			outerSvg.setAttribute("transform", `translate(${fopos.x},${fopos.y}) rotate(${mid-90})`);
			outerSvg.setAttribute("width", `20`); 
			outerSvg.setAttribute("height", `14`);  // allows three lines in outer rungs
			
			const wedgeContent = document.createElement("p");
			wedgeContent.textContent = segment.textLabel;
			wedgeContent.setAttribute("style", `margin: 0; padding: 0; line-height: 1.1; 
										font-size: 4.5px; fill: #1a1a1a; 
										text-anchor: middle; dominant-baseline: middle;`); 

			if (segment.textLabel.length > 20 && layerIndex > 2) {
				wedgeContent.style.fontSize = '4.0px';
				wedgeContent.style.lineHeight = '1.0';
			}
			if (segment.textLabel.length > 20 && layerIndex > 4) {
				wedgeContent.style.fontSize = '3.5px';
				wedgeContent.style.lineHeight = '1.0';
			}			
		
			outerSvg.appendChild(wedgeContent);
			svg.appendChild(outerSvg);

			// ------ top left number -----
			const nmid = start+0.3;
			const nrMid = (innerR + outerR) / 2;
			const numpos = polar(cx, cy, innerR+2.5 , nmid+0.5+ (layerIndex*0.2)); // for some reason, the angle needs to be lessened teh further out it goes
			const numberLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
			numberLabel.setAttribute("transform", `translate(${numpos.x},${numpos.y}) rotate(${start-90})`);
			numberLabel.setAttribute("style", `padding-left: 1px; font-size: 4px; fill: #666;`); 
			numberLabel.textContent = segment.dayLabel;       
			svg.appendChild(numberLabel);


			if (segment.isFirstOfMonth && segment.monthLabel != '') {
				/*
				const monthmid = start + (360/layer.segments.length*segment.weeksInMonth/2); // start at this wedge, then add 4 weeks
				const monthrMid = layers[layers.length-1].innerR-10; // just inside the last layer
				const monthpos = polar(cx, cy, monthrMid, monthmid); 
				const monthLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
				monthLabel.setAttribute("transform", `translate(${monthpos.x},${monthpos.y}) rotate(${monthmid})`);
				monthLabel.setAttribute("style", `text-anchor: middle; dominant-baseline: middle;
												 font-size: 5px; fill: #666;`); 
				monthLabel.textContent = segment.monthLabel;				
				svg.appendChild(monthLabel);
				*/

				console.log(segment.monthLabel, segment.firstIsSunday, segment.weeksInMonth, start);

				const weekWidth = 360/layer.segments.length;
				const arcId = `arc-${layerIndex}-${i}`;
				const arc = document.createElementNS("http://www.w3.org/2000/svg", "path");
				arc.setAttribute("id", arcId);
				arc.setAttribute("d", makeArcPath(cx, cy, layers[layers.length-1].innerR-12, 
						start + (!segment.firstIsSunday * weekWidth), 
						start + (weekWidth*(segment.weeksInMonth+1) - (segment.firstIsSunday * weekWidth))
					));
				arc.setAttribute("fill", "none");
				arc.setAttribute("stroke", "none"); // segment.color); //"#f00");
				svg.appendChild(arc);

				// ----- Text following arc -----
				const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
				text.setAttribute("style", `text-transform: uppercase;
									font-size: 5px; fill: #666;`); 

				const textPath = document.createElementNS("http://www.w3.org/2000/svg", "textPath");
				textPath.setAttributeNS("http://www.w3.org/1999/xlink", "href", `#${arcId}`);
				textPath.setAttribute("startOffset", "50%");
				textPath.setAttribute("text-anchor", "middle");
		
				textPath.textContent = segment.monthLabel;
				

				text.appendChild(textPath);
				svg.appendChild(text);				


			}

			
		
		} // segments
	}); // layers



	
	// TITLE
	const titleNode = createSvgNode('text', {
		//'font-family': settings.titleFontFamily, 
		//'font-size': settings.titleFontSize, 
		//'fill': settings.titleFontFill,		 		
		//'transform': 'rotate(90)',
		'dominant-baseline': 'middle',
		'text-anchor': 'middle',  
		x: cx, y: cy, 
	});
	svg.appendChild(titleNode);
	titleNode.appendChild(createTSpan('Bible Reading Plan'));


	return svg;
}

function createSvgNode(typeName, attributes = {}) {
	const svgNode = document.createElementNS('http://www.w3.org/2000/svg', typeName);

	setSvgAtts(svgNode, attributes);

	return svgNode;
}

function setSvgAtts(node, attributes = {}) {
	for (const [key, value] of Object.entries(attributes)) {
		node.setAttributeNS(null, key, value);
	}
}

function createTSpan(text, attributes = {}) {
	const tSpan = createSvgNode('tspan', attributes);
	var spanText = document.createTextNode( text );
	tSpan.appendChild(spanText);
	return tSpan;
}

function createTextPath(text, attributes = {}) {
	const tSpan = createSvgNode('textPath', attributes);
	var spanText = document.createTextNode( text );
	tSpan.appendChild(spanText);
	return tSpan;
}