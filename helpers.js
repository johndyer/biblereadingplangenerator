//  date helpers
Date.prototype.addDays = function(d) {
	return new Date(this.getTime() + d*24*60*60*1000);
}
var months = 'Jan Feb Mar Apr May Jun July Aug Sep Oct Nov Dec'.split(' ');
Date.prototype.pretty = function(d) {
	return months[this.getMonth()] + ' ' + this.getDate() + ', ' + this.getFullYear();
}
Date.prototype.monthAbbr = function(d) {
	return months[this.getMonth()];
}
Date.prototype.formatted = function(d) {
	return this.getFullYear() + '/' + (1+this.getMonth()) + '/' + this.getDate();
}
Date.prototype.toInputField = function(d) {
	
	var t = this,
		m = t.getMonth()+1,
		d = t.getDate(),
		y = t.getFullYear(),
		f = y.toString() + '-' + (m > 9 ? m :'0' + m) + '-' + (d > 9 ? d :'0' + d);	

	return f;
}

// save
var saveData = (function () {
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    return function (blob, fileName) {
       // var json = JSON.stringify(data),
        //    blob = new Blob([json], {type: "octet/stream"}),
        var url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
    };
}());
