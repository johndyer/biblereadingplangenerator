(function(exports) {

	var compileddata = [],
		compileddata_usfm = {},
		compileddata_osis = {},
		compileddata_id = {},
	
		rawdata = [
[1,0,0,'GEN Gen GN',[31,25,24,26,32,22,24,22,29,32,32,20,18,24,21,16,27,33,38,18,34,24,20,67,34,35,46,22,35,43,55,32,20,31,29,43,36,30,23,23,57,38,34,34,28,34,31,22,33,26],'Genesis'],
[2,0,0,'EXO Exod EX',[22,25,22,31,23,30,25,32,35,29,10,51,22,31,27,36,16,27,25,26,36,31,33,18,40,37,21,43,46,38,18,35,23,35,35,38,29,31,43,38],'Exodus'],
[3,0,0,'LEV Lev LV',[17,16,17,35,19,30,38,36,24,20,47,8,59,57,33,34,16,30,37,27,24,33,44,23,55,46,34],'Leviticus'],
[4,0,0,'NUM Num NU',[54,34,51,49,31,27,89,26,23,36,35,16,33,45,41,50,13,32,22,29,35,41,30,25,18,65,23,31,40,16,54,42,56,29,34,13],'Numbers'],
[5,0,0,'DEU Deut DT',[46,37,29,49,33,25,26,20,29,22,32,32,18,29,23,22,20,22,21,20,23,30,25,22,19,19,26,68,29,20,30,52,29,12],'Deuteronomy'],
[6,0,1,'JOS Josh JS',[18,24,17,24,15,27,26,35,27,43,23,24,33,15,63,10,18,28,51,9,45,34,16,33],'Joshua'],
[7,0,1,'JDG Judg JG',[36,23,31,24,31,40,25,35,57,18,40,15,25,20,20,31,13,31,30,48,25],'Judges'],
[8,0,1,'RUT Ruth RT',[22,23,18,22],'Ruth'],
[9,0,1,'1SA 1Sam S1',[28,36,21,22,12,21,17,22,27,27,15,25,23,52,35,23,58,30,24,42,15,23,29,22,44,25,12,25,11,31,13],'1 Samuel'],
[10,0,1,'2SA 2Sam S2',[27,32,39,12,25,23,29,18,13,19,27,31,39,33,37,23,29,33,43,26,22,51,39,25],'2 Samuel'],
[11,0,1,'1KI 1Kgs K1',[53,46,28,34,18,38,51,66,28,29,43,33,34,31,34,34,24,46,21,43,29,53],'1 Kings'],
[12,0,1,'2KI 2Kgs K2',[18,25,27,44,27,33,20,29,37,36,21,21,25,29,38,20,41,37,37,21,26,20,37,20,30],'2 Kings'],
[13,0,1,'1CH 1Chr R1',[54,55,24,43,26,81,40,40,44,14,47,40,14,17,29,43,27,17,19,8,30,19,32,31,31,32,34,21,30],'1 Chronicles'],
[14,0,1,'2CH 2Chr R2',[17,18,17,22,14,42,22,18,31,19,23,16,22,15,19,14,19,34,11,37,20,12,21,27,28,23,9,27,36,27,21,33,25,33,27,23],'2 Chronicles'],
[15,0,1,'EZR Ezra ER',[11,70,13,24,17,22,28,36,15,44],'Ezra'],
[16,0,1,'NEH Neh NH',[11,20,32,23,19,19,73,18,38,39,36,47,31],'Nehemiah'],
[17,0,1,'EST Esth ET',[22,23,15,17,14,14,10,17,32,3],'Esther'],
[18,0,1,'JOB Job JB',[22,13,26,21,27,30,21,22,35,22,20,25,28,22,35,22,16,21,29,29,34,30,17,25,6,14,23,28,25,31,40,22,33,37,16,33,24,41,30,24,34,17],'Job'],
[19,0,2,'PSA Ps PS',[6,12,8,8,12,10,17,9,20,18,7,8,6,7,5,11,15,50,14,9,13,31,6,10,22,12,14,9,11,12,24,11,22,22,28,12,40,22,13,17,13,11,5,26,17,11,9,14,20,23,19,9,6,7,23,13,11,11,17,12,8,12,11,10,13,20,7,35,36,5,24,20,28,23,10,12,20,72,13,19,16,8,18,12,13,17,7,18,52,17,16,15,5,23,11,13,12,9,9,5,8,28,22,35,45,48,43,13,31,7,10,10,9,8,18,19,2,29,176,7,8,9,4,8,5,6,5,6,8,8,3,18,3,3,21,26,9,8,24,13,10,7,12,15,21,10,20,14,9,6],'Psalm'],
[20,0,2,'PRO Prov PR',[33,22,35,27,23,35,27,36,18,32,31,28,25,35,33,33,28,24,29,30,31,29,35,34,28,28,27,28,27,33,31],'Proverbs'],
[21,0,2,'ECC Eccl EC',[18,26,22,16,20,12,29,17,18,20,10,14],'Ecclesiastes'],
[22,0,2,'SNG Song SS',[17,17,11,16,16,13,13,14],'Song of Songs'],
[23,0,3,'ISA Isa IS',[31,22,26,6,30,13,25,22,21,34,16,6,22,32,9,14,14,7,25,6,17,25,18,23,12,21,13,29,24,33,9,20,24,17,10,22,38,22,8,31,29,25,28,28,25,13,15,22,26,11,23,15,12,17,13,12,21,14,21,22,11,12,19,12,25,24],'Isaiah'],
[24,0,3,'JER Jer JR',[19,37,25,31,31,30,34,22,26,25,23,17,27,22,21,21,27,23,15,18,14,30,40,10,38,24,22,17,32,24,40,44,26,22,19,32,21,28,18,16,18,22,13,30,5,28,7,47,39,46,64,34],'Jeremiah'],
[25,0,2,'LAM Lam LM',[22,22,66,22,22],'Lamentations'],
[26,0,3,'EZK Ezek EK',[28,10,27,17,17,14,27,18,11,22,25,28,23,23,8,63,24,32,14,49,32,31,49,27,17,21,36,26,21,26,18,32,33,31,15,38,28,23,29,49,26,20,27,31,25,24,23,35],'Ezekiel'],
[27,0,3,'DAN Dan DN',[21,49,30,37,31,28,28,27,27,21,45,13],'Daniel'],
[28,0,4,'HOS Hos HS',[11,23,5,19,15,11,16,14,17,15,12,14,16,9],'Hosea'],
[29,0,4,'JOL Joel JL',[20,32,21],'Joel'],
[30,0,4,'AMO Amos AM',[15,16,15,13,27,14,17,14,15],'Amos'],
[31,0,4,'OBA Obad OB',[21],'Obadiah'],
[32,0,4,'JON Jonah JH',[17,10,10,11],'Jonah'],
[33,0,4,'MIC Mic MC',[16,13,12,13,15,16,20],'Micah'],
[34,0,4,'NAM Nah NM',[15,13,19],'Nahum'],
[35,0,4,'HAB Hab HK',[17,20,19],'Habakkuk'],
[36,0,4,'ZEP Zeph ZP',[18,15,20],'Zephaniah'],
[37,0,4,'HAG Hag HG',[15,23],'Haggai'],
[38,0,4,'ZEC Zech ZC',[21,13,10,14,11,15,14,23,17,12,17,14,9,21],'Zechariah'],
[39,0,4,'MAL Mal ML',[14,17,18,6],'Malachi'],
[40,2,10,'TOB Tob TB',[22,14,17,21,22,17,18],'Tobit'],
[41,2,10,'JDT Jdt JT',[16,28,10,15,24,21,32,36,14,23,23,20,20,19,13,25],'Judith'],
[42,2,10,'ESG EsthGr EG',[,,,,,,,,,,,,,,,],'Esther (Greek)'],
[43,2,10,'ADE AddEsth AE',[],'Additions to Esther'],
[44,2,10,'WIS Wis WS',[],'Wisdom'],
[45,2,10,'SIR Sir SR',[],'Sirach'],
[46,2,10,'BAR Bar BR',[],'Baruch'],
[47,2,10,'LJE EpJer LJ',[],'Letter of Jeremiah'],
[48,2,10,'S3Y PrAzar PA',[],'Prayer of Azariah'],
[49,2,10,'SUS Sus SN',[],'Susanna'],
[50,2,10,'BEL Bel BL',[],'Bel and the Dragon'],
[51,2,10,'1MA 1Macc M1',[],'1 Maccabees'],
[52,2,10,'2MA 2Macc M2',[],'2 Maccabees'],
[53,2,10,'1ES 1Esd E1',[],'1 Esdras'],
[55,2,10,'PS2 AddPs PX',[],'Psalm 151'],
[55,2,10,'MAN PrMan PN',[],'Prayer of Manasseh'],
[56,2,10,'3MA 3Macc M3',[],'3 Maccabees'],
[57,2,10,'2ES 2Esd E2',[],'2 Esdras'],
[58,2,10,'4MA 4Macc M4',[],'4 Maccabees'],
[59,2,10,'ODS OdesSol OS',[],'Odes of Solomon'],
[60,2,10,'PSS PssSol SP',[],'Psalms of Solomon'],
[61,2,10,'EPL EpLao LL',[],'Epistle to the Laodiceans'],
[62,2,10,'1EN 1En N1',[],'Ethiopic Apocalypse of Enoch'],
[63,2,10,'JUB Jub JE',[],'Jubilees'],
[64,2,10,'DNT AddDan AD',[,,,,,,,,,,,,,],'Additions to Daniel'],
[65,2,10,'DAG DanGr DG',[,,,,,,,,,,,],'Daniel (Greek)'],
[69,1,5,'MAT Matt MT',[25,23,17,25,48,34,29,34,38,42,30,50,58,36,39,28,27,35,30,34,46,46,39,51,46,75,66,20],'Matthew'],
[70,1,5,'MRK Mark MK',[45,28,35,41,43,56,37,38,50,52,33,44,37,72,47,20],'Mark'],
[71,1,5,'LUK Luke LK',[80,52,38,44,39,49,50,56,62,42,54,59,35,35,32,31,37,43,48,47,38,71,56,53],'Luke'],
[72,1,5,'JHN John JN',[51,25,36,54,47,71,53,59,41,42,57,50,38,31,27,33,26,40,42,31,25],'John'],
[73,1,6,'ACT Acts AC',[26,47,26,37,42,15,60,40,43,48,30,25,52,28,41,40,34,28,41,38,40,30,35,27,27,32,44,31],'Acts'],
[74,1,7,'ROM Rom RM',[32,29,31,25,21,23,25,39,33,21,36,21,14,23,33,27],'Romans'],
[75,1,7,'1CO 1Cor C1',[31,16,23,21,13,20,40,13,27,33,34,31,13,40,58,24],'1 Corinthians'],
[76,1,7,'2CO 2Cor C2',[24,17,18,18,21,18,16,24,15,18,33,21,14],'2 Corinthians'],
[77,1,7,'GAL Gal GL',[24,21,29,31,26,18],'Galatians'],
[78,1,7,'EPH Eph EP',[23,22,21,32,33,24],'Ephesians'],
[79,1,7,'PHP Phil PP',[30,30,21,23],'Philippians'],
[80,1,7,'COL Col CL',[29,23,25,18],'Colossians'],
[81,1,7,'1TH 1Thess H1',[10,20,13,18,28],'1 Thessalonians'],
[82,1,7,'2TH 2Thess H2',[12,17,18],'2 Thessalonians'],
[83,1,7,'1TI 1Tim T1',[20,15,16,16,25,21],'1 Timothy'],
[84,1,7,'2TI 2Tim T2',[18,26,17,22],'2 Timothy'],
[85,1,7,'TIT Titus TT',[16,15,15],'Titus'],
[86,1,7,'PHM Phlm PM',[25],'Philemon'],
[87,1,8,'HEB Heb HB',[14,18,19,16,14,20,28,13,28,39,40,29,25],'Hebrews'],
[88,1,8,'JAS Jas JM',[27,26,18,17,20],'James'],
[89,1,8,'1PE 1Pet P1',[25,25,22,19,14],'1 Peter'],
[90,1,8,'2PE 2Pet P2',[21,22,18],'2 Peter'],
[91,1,8,'1JN 1John J1',[10,29,24,21,21],'1 John'],
[92,1,8,'2JN 2John J2',[13],'2 John'],
[93,1,8,'3JN 3John J3',[14],'3 John'],
[94,1,8,'JUD Jude JD',[25],'Jude'],
[95,1,9,'REV Rev RV',[20,29,22,11,14,17,17,13,21,11,19,17,18,20,8,21,18,24,21,15,27,20],'Revelation']

	],
	testaments = ['ot','nt','dc'],
	sections = ['pentateuch','historical','poetic','major','minor','gospel','acts','paul','general','revelation','deuterocanonical'];


	for (var i=0, il=rawdata.length; i<il; i++) {
		var d = rawdata[i],
			abbr = d[3].split(' '),
			usfm = abbr[0],
			osis = abbr[1],
			id = abbr[2],
			preferredAbbr = osis[0] + 
								((osis[0] == '1' || osis[0] == '2'	|| osis[0] == '3') ?
								' ' + osis[1] + osis.substr(2).toLowerCase() :
								osis.substr(1).toLowerCase()),
			
			book = {
				order:		d[0],
				usfm: 		usfm,				
				osis: 		osis,
				bookid: 	id,
				verses: 	d[4],
				names: {
					en: d[5]
				},
				abbr: {
					en: [preferredAbbr, abbr[0],abbr[1],abbr[2]]
				},
				testament: testaments[d[1]],
				section: sections[d[2]],				
			}
		
		compileddata_osis[osis] =book;
		compileddata_usfm[usfm] =book;	
		compileddata_id[id] =book;				
		compileddata.push(book);
	}

	exports.BIBLE_DATA = compileddata;
	exports.BIBLE_DATA_USFM = compileddata_usfm;	
	exports.BIBLE_DATA_OSIS = compileddata_osis;	
	exports.BIBLE_DATA_ID = compileddata_id;		
})(window.bible || {});