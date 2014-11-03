/* vim: set ts=2: */
var CFB;
var fs = require('fs');
describe('source', function() { it('should load', function() { CFB = require('./'); }); });

var ex = [".xls",".doc",".ppt"];
if(process.env.FMTS) ex=process.env.FMTS.split(":").map(function(x){return x[0]==="."?x:"."+x;});
if(process.env.FMTS === "full") process.env.FMTS = ex.join(":");
if(process.env.FMTS) ex=process.env.FMTS.split(":").map(function(x){return x[0]==="."?x:"."+x;});

var ffunc = function(x){return (ex.indexOf(x.substr(-4))>=0 || ex.indexOf(x.substr(-3))>=0) && fails.indexOf(x) === -1;};
var fails = fs.existsSync('./fails.lst') ? fs.readFileSync('./fails.lst', 'utf-8').split("\n") : [];
var files = fs.readdirSync('test_files').filter(ffunc);
var f2011 = fs.readdirSync('test_files/2011').filter(ffunc);
var f2013 = fs.readdirSync('test_files/2013').filter(ffunc);
var fpres = fs.readdirSync('test_files_pres').filter(ffunc);

var dir = "./test_files/";

function parsetest(x, cfb) {
	describe(x + ' should have basic parts', function() {
		it('should find relative path', function() {
			switch(x.substr(-4)) {
				case '.xls': if(!cfb.find('Workbook') && !cfb.find('Book')) throw new Error("Cannot find workbook for " + x); break;
				case '.ppt': if(!cfb.find('PowerPoint Document')) throw new Error("Cannot find presentation for " + x); break;
				case '.doc': if(!cfb.find('WordDocument') && !cfb.find('Word Document')) throw new Error("Cannot find doc for " + x); break;
			}
		});
		it('should find absolute path', function() {
			switch(x.substr(-4)) {
				case '.xls': if(!cfb.find('/Workbook') && !cfb.find('/Book')) throw new Error("Cannot find workbook for " + x); break;
				case '.ppt': if(!cfb.find('/PowerPoint Document')) throw new Error("Cannot find presentation for " + x); break;
				case '.doc': if(!cfb.find('/WordDocument') && !cfb.find('/Word Document')) throw new Error("Cannot find doc for " + x); break;
			}
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
	fpres.forEach(function(x) {
		it('should parse ' + x, function() {
			var cfb = CFB.read('./test_files_pres/' + x, {type: "file"});
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
	it('should read buffers', function() {
		CFB.read(fs.readFileSync(dir + '/' + cp), {type: 'buffer'});
	});
});
