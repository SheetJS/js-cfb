var CFB;
var fs = require('fs');
describe('source', function() { it('should load', function() { CFB = require('./'); }); });
var files = fs.readdirSync('test_files').filter(function(x){return x.substr(-4)==".xls";});
files.forEach(function(x) {
	describe(x, function() {
		it('should parse ' + x, function() {
			var cfb = CFB.read('./test_files/' + x, {type: "file"});
		});
	});
});
