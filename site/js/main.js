
var init = function() {
	var wod = getWOD();
	console.log(wod);
	$('#wod').html(wod.description);
};

var getWOD = function() {
	return routines[Math.floor(Math.random()*routines.length)];
};

$(init);
