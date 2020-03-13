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
describe('source', function() { it('should load', function() { CFB = require('./'); if(zlibify) CFB.utils.use_zlib(require("zlib")); }); });
var CRC32 = require('crc-32');

var WTF = !!process.env.WTF;
var zlibify = !!process.env.ZLIB;
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
var fxlsx = fs.readdirSync('test_files').filter(function(x) { return x.slice(-5) == ".xlsx" && fails.indexOf(x) === -1; });

var dir = "./test_files/";
var TYPE = "buffer";

var names/*:Array<Array<string>>*/ = [
	["!DocumentSummaryInformation", "\u0005"],
	["!SummaryInformation", "\u0005"],
	["!CompObj", "\u0001"],
	["/!DataSpaces/Version", "\u0006"],
	["!DRMContent", "\u0009"],
	["!DRMViewerContent", "\u0009"],
	["!Ole", "\u0001"]
].map(function(x) { return [x[0], x[0].replace("!", x[1])]; });

/* [ rel, abs ] */
var ENTRIES/*:Array<Array<string>>*/ = [
	/* DOC */
	["WordDocument", "/WordDocument"],
	/* PPT */
	["PowerPoint Document", "/PowerPoint Document"],
	/* XLS */
	["Workbook", "/Workbook"],
	["Book", "/Book"],
	/* OPC */
	["[Content_Types].xml", "/[Content_Types].xml"],
	/* ODF */
	["content.xml", "/content.xml"],
	/* XLSX */
	["workbook.xml", "/xl/workbook.xml"],
	/* Encrypted */
	["EncryptedPackage", "/EncryptedPackage"],
	["EncryptionInfo", "/EncryptionInfo"]
];

var REL_FILES = ENTRIES.map(function(e) { return e[0]; });
var ABS_FILES = ENTRIES.map(function(e) { return e[1]; });

function has_file(cfb, files/*:Array<string>*/)/*:string*/ {
	for(var i = 0; i < files.length; ++i) if(CFB.find(cfb, files[i])) return files[i];
	return "";
}

function zero_dates(cfb) {
	cfb.FileIndex.forEach(function(f) { delete f.mt; delete f.ct; });
}

function parsetest(x, cfb) {
	describe(x + ' should have basic parts', function() {
		it('should find relative path', function() {
			if(!has_file(cfb, REL_FILES)) throw new Error("Cannot find content for " + x);
		});
		it('should find absolute path', function() {
			if(!has_file(cfb, ABS_FILES)) throw new Error("Cannot find content for " + x);
		});
		it('should handle "!" aliases', function() {
			names.forEach(function(n) { if(CFB.find(cfb,n[0]) != CFB.find(cfb,n[1])) throw new Error("Bad name: " + n.join(" != ")); });
		});
		it('should handle size < 0', function() {
			cfb.FileIndex.forEach(function(p, i) { if(p.size < 0) throw new Error(cfb.FullPaths[i] + " size=" + p.size); });
		});
	});
	describe(x + ' should roundtrip', function() {
		var datacfb, newcfb;
		var datazip, newzip;
		var datacmp, newcmp;
		before(function() {
			/* cfb */
			zero_dates(cfb);
			datacfb = CFB.write(cfb, {type:TYPE});
			newcfb = CFB.read(datacfb, {type:TYPE});
			zero_dates(newcfb);

			/* zip */
			zero_dates(cfb);
			datazip = CFB.write(cfb, {type:TYPE, fileType:"zip"});
			newzip = CFB.read(datazip, {type:TYPE});
			zero_dates(newzip);

			/* zip with compression */
			zero_dates(cfb);
			datacmp = CFB.write(cfb, {type:TYPE, fileType:"zip", compression:1});
			newcmp = CFB.read(datacmp, {type:TYPE});
			zero_dates(newcmp);
		});
		it('should preserve content', function() {
			var path = has_file(cfb, REL_FILES);
			var _old = CFB.find(cfb, path);
			var _cfb = CFB.find(newcfb, path);
			var _zip = CFB.find(newzip, path);
			var _cmp = CFB.find(newcmp, path);
			/*:: if(!_old || !_cfb || !_zip || !_cmp) throw "unreachable"; */
			var c1 = CRC32.buf(_old.content);
			var c2 = CRC32.buf(_cfb.content);
			var c3 = CRC32.buf(_zip.content);
			var c4 = CRC32.buf(_cmp.content);
			if(c1 != c2) throw new Error(x + " failed CFB roundtrip test");
			if(c1 != c3) throw new Error(x + " failed ZIP roundtrip test");
			if(c1 != c4) throw new Error(x + " failed ZIP compression roundtrip test");
		});
		it('should be idempotent', function() {
			var dat2 = CFB.write(newcfb, {type:TYPE});
			if(CRC32.buf(datacfb) != CRC32.buf(dat2)) throw new Error(x + " failed CFB idempotent test");
			var dat2zip = CFB.write(newzip, {type:TYPE, fileType:"zip"});
			if(CRC32.buf(datazip) != CRC32.buf(dat2zip)) throw new Error(x + " failed ZIP idempotent test");
			var dat2cmp = CFB.write(newcmp, {type:TYPE, fileType:"zip", compression:1});
			if(CRC32.buf(datacmp) != CRC32.buf(dat2cmp)) throw new Error(x + " failed ZIP idempotent test");
		});
	});
}

describe('should parse test files', function() {
	files.forEach(function(x) {
		it('should parse ' + x, function() {
			var cfb = CFB.read('./test_files/' + x, {type: "file", WTF: WTF});
			parsetest(x, cfb);
		});
	});
	fpres.forEach(function(x) {
		it('should parse ' + x, function() {
			var cfb = CFB.read('./test_files_pres/' + x, {type: "file", WTF: WTF});
			parsetest(x, cfb);
		});
	});
	f2011.forEach(function(x) {
		it('should parse ' + x, function() {
			var cfb = CFB.read('./test_files/2011/' + x, {type: "file", WTF: WTF});
			parsetest(x, cfb);
		});
	});
	f2013.forEach(function(x) {
		it('should parse ' + x, function() {
			var cfb = CFB.read('./test_files/2013/' + x, {type: "file", WTF: WTF});
			parsetest(x, cfb);
		});
	});
	fxlsx.forEach(function(x) {
		it('should parse ' + x, function() {
			try {
				var cfb = CFB.read('./test_files/' + x, {type: "file", WTF: WTF});
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
var xl = 'custom_properties.xlsx';
describe('input formats', function() {
	it('should read binary strings', function() {
		CFB.read(fs.readFileSync(dir + '/' + cp, 'binary'), {type: 'binary'});
		CFB.read(fs.readFileSync(dir + '/' + xl, 'binary'), {type: 'binary'});
	});
	it('should read base64 strings', function() {
		CFB.read(fs.readFileSync(dir + '/' + cp, 'base64'), {type: 'base64'});
		CFB.read(fs.readFileSync(dir + '/' + xl, 'base64'), {type: 'base64'});
	});
	it('should read buffers', function() {
		CFB.read(fs.readFileSync(dir + '/' + cp), {type: 'buffer'});
		CFB.read(fs.readFileSync(dir + '/' + xl), {type: 'buffer'});
	});
});
describe('output formats', function() {
	it('should write binary strings', function() {
		var t = [
			[ "CFB", CFB.write(CFB.read(fs.readFileSync(dir + '/' + cp, 'binary'), {type: 'binary'}), {type: 'binary'})],
			[ "ZIP", CFB.write(CFB.read(fs.readFileSync(dir + '/' + xl, 'binary'), {type: 'binary'}), {type: 'binary', fileType: 'zip'})]
		];
		t.forEach(function(r) {
			if(typeof r[1] != "string") throw new Error(r[0] + " binary write failed");
			var good = false;
			for(var i = 0; i < r[1].length; ++i) {
				if(/*::((*/r[1]/*:: :any):string)*/.charCodeAt(i) == 0x00) good = true;
				else if(/*::((*/r[1]/*:: :any):string)*/.charCodeAt(i) > 0xFF) { good = false; break; }
			}
			if(!good) throw new Error(r[0] + " binary write failed");
		});
	});
	it('should write base64 strings', function() {
		var t = [
			[ "CFB", CFB.write(CFB.read(fs.readFileSync(dir + '/' + cp, 'base64'), {type: 'base64'}), {type: 'base64'})],
			[ "ZIP", CFB.write(CFB.read(fs.readFileSync(dir + '/' + xl, 'base64'), {type: 'base64'}), {type: 'base64', fileType: 'zip'})]
		];
		t.forEach(function(r) {
			if(typeof r[1] != "string") throw new Error(r[0] + " base64 write failed");
			var good = false;
			if(r[1].match(/[^a-zA-Z0-9+\/\+\.=]/)) throw new Error(r[0] + " base64 write failed");
		});
	});
	it('should write buffers', function() {
		var t1 = CFB.write(CFB.read(fs.readFileSync(dir + '/' + cp), {type: 'buffer'}), {type: 'buffer'});
		var t2 = CFB.write(CFB.read(fs.readFileSync(dir + '/' + xl), {type: 'buffer'}), {type: 'buffer'});
		if(!Buffer.isBuffer(t1)) throw new Error("CFB buffer write failed");
		if(!Buffer.isBuffer(t2)) throw new Error("ZIP buffer write failed");
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
