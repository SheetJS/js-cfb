if(typeof require !== 'undefined' && typeof exports !== 'undefined') {
	Array.prototype.toBuffer = function() {
		return Buffer.concat(this[0]);
	};
	var fs = require('fs');
	exports.read = CFB.read;
	exports.parse = CFB.parse;
	exports.utils = CFB_utils;
	exports.main = function(args) {
		var cfb = CFB.read(args[0], {type:'file'});
		console.log(cfb);
	};
	if(typeof module !== 'undefined' && require.main === module)
		exports.main(process.argv.slice(2));
} else {
	Array.prototype.toBuffer = function() {
		var x = [];
		for(var i = 0; i != this[0].length; ++i) { x = x.concat(this[0][i]); }
		return x;
	};
}
