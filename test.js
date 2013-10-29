/* vim: set ts=2: */
var CFB;
var fs = require('fs');
describe('source', function() { it('should load', function() { CFB = require('./'); }); });

var files = fs.readdirSync('test_files').filter(function(x){return x.substr(-4)==".xls";});

function parsetest(x, cfb) {
	describe(x + ' should have basic parts', function() {
		it('should find relative path', function() {
			if(!cfb.find('Workbook') && !cfb.find('Book')) throw new Error("Cannot find workbook for " + x);
		});
		it('should find absolute path', function() {
			if(!cfb.find('/Workbook') && !cfb.find('/Book')) throw new Error("Cannot find workbook for " + x);
		});
	});
}

describe('should parse test files', function() {
	files.forEach(function(x) {
		it('should parse ' + x, function() {
			var cfb = CFB.read('./test_files/' + x, {type: "file"});
			parsetest(x, cfb);
		});
	});
});
