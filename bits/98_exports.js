if(typeof require !== 'undefined' && typeof exports !== 'undefined') {
	var fs = require('fs');
	exports.read = CFB.read;
	exports.parse = CFB.parse;
	exports.utils = CFB_utils;
	exports.version = CFB.version;
}
