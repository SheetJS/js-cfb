/* vim: set ts=2: */
var CFB;
var fs = require('fs');
describe('source', function() { it('should load', function() { CFB = require('./'); }); });

var fails = fs.existsSync('./fails.lst') ? fs.readFileSync('./fails.lst', 'utf-8').split("\n") : [];
var files = fs.readdirSync('test_files').filter(function(x){return x.substr(-4)==".xls" && fails.indexOf(x) === -1;});
var f2011 = fs.readdirSync('test_files/2011').filter(function(x){return x.substr(-4)==".xls" && fails.indexOf(x) === -1;});
var f2013 = fs.readdirSync('test_files/2013').filter(function(x){return x.substr(-4)==".xls" && fails.indexOf(x) === -1;});

var dir = "./test_files/";

function parsetest(x, cfb) {
	describe(x + ' should have basic parts', function() {
		it('should find relative path', function() {
			if(!cfb.find('Workbook') && !cfb.find('Book')) throw new Error("Cannot find workbook for " + x);
		});
		it('should find absolute path', function() {
			if(!cfb.find('/Workbook') && !cfb.find('/Book')) throw new Error("Cannot find workbook for " + x);
		});
	});
	describe(x + ' should ', function() {
	});
}

describe('should parse test files', function() {
	files.forEach(function(x) {
		it('should parse ' + x, function() {
			var cfb = CFB.read('./test_files/' + x, {type: "file"});
			parsetest(x, cfb);
		});
	});
	f2011.forEach(function(x) {
		it('should parse ' + x, function() {
			var cfb = CFB.read('./test_files/2011/' + x, {type: "file"});
			parsetest(x, cfb);
		});
	});
	f2013.forEach(function(x) {
		it('should parse ' + x, function() {
			var cfb = CFB.read('./test_files/2013/' + x, {type: "file"});
			parsetest(x, cfb);
		});
	});
});

var cp = 'custom_properties.xls'

describe('input formats', function() {
	it('should read binary strings', function() {
		CFB.read(fs.readFileSync(dir + '/' + cp, 'binary'), {type: 'binary'});
	});
	it('should read base64 strings', function() {
		CFB.read(fs.readFileSync(dir + '/' + cp, 'base64'), {type: 'base64'});
	});
});
