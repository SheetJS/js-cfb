/* cfb.js (C) 2013-present SheetJS -- http://sheetjs.com */
/* vim: set ts=2: */
/*jshint mocha:true */
/* eslint-env mocha */
/*global process, require */
/*::
declare type EmptyFunc = (() => void) | null;
declare type DescribeIt = { (desc:string, test:EmptyFunc):void; skip(desc:string, test:EmptyFunc):void; };
declare var describe : DescribeIt;
declare var it: DescribeIt;
declare var before:(test:EmptyFunc)=>void;
*/
var CFB;
var fs = require('fs');
describe('source', function() { it('should load', function() { CFB = require('./'); }); });
var CRC32 = require('crc-32');

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
var fxlsx = fs.readdirSync('test_files').filter(function(x) { return x.slice(-5) == ".xlsx"; });

var dir = "./test_files/";
var TYPE = "buffer";

var names = [
	["!DocumentSummaryInformation", "\u0005"],
	["!SummaryInformation", "\u0005"],
	["!CompObj", "\u0001"],
	["/!DataSpaces/Version", "\u0006"],
	["!DRMContent", "\u0009"],
	["!DRMViewerContent", "\u0009"],
	["!Ole", "\u0001"]
].map(function(x) { return [x[0], x[0].replace("!", x[1])]; });

function parsetest(x, cfb) {
	describe(x + ' should have basic parts', function() {
		it('should find relative path', function() {
			switch(x.substr(-4)) {
				case '.xls': if(!CFB.find(cfb, 'Workbook') && !CFB.find(cfb, 'Book')) throw new Error("Cannot find workbook for " + x); break;
				case '.ppt': if(!CFB.find(cfb, 'PowerPoint Document')) throw new Error("Cannot find presentation for " + x); break;
				case '.doc': if(!CFB.find(cfb, 'WordDocument') && !CFB.find(cfb, 'Word Document')) throw new Error("Cannot find doc for " + x); break;
				case 'xlsx': if(!CFB.find(cfb, 'Workbook') && !CFB.find(cfb, 'Book') && !CFB.find(cfb, 'WordDocument') && !CFB.find(cfb, 'EncryptedPackage') && !CFB.find(cfb, 'EncryptionInfo')) throw new Error("Cannot find workbook or encryption for " + x); break;
			}
		});
		it('should find absolute path', function() {
			switch(x.substr(-4)) {
				case '.xls': if(!CFB.find(cfb, '/Workbook') && !CFB.find(cfb, '/Book')) throw new Error("Cannot find workbook for " + x); break;
				case '.ppt': if(!CFB.find(cfb, '/PowerPoint Document')) throw new Error("Cannot find presentation for " + x); break;
				case '.doc': if(!CFB.find(cfb, '/WordDocument') && !CFB.find(cfb, '/Word Document')) throw new Error("Cannot find doc for " + x); break;
				case 'xlsx': if(!CFB.find(cfb, '/Workbook') && !CFB.find(cfb, '/Book') && !CFB.find(cfb, '/WordDocument') && !CFB.find(cfb, '/EncryptedPackage') && !CFB.find(cfb, '/EncryptionInfo')) throw new Error("Cannot find workbook or encryption for " + x); break;
			}
		});
		it('should handle "!" aliases', function() {
			names.forEach(function(n) { if(CFB.find(cfb,n[0]) != CFB.find(cfb,n[1])) throw new Error("Bad name: " + n.join(" != ")); });
		});
		it('should handle size < 0', function() {
			cfb.FileIndex.forEach(function(p, i) { if(p.size < 0) throw new Error(cfb.FullPaths[i] + " size=" + p.size); });
		});
	});
	describe(x + ' should roundtrip', function() {
		var data, newcfb;
		it('should roundtrip safely', function() {
			data = CFB.write(cfb, {type:TYPE});
			newcfb = CFB.read(data, {type:TYPE});
		});
		if(x.substr(-4) !== "xlsx") it('should preserve content', function() {
			var _old, _new;
			switch(x.substr(-4)) {
				case '.xls':
					_old = CFB.find(cfb, '/Workbook') || CFB.find(cfb, '/Book');
					_new = CFB.find(newcfb, '/Workbook') || CFB.find(newcfb, '/Book');
					break;
				case '.ppt':
					_old = CFB.find(cfb, '/PowerPoint Document');
					_new = CFB.find(newcfb, '/PowerPoint Document');
					break;
				case '.doc':
					_old = CFB.find(cfb, '/WordDocument') || CFB.find(cfb, '/Word Document');
					_new = CFB.find(newcfb, '/WordDocument') || CFB.find(newcfb, '/Word Document');
					break;
			}
			/*:: if(!_old || !_new) throw "unreachable"; */
			if(CRC32.buf(_old.content) != CRC32.buf(_new.content)) throw new Error(x + " failed roundtrip test");
		});
		it('should be idempotent', function() {
			var dat2 = CFB.write(newcfb, {type:TYPE});
			if(CRC32.buf(data) != CRC32.buf(dat2)) throw new Error(x + " failed idempotent test");
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
	fxlsx.forEach(function(x) {
		it('should parse ' + x, function() {
			try {
				var cfb = CFB.read('./test_files/' + x, {type: "file"});
				parsetest(x, cfb);
			} catch(e) {
				if(e.message.match(/CFB file size /)) return;
				if(!e.message.match(/Header Signature: Expected d0cf11e0a1b11ae1 saw /)) throw e;
			}
		});
	});
	it('should recognize correct magic number', function() {
		var cfb = CFB.read('./test_files/AutoFilter.xls', {type: "file"});
		if(!CFB.find(cfb, '!CompObj')) throw new Error("Could not find !CompObj");
		if(!CFB.find(cfb, '\u0001CompObj')) throw new Error("Could not find 1CompObj");
		if(CFB.find(cfb, '\u0005CompObj')) throw new Error("Found 5CompObj");

		if(!CFB.find(cfb, '!DocumentSummaryInformation')) throw new Error("Could not find !DSI");
		if(!CFB.find(cfb, '\u0005DocumentSummaryInformation')) throw new Error("Could not find 5DSI");
		if(CFB.find(cfb, '\u0001DocumentSummaryInformation')) throw new Error("Found 1DSI");
	});
});

var cp = 'custom_properties.xls';

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

describe('api', function() {
	it('should generate a file with custom root', function() {
		var cfb = CFB.utils.cfb_new({root:'SheetJS'});
		if(cfb.FileIndex[0].name != 'SheetJS') throw new Error("Bad root name");
		var newcfb = CFB.read(CFB.write(cfb, {type:'base64'}), {type:'base64'});
		if(newcfb.FileIndex[0].name != 'SheetJS') throw new Error("Bad root name");
	});
	it('should be able to delete a file', function() {
		var cfb = CFB.read(fs.readFileSync(dir + '/' + cp, 'binary'), {type: 'binary'});
		if(!CFB.find(cfb, '/Workbook')) throw new Error("Cannot find /Workbook");
		CFB.utils.cfb_del(cfb, '/Workbook');
		if(CFB.utils.cfb_del(cfb, '/Workbook')) throw new Error("Found /Workbook");
		if(CFB.find(cfb, '/Workbook')) throw new Error("Failed deleting /Workbook");
		var newcfb = CFB.read(CFB.write(cfb, {type:'binary'}), {type:'binary'});
		if(CFB.find(newcfb, '/Workbook')) throw new Error("Found /Workbook");
	});
	it('should be able to move a file', function() {
		var cfb = CFB.read(fs.readFileSync(dir + '/' + cp, 'binary'), {type: 'binary'});
		if(!CFB.find(cfb, '/Workbook')) throw new Error("Cannot find /Workbook");
		CFB.utils.cfb_mov(cfb, '/Workbook', '/Book');
		if(CFB.utils.cfb_mov(cfb, '/Workbook', '/Work')) throw new Error("Found /Workbook");
		if(CFB.find(cfb, '/Workbook')) throw new Error("Failed deleting /Workbook");
		var newcfb = CFB.read(CFB.write(cfb, {type:'binary'}), {type:'binary'});
		if(CFB.find(newcfb, '/Workbook')) throw new Error("Found /Workbook");
	});
	it('should be able to add a file', function() {
		var cfb = CFB.read(fs.readFileSync(dir + '/' + cp, 'binary'), {type: 'binary'});
		CFB.utils.cfb_add(cfb, '/dafuq', [1,2,3]);
		var newcfb = CFB.read(CFB.write(cfb, {type:'binary'}), {type:'binary'});
		var file = CFB.find(cfb, '/dafuq');
		if(!file || !file.content) throw new Error("Cannot find /dafuq");
		if(file.content.length != 3) throw new Error("Bad content length " + file.content.length);
		file = CFB.find(newcfb, '/dafuq');
		if(!file || !file.content) throw new Error("Cannot find /dafuq");
		if(file.content.length != 3) throw new Error("Bad content length " + file.content.length);
	});
});
