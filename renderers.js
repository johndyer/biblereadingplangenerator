

function buildlist(lang, data, startDate, duration, bookList, dayList, showStats, noDates) {
	
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
		if (lastMonth != dayInfo.date.getMonth() && !noDates) {
			html.push('<div class="entry month-divider">' + dayInfo.date.monthName(lang) + '</div>');
		}

		html.push('<div class="entry ' + (isSameDay(today, dayInfo.date) ? ' is-today': '') + ' section-' + (bookInfo != null ? bible.SECTIONS[bookInfo.section] : '') + '">');
		html.push('<div class="date">' + (noDates ? '' : dayInfo.date.monthAbbr(lang) + ' ' + (dayInfo.date.getDate())) + '</div>');		
		//html.push('<span>' + formatChapterRange(dayInfo.chapters) + '</span>');		
		if (dayInfo.formattedReading != '') {
			html.push('<div class="verses">' + dayInfo.formattedReading + '</div>');		
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

function buildweeks(lang, data, startDate, duration, bookList, dayList, showStats, noDates) {
	
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
		html.push('<div class="date">' + (noDates ? '' : dayInfo.date.monthAbbr(lang) + ' ' + (dayInfo.date.getDate())) + '</div>');		
		
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
		html.unshift(createFinalStats(data.days))
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



function buildcalendar(lang, data, startDate, duration, bookList, dayList, showStats, noDates) {
	
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
			'<span class="date">' + (noDates ? '' : (firstday ? dayInfo.date.monthAbbr(lang) + ' ' : '') + dayInfo.date.getDate()) + '</span>' + 
			//'<span class="verses">' + formatChapterRange(dayInfo.chapters) + '</span>' + 
			(dayInfo.formattedReading != '' ? 
				'<span class="verses">' + dayInfo.formattedReading + '</span>' +
				(showStats ?
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
	var daysOffset = (days[0].day < 1) ? Math.abs(days[0].day) + 1 : 0;

	var verseStats = getPlanStats(days),
		wordStats = getPlanWordStats(days),
		html = `
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

function buildbooks(lang, data, startDate, duration, bookList, dayList, showStats, noDates) {
	
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

function buildcircle(lang, data, startDate, duration, bookList, dayList, showStats, noDates) {

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

	var svgNode = svgCalendar(dateEntries, lang, noDates);
	
	return svgNode.outerHTML;
}

function svgCalendar(dateEntries, lang, noDates) {

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
	svgNode.setAttributeNS(null, 'height', settings.mainSize);
	svgNode.setAttributeNS(null, 'width', settings.mainSize);
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
		if (planDate.getDate() == 1 ) {

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

Date.prototype.formattedDate = function() {
    var mm = this.getMonth() + 1; // getMonth() is zero-based
    var dd = this.getDate();
  
    return [
            (mm>9 ? '' : '0') + mm,
            (dd>9 ? '' : '0') + dd
           ].join('/');
};
function getCoordinatesForPercent(percent) {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);

    return [x, y];
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
