(function(exports) {

var ordinals = function(number,input) {
	var parts = input.split(' '), 
		result = [], 
		ords = null,
		i,il,j,jl;
	if (number == 1) {
		ords = ['1','I','First'];
	} else if (number ==2) {
		ords = ['2','II','Second'];
	} else if (number == 3) {
		ords = ['3','III','Third'];
	}
	for (i=0,il=parts.length; i<il; i++) {
		for (j=0,jl=ords.length; j<jl; j++) {
			// 1 John
			result.push(ords[j] + ' ' + parts[i]);
			// 1John
			if (j === 0) {
				result.push(ords[j] + parts[i]);
			}
		}			
	}
	
	return result;
}

// add additional English Abbr
var samuel = 'Samuel Sa Sam',
	kings = 'Kings Ki King Kin Kngs',
	chronicles = 'Chronicles Ch Chr',
	
	corinthians = 'Corinthians Co Cor',
	thess = 'Thessalonians Th Thess Thes',	
	timothy = 'Timothy Ti Tim',		
	
	peter = 'Peter Pe Pet P',
	john = 'John Jo Jn J',			
	
	englishAbbr = {
		'DT':['Deut'],
		'JG':['Jdgs','Judg'],
		'S1':ordinals(1,samuel),
		'S2':ordinals(2,samuel),		
		'K1':ordinals(1,kings),		
		'K2':ordinals(2,kings),
		'R1':ordinals(1,chronicles),		
		'R2':ordinals(2,chronicles),
		'LM':['Lament'],
	
		'C1':ordinals(1,corinthians),
		'C2':ordinals(2,corinthians),		
		
		'H1':ordinals(1,thess),		
		'H2':ordinals(2,thess),
		'T1':ordinals(1,timothy),		
		'T2':ordinals(2,timothy),
		
		'P1':ordinals(1,peter),		
		'P2':ordinals(2,peter),
		'J1':ordinals(1,john),		
		'J2':ordinals(2,john),					
		'J3':ordinals(3,john),							
	
	};

for (var bookid in englishAbbr) {
	var abbr = englishAbbr[bookid],
		book = exports.BIBLE_DATA.filter(function(b) { return b.bookid == bookid } )[0];
	
	book.abbr.en = book.abbr.en.concat(abbr);
}


})(window.bible || {});