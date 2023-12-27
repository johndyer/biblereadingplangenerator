
function getPlanData(lang, order, startDate, numberOfDays, bookList, daysOfWeek, dailyPsalm, dailyProverb, combineOTandNT, reverse, logic, includeUrls, urlSite, urlVersion) {
	
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
		pericopes: [],
		totalBooks: 0,
		totalChapters: 0,
		totalVerses: 0,
		totalWords: 0,		
		chaptersPerDay: 0,
		versesPerDay: 0,
		wordsPerDay: 0,

		// for daily iterations
		chaptersRemaining: 0,
		pericopesRemaining: 0,
		versesRemaining: 0,
		wordsRemaining: 0,
		firstDayWithReadingHasPassed: false,
		currentBookIndex: 0,
		currentBookUsfm: null,
		currentChapterNumber: -1,
		chapterIndex: 0,
		
		pericopeIndex: 0,
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
	if (order == 'traditional' || order == 'tanakh') {

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

		if (reverse) {
			bookList = bookList.reverse();
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

				// add pericope(s)
				var pericopes = bible.pericopes.filter(p => p.start.indexOf(chapterCode + '_') > -1);				
				chapterGroup.pericopes = chapterGroup.pericopes.concat(pericopes);
				
			} else {
				debugger;
			}
		});

		// full totals
		chapterGroup.totalChapters = chapterGroup.chapters.length;
		chapterGroup.chaptersPerDay = chapterGroup.totalChapters/data.readingDays;
		chapterGroup.versesPerDay = chapterGroup.totalVerses/data.readingDays;
		chapterGroup.wordsPerDay = chapterGroup.totalWords/data.readingDays;
		chapterGroup.pericopesPerDay = chapterGroup.pericopes.length > 0 ? 
											chapterGroup.pericopes.length/data.readingDays :
											0;
	});

	/*
	var reverse = true;
	if (reverse) {
		data.chapterGroups.forEach(function(chapterGroup) {
			chapterGroup.chapters = chapterGroup.chapters.reverse();
			chapterGroup.pericopes = chapterGroup.pericopes.reverse();
		});
	}
	*/

	
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
			formattedReadingUrls: '',
			chapters: [],
			pericopes: [],
			wordsForToday: 0,
			versesForToday: 0,
			pericopesForToday: 0
		};		
		data.days.push(dayInfo);

		// create groups
		data.chapterGroups.forEach(function(chapterGroup) {
			dayInfo.chapterGroups.push({			
				wordsForToday: 0,
				versesForToday: 0,
				chaptersForToday: 0,
				pericopesForToday: 0,			
				chapters: [],
				pericopes: []
			});
		});
		
		// iterate the date here, because we'll skip days below
		date = date.incrimentDay(); // date.addDays(1);
		
		// skip unused days
		if (daysOfWeek.indexOf( dayInfo.date.getDay() ) == -1 ) {
			dayInfo.formattedReading = '';
			continue;
		}

		switch (logic) {
			case 'pericopes':

				var pericopeByVerses = true;

				if (pericopeByVerses) {
				
					data.chapterGroups.forEach(function(dataChapterGroup, chapterGroupIndex) {

						var dayChapterGroup = dayInfo.chapterGroups[chapterGroupIndex];						
						var versesForToday = dataChapterGroup.versesPerDay + dataChapterGroup.versesRemaining;
						var chaptersToday = [];
						var atLeastOneToday = false;
		
						// last day
						if (d === numberOfDays) {
							// trick it?						
							versesForToday = 10000;					
						}

						while ((d === numberOfDays || chaptersToday.length <= dataChapterGroup.chaptersPerDay) && 
								(!atLeastOneToday || versesForToday > 1) && // dataChapterGroup.versesPerDay && 
								dataChapterGroup.pericopeIndex < dataChapterGroup.pericopes.length) {
							
							var pericope = dataChapterGroup.pericopes[dataChapterGroup.pericopeIndex];
						
							dayChapterGroup.pericopes.push(pericope);
							atLeastOneToday = true;

							// total up verses for the day
							dayChapterGroup.versesForToday += pericope.range.length;
							versesForToday = versesForToday - pericope.range.length;

							/*
							function isLastVerseInChapter(pericope) {
								var parts = pericope.end.split('_'),
									usfm = parts[0],
									bookInfo = bible.BIBLE_DATA[usfm],
									chapter = parseInt(parts[1], 10),
									verse = parseInt(parts[2], 10);
								
								return (verse === bookInfo.chapters[chapter-1]);
							}

							// add chapters
							if (isLastVerseInChapter(pericope)) {
								var chapterCode = pericope.start.split('_')[0] + '_' + pericope.start.split('_')[1];
								if (chaptersToday.indexOf(chaptersToday) == -1) {
									chaptersToday.push(chapterCode);
								}
							}
							*/
							
							dataChapterGroup.pericopeIndex++;
						}

						atLeastOneToday = false;
						dataChapterGroup.versesRemaining = versesForToday;

					});

					// 

					
				} else {

					// THIS LOGIC is only good for splitting up pericopes by the average number
					// but it doesn't also count verses/words, so it still isn't great			
					data.chapterGroups.forEach(function(dataChapterGroup, chapterGroupIndex) {

						var dayChapterGroup = dayInfo.chapterGroups[chapterGroupIndex];
						
						var pericopesRemainingToday = dataChapterGroup.pericopesPerDay + dataChapterGroup.pericopesRemaining;
						var versesRemainingToday = dataChapterGroup.versesPerDay + dataChapterGroup.versesRemaining;
		
						// last day
						if (d === numberOfDays) {
							// trick it?						
							pericopesForToday = 10000;					
						}

						while ((pericopesRemainingToday > 0.9) && //  || versesRemainingToday > dataChapterGroup.versesPerDay / 2) && 
							dataChapterGroup.pericopeIndex < dataChapterGroup.pericopes.length) {
							
							var pericope = dataChapterGroup.pericopes[dataChapterGroup.pericopeIndex];
						
							dayChapterGroup.pericopes.push(pericope)

							// total up verses on the day
							dayChapterGroup.versesForToday += pericope.range.length;
							
							// count down used
							pericopesRemainingToday -= 1;
							versesRemainingToday -= pericope.range.length;

							dataChapterGroup.pericopeIndex++;
						}

						dataChapterGroup.versesRemaining = versesRemainingToday;
						dataChapterGroup.pericopesRemaining = pericopesRemainingToday;
					});	
							
				}
				break;

			default:
			case 'chapters':

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
				break;
								
			case 'words':
				
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
						if (wordsInChapter/2 > wordsForDay && dataChapterGroup.firstDayWithReadingHasPassed) {
							break;
						}
						dataChapterGroup.firstDayWithReadingHasPassed = true;

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
				break;
		}

		// merge down and format		
		dayInfo.chapterGroups.forEach(function(dayChapterGroup) {
			dayInfo.wordsForToday += dayChapterGroup.wordsForToday;
			dayInfo.versesForToday += dayChapterGroup.versesForToday;
			dayInfo.chapters = dayInfo.chapters.concat(dayChapterGroup.chapters);
			dayInfo.pericopes = dayInfo.pericopes.concat(dayChapterGroup.pericopes);
		});

	}

	// optimize
	if (logic == 'pericopes' && dayInfo.chapterGroups.length == 1) { 
		//console.time('optimizePericopes');
		try {
		data.days = optimizePericopes(data.days);
		} catch {
			console.log('error optimizing', data.days);
		}
		//console.timeEnd('optimizePericopes');
	}

	// format
	data.days.forEach(function(dayInfo) {


		if (logic == 'pericopes') { 
			dayInfo.formattedReading = formatPericopeRange(lang, dayInfo.pericopes, false, urlSite, urlVersion);
			dayInfo.formattedReadingUrls = formatPericopeRange(lang, dayInfo.pericopes, true, urlSite, urlVersion);
		} else {
			dayInfo.formattedReading = formatChapterRange(lang, dayInfo.chapters, false, urlSite, urlVersion);
			dayInfo.formattedReadingUrls = formatChapterRange(lang, dayInfo.chapters, true, urlSite, urlVersion);
		}

		if (dayInfo.chapters.length > 0 || dayInfo.pericopes.length > 0) {
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
				dayInfo.formattedReadingUrls += '; <a href="' + createUrl('','PSA', psalmNumber, urlSite, urlVersion) + '">Ps ' + psalmNumber + '</a>';
				psalmNumber++;
				if (psalmNumber > psalmMax) {
					psalmNumber = 1;
				}
			}

			if (dailyProverb && !rangeIncludesProverb) {
				dayInfo.formattedReading += '; Pro ' + proverbNumber;
				dayInfo.formattedReadingUrls += '; <a href="' + createUrl('','PRO', proverbNumber, urlSite, urlVersion) + '">Pro ' + proverbNumber + '</a>';
				proverbNumber++;
				if (proverbNumber > proverbMax) {
					proverbNumber = 1;
				}
			}
		}
	});

	// output results
	console.log('PLAN STATS', 'logic=',logic);
	console.log('days', numberOfDays, 'filled', data.days.filter(day => day.versesForToday > 0).length);
	console.log('chapters', data.chapterGroups[0].chapters.length);
	console.log('pericopes', data.chapterGroups[0].pericopes.length);
	console.log('chaptersPerDay', data.chapterGroups[0].chaptersPerDay);
	console.log('pericopesPerDay', data.chapterGroups[0].pericopesPerDay);
	console.log('versesPerDay', data.chapterGroups[0].versesPerDay);
	console.log('wordsPerDay', data.chapterGroups[0].wordsPerDay);

	var versesPerDay = data.days.filter(day => day.versesForToday > 0).map(day => day.versesForToday);
	var minVerses = Math.min(...versesPerDay);
	var maxVerses = Math.max(...versesPerDay);

	var avgVerses = versesPerDay.reduce((a,b) => a + b, 0) / versesPerDay.length;
	console.log('verses', minVerses, maxVerses, avgVerses);

	// var wordsPerDay = data.days.map(day => day.wordsForToday);
	// var minWords = Math.min(...wordsPerDay);
	// var maxWords = Math.max(...wordsPerDay);	

	
	// console.log('words', minWords, maxWords);
	//data.days = data.days.reverse();
	
	
	return data;	
}

function optimizePericopes(days) {
	
	// attempt an change  
	let results = days,
		max = 100,
		attempts = 0,
		improved = false;
		
    do {
        improved = false;
        attempts++;

		// attempt to reduce the largest one
        let oldStats = getPlanStats(results),
            adjustedMax = pushFromMax(results, oldStats),            
            newMaxStats = getPlanStats(adjustedMax);
		
        if (newMaxStats.max < oldStats.max || (newMaxStats.max == oldStats.max && newMaxStats.maxIndex != oldStats.maxIndex)) {
            improved = true;
			results = adjustedMax;
			oldStats = newMaxStats;		
		}
		
		// attempt to reduce the smallest one
		let adjustedMin = pullForMin(results, oldStats),
		 	newMinStats = getPlanStats(adjustedMin);

		if (newMinStats.min > oldStats.min) {
		 	improved = true;
		 	results = adjustedMin;
		}
       
    } while (attempts < max && improved)

    console.log('attempts', attempts);

    return results;
}


function pushFromMax(days, stats) {
	//var daysCopy = JSON.parse(JSON.stringify(days));
	let daysCopy = deepClone(days);

    //var stats = getPlanStats(daysCopy);

    // skip if only 1 element
    if (daysCopy[stats.maxIndex].pericopes.length <= 1) {
        return;
    }

	var dayWithMax = daysCopy[stats.maxIndex],
		dayWithMaxTotal = getPericopesVerseCount(dayWithMax.pericopes),
		nextDay = stats.maxIndex < daysCopy.length -1 ? daysCopy[stats.maxIndex + 1] : null,
		nextDayTotal = nextDay != null ? getPericopesVerseCount(nextDay.pericopes) : null,
		prevDay = stats.maxIndex > 0 ? daysCopy[stats.maxIndex] : null,
		prevDayTotal = prevDay != null ? getPericopesVerseCount(prevDay.pericopes) : null,
		firstPericopeSize = dayWithMax.pericopes[0].range.length,
		lastPericopeSize = dayWithMax.pericopes[dayWithMax.pericopes.length-1].range.length;
		
	// 62
	// 119 [63,24,32]
	// 63

    // move first element back
	if (stats.maxIndex > 0 && 
		// first is bigger or this is the last one
		(firstPericopeSize >= lastPericopeSize && firstPericopeSize+prevDayTotal<dayWithMaxTotal || stats.maxIndex == daysCopy.length-1)
		) {
        var firstElement = dayWithMax.pericopes.shift();
		prevDay.pericopes.push(firstElement);
		countVersesInPericopes(prevDay);

    } else {
    	// move the last element forward
		var lastElement = dayWithMax.pericopes.pop();		
		nextDay.pericopes.unshift(lastElement);
		countVersesInPericopes(nextDay);
	}
	
	countVersesInPericopes(dayWithMax);
	
    return daysCopy;
}

function countVersesInPericopes(day) {
	day.versesForToday = getPericopesVerseCount(day.pericopes);
}

function getPericopesVerseCount(pericopes) {
	return pericopes.reduce((a,b) => a + (b ? b.range.length : 0 || 0), 0);
}


function pullForMin(days, stats) {
	//let daysCopy = JSON.parse(JSON.stringify(inputArray));
	let daysCopy = deepClone(days);

    //var stats = getPlanStats(daysCopy);

    var nextPericopeSize = (stats.minIndex < daysCopy.length-1) ? daysCopy[stats.minIndex+1].pericopes[0] : null,
        prevPericopeSize = (stats.minIndex > 0) ? daysCopy[stats.minIndex-1].pericopes[daysCopy[stats.minIndex-1].pericopes.length-1] : null;

    // take the first element from the next group
    if (nextPericopeSize !== null && nextPericopeSize > prevPericopeSize) {
        let nextPericope = daysCopy[stats.minIndex+1].pericopes.shift();
		daysCopy[stats.minIndex].pericopes.push(nextPericope);
		
		countVersesInPericopes(daysCopy[stats.minIndex+1]);
    } else if (prevPericopeSize !== null) {
        // move the last element forward
        let prevPericope = daysCopy[stats.minIndex-1].pericopes.pop();
		daysCopy[stats.minIndex].pericopes.unshift(prevPericope);
		
		countVersesInPericopes(daysCopy[stats.minIndex-1]);
	}
	
	countVersesInPericopes(daysCopy[stats.minIndex]);

    return daysCopy;
}

function getPlanStats(days) {
	//var countPerGroup = days.filter(day => day.versesForToday > 0).map(day => day.pericopes.reduce((a,b) => a + (b.range.length || 0), 0)); // .versesForToday);
	var countPerGroup = days.filter(day => day.versesForToday > 0).map(day => day.versesForToday);
    var minCount = Math.min(...countPerGroup);
    var minIndex = countPerGroup.indexOf(minCount);
    var maxCount = Math.max(...countPerGroup);
    var maxIndex = countPerGroup.indexOf(maxCount);
    
    //console.log(countPerGroup);

    var avgCount = countPerGroup.reduce((a,b) => a + b, 0) / countPerGroup.length;
    
    var stats = {
        'min': minCount,
        'max': maxCount,
        'avg': avgCount,
        'minIndex': minIndex,
        'maxIndex': maxIndex
    }

    return stats;
}

function getPlanWordStats(days) {

	var countPerGroup = days.filter(day => day.wordsForToday > 0).map(day => day.wordsForToday);
    var minCount = Math.min(...countPerGroup);
    var minIndex = countPerGroup.indexOf(minCount);
    var maxCount = Math.max(...countPerGroup);
    var maxIndex = countPerGroup.indexOf(maxCount);
    
    //console.log(countPerGroup);

    var avgCount = countPerGroup.reduce((a,b) => a + b, 0) / countPerGroup.length;
    
    var stats = {
        'min': minCount,
        'max': maxCount,
        'avg': avgCount,
        'minIndex': minIndex,
        'maxIndex': maxIndex
    }

    return stats;
}

function deepClone(obj) {
	var regExp = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
	return JSON.parse(JSON.stringify(obj), function(k, v) {
		if (typeof v === 'string' && regExp.test(v)) {
			return new Date(v);
		}
		return v;
	});
}

function deepClone2(obj) {
	if (typeof obj !== "object") {
	  return obj;
	} else {
	  let newObj =
		typeof obj === "object" && obj.length !== undefined ? [] : {};
	  for (let key in obj) {
		if (key) {
		  newObj[key] = deepClone(obj[key]);
		}
	  }
	  return newObj;
	}
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

function formatChapterGroupsRange(lang, chapterGroups, isFullname) {
	var mergedChapters = [].concat.apply([], chapterGroups);
	return formatChapterRange(lang, mergedChapters, isFullName)
}

function formatChapterRange(lang, chapters, includeUrls, urlSite, urlVersion) {
	
	//isFullname = isFullname || false;
	
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
				if (firstChapterOfBook != previousChapterNumber && previousChapterWasRange) {
					formatted += '-' + previousChapterNumber.toString();				
				}
				formatted += '; ';	
			}
			previousChapterWasRange = false;
			
			// stary with the book name/abbr
			formatted += //(includeUrls ? '<a href="' + createUrl(lang, '','',chapter.usfm, chapter.chapter, '', '') + '" target="_blank">' : '') +
				bible.getAbbr(bookInfo, lang);

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
	
	return (includeUrls ? '<a href="' + createUrl(formatted, chapters[0].usfm, chapters[0].chapter, urlSite, urlVersion) + '" target="_blank">' : '') 
		+ formatted
		+ (includeUrls ? '</a>' : '');
}

function formatPericopeRange(lang, pericopes, includeUrls, urlSite, urlVersion) {

	isFullname = isFullname || false;
	
	if (!pericopes || pericopes == null || pericopes.length == 0) {
        return '';
	}

	// create pairs 
	
	var pericopePairs = [];
	pericopes.forEach(function (pericope, index) {
		// for singles
		if (index == 0 && pericopes.length == 1) {
			pericopePairs.push({start: pericope.start, end: pericope.end});
		}		
		// for the first one, just use the start and no end
		if (index == 0 && pericopes.length > 1) {
			pericopePairs.push({start: pericope.start, end: ''});
		}

		// for middle ones
		if (index > 0 && index < pericopes.length) {
			// middle ones. what we gonna do.
			var prevPericope = pericopes[index-1],
				prevBookUsfm = prevPericope.end.split('_')[0],				
				prevChapter = parseInt(prevPericope.end.split('_')[1], 10),							
				thisBookUsfm = pericope.start.split('_')[0],				
				thisChapter = parseInt(pericope.start.split('_')[1], 10)
				;

			if (prevBookUsfm != thisBookUsfm // change book 
				|| thisChapter > prevChapter + 1
				|| thisChapter < prevChapter
			) {
				// the last pericope should end a group
				pericopePairs[pericopePairs.length-1].end = prevPericope.end;
				// this one should start a new group
				pericopePairs.push({start: pericope.start, end: ''});
			} 
			
			if (index == pericopes.length -1) {
				pericopePairs[pericopePairs.length-1].end = pericope.end
			}

		}
		
	});
	// EPH_1_1-EPH_1_15, EPH_1_16-EPH_1_31, EPH_2_1-EPH_2_15, PSA_1_1-PS_1_12, PSA_6_1-PSA_6_22	

	var formatted = '';
	pericopePairs.forEach(function(pair, index) {
		var
			firstBookUsfm = pair.start.split('_')[0],
			firstBook = bible.BIBLE_DATA[firstBookUsfm],
			firstChapter = parseInt(pair.start.split('_')[1], 10),
			firstVerse = parseInt(pair.start.split('_')[2], 10),
						
			lastBookUsfm = pair.end.split('_')[0],
			lastBook = bible.BIBLE_DATA[lastBookUsfm],
			lastChapter = parseInt(pair.end.split('_')[1], 10),
			lastVerse = parseInt(pair.end.split('_')[2], 10),
			lastVerseMax = lastBook.chapters[lastChapter-1];
			
		let verseRange = '';
		
		// show verse if the book or chapter is different
		if (firstBookUsfm !== lastBookUsfm || 
			firstChapter !== lastChapter || 
			firstVerse !== 1 || 
			lastVerse !== lastVerseMax) {
			
			// show the verse with the chapter
			if (firstBookUsfm !== lastBookUsfm || firstVerse !== 1 || lastVerse !== lastVerseMax) {
				verseRange += ':' + firstVerse;
			}

			verseRange += '–';

			// show the final book
			if (firstBookUsfm !== lastBookUsfm) {
				verseRange += bible.getAbbr(lastBook, lang) + ' ';
			}

			// show the final chapter an verse
			if (firstBookUsfm !== lastBookUsfm || firstChapter !== lastChapter) {
				verseRange += lastChapter;
				if (firstBookUsfm !== lastBookUsfm || firstVerse !== 1 || lastVerse !== lastVerseMax) {
					verseRange += ':' + lastVerse;
				} 
			} else {
				verseRange += lastVerse;
			}	
		}	

		// first pericope
		formatted += (index > 0 ? '; ' : '') + bible.getAbbr(firstBook, lang) + ' ' + firstChapter;

		formatted += verseRange;
	});
	
	return formatted;
}

function createUrl(verseList, bookUsfm, chapter, site, version) {

	if (!site || site == '') {
		site = 'biblegateway';
	}
	if (!version || version == '') {
		version = 'NIV';
	}	
	
	var url = '';

	switch (site) {
		case 'biblegateway':		
			let bookInfo = bible.BIBLE_DATA[bookUsfm];
			
			url = `https://www.biblegateway.com/passage/?search=${verseList}&version=${version}`;
			
			break;
		case 'biblia':		
			
			url = `https://biblia.com/books/${version.toLowerCase()}/${bookUsfm}${chapter}`;
			
			break;			
		case 'youversion':
			let yvVersions = {
				'NIV': 111,
				'ESV': 59,
				'NASB': 2692,
				'NRSV': 2016,
				'CSB': 1713,
				'KJV': 1,
				'MSG': 97
			};
			let yvVersion = yvVersions[version];
			if (!yvVersion) {
				yvVersion = 111
			}
		
			url = `https://www.bible.com/bible/${yvVersion}/${bookUsfm}.${chapter}`;
			
			break;
	}

	return url;
}