<?php include("title.php"); ?>
<!doctype html>
<html>
<head lang="en">
	<meta charset="utf-8">	
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title><?php echo $title ?? $default_title; ?></title>

	<link href="https://fonts.googleapis.com/css?family=Merriweather|Source+Sans+Pro&display=swap" rel="stylesheet">
	<link rel="stylesheet" href="style.css?v=2023-12-27" />

	<meta property="og:title" content="<?php echo $title ?? $default_title; ?>" />
	<meta property="og:description" content="Choose your time frame, format, and the books of the Bible you want to read, then print it out!" />
	<meta property="og:url" content="https://www.biblereadingplangenerator.com/<?php echo empty($_SERVER['QUERY_STRING']) ? '' : '?' . $_SERVER['QUERY_STRING'] ?>" />
	<meta property="og:image" content="https://www.biblereadingplangenerator.com/biblereadingplandemo.png" />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:creator" content="@johndyer" />
	<meta name="twitter:title" content="<?php echo $title ?? $default_title; ?>" />
	<meta name="twitter:description" content="Choose your time frame, format, and the books of the Bible you want to read, then print it out!" />
	<meta name="twitter:image" content="https://www.biblereadingplangenerator.com/biblereadingplandemo.png" />	
</head>
<body>
	
	<div id="container">		
		<header id="main-header">
			<div id="main-header-padding">
				<h1>Bible Reading Plan Generator</h1>
				<a class="support" href="https://patreon.com/johndyer?utm_medium=website&utm_source=biblereadingplangenetor.com&utm_campaign=mainlink">Support on Patreon</a>
			</div>
		</header>
		
		<div id="sample-plans">
			Samples: <a id="demo-bibleyear" href="/?start=01-01&books=OT,NT&logic=words">Bible in a Year List</a> | 
			<a id="demo-bibleyear" href="/?total=40&format=calendar&order=traditional&daysofweek=2,3,4,5,6,7&books=JHN&lang=en&logic=pericopes&checkbox=1dailystats=1&includeurls=1">John in 40 Days</a> |
			<a id="demo-ntweekendsoff" href="/?start=01-01&books=NT&format=weeks&logic=chapters&daysofweek=2,3,4,5,6">New Testament, Weekends Off</a> | 
			<a id="demo-bibleyear" href="/?format=list&total=180&books=OT&order=chronological">Chronological OT in 6 months</a> |
			<a id="demo-bibleyear" href="/?format=circle&colors=1">Pretty Color Wheel</a> |
			<a id="demo-bibleyear" href="/?format=books&colors=1&books=OT,NT,DC">Deuterocanonical by Book</a> |
			<a id="demo-bibleyear" href="/?lang=es">español</a> |
			<a id="demo-bibleyear" href="/?lang=hi">हिन्दी</a>
		</div>

		<main>
			
			<nav id="settings">
			<section class="decision" id="section-time">
				<header>
					<h2>Time Frame</h2>
				</header>
						
				<div class="decision-body">				
					<label for="time-startdate">Start:</label> 	<input type="date" id="time-startdate" placeholder="Start Date" />
					<label for="time-days">Days:</label> 	<input type="number" id="time-days" placeholder="Days in plan" />
				</div>
			</section>
			
			<section class="decision" id="section-format">
				<header>
					<h2>Format</h2>
				</header>
				
				<div class="decision-body">
					<select id="options-language">
						<option value="en">English</option>
						<option value="de">Deutsch (German)</option>
						<option value="es">español (Spanish)</option>
						<option value="fi">Finnish (Suomalainen)</option>
						<option value="fr">le français (French)</option>
						<option value="po">Português (Portuguese)</option>
						<option value="ru">Ру́сский (Russia)</option>
						<option value="sv">svenska (Swedish)</option>	
						<option value="tr">Türkçe (Turkish)</option>											
						<option value="ar">العَرَبِيَّة‎ (Arabic)</option>
						<option value="bn">বাংলা (Bengali)</option>
						<option value="zh-CN">汉语 (Chinese Simplified)</option>
						<option value="zh-TW">漢語 (Chinese Traditional)</option>	
						<option value="el">Ελληνικά (Greek)</option>	
						<option value="iw">עִברִית (Hebrew)</option>												
						<option value="hi">हिन्दी (Hindi)</option>
						<option value="jv">ꦧꦱꦗꦮ (Javanese)</option>
						<option value="ml">മലയാളം (Malayalam)</option>
						<option value="ja">日本 (Japanese)</option>
						<option value="kr">한국어 (Korean)</option>
						<option value="mr">मराठी (Marathi)</option>	
						<option value="pa">ਪੰਜਾਬੀ (Punjabi)</option>						
						<option value="ta">தமிழ் (Tamil)</option>
						<option value="te">తెలుగు (Telugu)</option>
						<option value="ur">اردو (Urdu)</option>
					</select>
					
					<label>
						<input type="radio" id="formatstyle-calendar" name="formatstyle" value="calendar" >
						Calendar
					</label>

					<label>
						<input type="radio" id="formatstyle-list" name="formatstyle" value="list">
						List
					</label>
					
					<label>
						<input type="radio" id="formatstyle-weeks" name="formatstyle" value="weeks">
						Weeks
					</label>

					<label>
						<input type="radio" id="formatstyle-books" name="formatstyle" value="books">
						Books
					</label>	
					
					<label>
						<input type="radio" id="formatstyle-books" name="formatstyle" value="circle">
						Circle
					</label>						
				

					<input type="button" id="download-pdf" value="Get PDF" style="display:none;">
											
					<input type="button" id="download-ics" value="iCal">
					<input type="button" id="download-csv" value="CSV">
					<input type="button" id="action-print" value="Print">					
				</div>
			</section>				
			
			<section class="decision" id="section-books">
				<header>
					<h2>Bible Books</h2>
				</header>
				
				<div class="decision-body">
					
					<div class="order-traditional order-group">
						<label><input type="radio" name="bibleorder" value="traditional">Traditional</label>
						
						<details class="section-OT">
							<summary>
								<label class="books-testament"><input type="checkbox" value="OT">Old Testament</label>
							</summary>

							<div class="books-list">						
								
							</div>						
						</details>						

						<details class="section-DC">
							<summary>
								<label class="books-testament"><input type="checkbox" value="DC">Deuterocanonical</label>
							</summary>

							<div class="books-list">						
								
							</div>						
						</details>						
						
						<details class="section-NT">
							<summary>
								<label class="books-testament"><input type="checkbox" value="NT">New Testament</label>
							</summary>

							<div class="books-list">
													
							</div>
						</details>
					</div>
					
					
					<div class="order-chronological order-group">
						<br>
						<label><input type="radio" name="bibleorder" value="chronological" >Chronological</label>
						<br>
						<label class="books-testament"><input type="checkbox" class="section-ot" value="OT">Old Testament</label>
						<br>
						<label class="books-testament"><input type="checkbox" class="section-nt" value="NT" >New Testament</label>
					</div>


					<div class="order-tanakh order-group">
						<br>
						<label><input type="radio" name="bibleorder" value="tanakh">Tanakh</label>
						
						<details class="section-OT">
							<summary>
								<label class="books-testament"><input type="checkbox" value="OT">Hebrew Bible</label>
							</summary>

							<div class="books-list">						
								
							</div>						
						</details>						

					</div>	


					<div class="order-mcheyne order-group">
						<br>
						<label><input type="radio" name="bibleorder" value="mcheyne" >M'Cheyne</label>						
					</div>	
					
					<div id="divide-by">
						<label>Divide by
							<select id="options-logic">
								<option value="chapters" >Number of Chapters</option>
								<option value="words" selected>Words per Chapter</option>
								<option value="pericopes">Pericopes</option>
							</select>
						</label> 										
					</div>
				</div>
			</section>	
			
					
			<section class="decision" id="section-days">
				<header>
					<h2>Days of the Week</h2>
				</header>
				
				<div class="decision-body">								
					<label><input type="checkbox" id="days-1" value="1">Sunday</label>
					<label><input type="checkbox" id="days-2" value="2">Monday</label>
					<label><input type="checkbox" id="days-3" value="3">Tuesday</label>
					<label><input type="checkbox" id="days-4" value="4">Wednesday</label>
					<label><input type="checkbox" id="days-5" value="5">Thursday</label>
					<label><input type="checkbox" id="days-6" value="6">Friday</label>
					<label><input type="checkbox" id="days-7" value="7">Saturday</label>			
				</div>
			</section>
						
			<section class="decision" id="section-options">
				<header>
					<h2>Options</h2>
				</header>
				
				<div class="decision-body">

					<label><input type="checkbox" id="options-checkbox">Include Checkbox</label>

					<label><input type="checkbox" id="options-sectioncolors">Section Colors</label>

					<label><input type="checkbox" id="options-dailypsalm" >Daily Psalm</label>					
					
					<label><input type="checkbox" id="options-dailyproverb" >Daily Proverb</label>

					<label><input type="checkbox" id="options-otntoverlap" >OT/NT Overlap</label>
					
					<label><input type="checkbox" id="options-reverse" >Reverse</label>

					<label><input type="checkbox" id="options-nodates" >Remove Dates</label>

					<label><input type="checkbox" id="options-stats">Show Overall Stats</label>

					<label><input type="checkbox" id="options-dailystats">Show Daily Stats</label>

					<label><input type="checkbox" id="options-includeurls">Add Reading Links</label>

					<div id="options-siteandversion">
						<select id="options-urlsite">
							<option value="biblegateway" selected>Bible Gateway</option>
							<option value="youversion" >YouVersion</option>
							<option value="biblia">Biblia</option>
						</select>	
						<select id="options-urlversion">													
							<optgroup label="English" lang="en">
								<option value="AMP" yv="1588">AMP</option>
								<option value="CSB" yv="1713">CSB</option>
								<option value="ESV" yv="59">ESV</option>	
								<option value="KJV" yv="1">KJV</option>	
								<option value="NRSV" yv="2016">NRSV</option>	
								<option value="MSG" yv="97">MSG</option>	
								<option value="NASB" yv="2692">NASB</option>
								<option value="NET" yv="107">NET</option>	
								<option value="NIRV" yv="110">NIRV</option>						
								<option value="NIV" yv="111" selected>NIV</option>									
								<option value="NET" yv="107">NET</option>								
							</optgroup>	

							<optgroup label="Deutsch" lang="de">
								<option value="NGU-DE" yv="108">NGU</option>	
							</optgroup>

							<optgroup label="Espanol" lang="es">
								<option value="NVI" yv="1637">NVI</option>	
							</optgroup>

							<optgroup label="Ру́сский" lang="ru">
								<option value="CARS" yv="385">CARS</option>	
								<option value="SYNO" yv="400">SYNO</option>	
							</optgroup>							
						
						</select>
					</div>


				</div>
			</section>


			</nav>				
			
			<div id="output">
				
				
			</div>	
		</main>
		
		<footer id="main-footer">
			biblereadingplangenerator.com<br>
			by <a href="https://j.hn/">John Dyer</a> (@<a href="https://twitter.com/johndyer/">johndyer</a>)
		</footer>
	
	</div>
	
	<script src="jquery.min.js"></script>
	<scriptx src="jspdf.min.js"></scriptx>
	<scriptx src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/0.4.1/html2canvas.min.js"></scriptx>
	<script src="helpers.js?v=2023-12-27"></script>
	
	<script src="bible.data.js?v=2023-12-27"></script>
	<script src="bible.data.languages.js?v=2023-12-27"></script>
	<script src="bible.data.wordcounts.js?v=2023-12-27"></script>
	<script src="bible.reference.js?v=2023-12-27"></script>
	<script src="bible.plans.js?v=2023-12-27"></script>
	
	<script src="bible.pericopes.js?v=2023-12-27"></script>

	<script src="plans.js?v=2023-12-27"></script>
	<script src="renderers.js?v=2023-12-27"></script>
	<script src="app.js?v=2023-12-27"></script>
	

<!-- Global site tag (gtag.js) - Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=UA-3734687-20"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'UA-3734687-20');
</script>

<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-F0YZLVR7KE"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-F0YZLVR7KE');
</script>

</body>
</html>
	