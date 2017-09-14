/* cfb.js (C) 2013-present  SheetJS -- http://sheetjs.com */
/* eslint-env node */
/* vim: set ts=2 ft=javascript: */
import * as X from 'cfb';
import fs = require('fs');
import program = require('commander');
import PRINTJ = require("printj");
program
	.version(X.version)
	.usage('[options] <file>')
	.option('-q, --quiet', 'process but do not report')
	.option('-l, --list-files', 'list files')
	.option('-d, --dump', 'dump internal representation but do not extract')
	.option('-r, --repair', 'attempt to repair and garbage-collect archive')
	.option('--dev', 'development mode')
	.option('--read', 'read but do not print out contents');

program.parse(process.argv);

if(program.args.length === 0 || !fs.existsSync(program.args[0])) {
	console.error("Usage: " + process.argv[1] + " [-q] <cfb_file>");
	process.exit(1);
}

const opts: X.CFBParsingOptions = {type:'file'};
if(program.dev) opts.WTF = true;

const cfb: X.CFBContainer = X.read(program.args[0], opts);
if(program.quiet) process.exit(0);

if(program.dump) {
	console.log("Full Paths:");
	console.log(cfb.FullPaths.map((x) => "  " + x).join("\n"));
	console.log("Full Path Directory:");
	console.log(cfb.FullPathDir);
	process.exit(0);
}
if(program.repair) {
	X.writeFile(cfb, program.args[0]);
	process.exit(0);
}

const sprintf = PRINTJ.sprintf;
function fix_string(x: string): string { return x.replace(/[\u0000-\u001f]/, function($$) { return sprintf("\\u%04X", $$.charCodeAt(0)); }); }
if(program.listFiles) {
	const format_date = function(date: Date): string {
		return sprintf("%02u-%02u-%02u %02u:%02u", date.getUTCMonth()+1, date.getUTCDate(), date.getUTCFullYear()%100, date.getUTCHours(), date.getUTCMinutes());
	};

	let basetime = new Date(1980,0,1);
	let cnt = 0, rootsize = 0, filesize = 0;
	console.log("  Length     Date   Time    Name");
	console.log(" --------    ----   ----    ----");
	cfb.FileIndex.forEach(function(file: X.CFBEntry, i: number) {
		switch(file.type) {
			case 5:
				basetime = file.ct || file.mt || basetime;
				rootsize = file.size;
				break;
			case 2:
				console.log(sprintf("%9lu  %s   %s", file.size, format_date(basetime), fix_string(cfb.FullPaths[i])));
				filesize += file.size;
				++cnt;
		}
	});
	console.log(" --------                   -------");
	console.log(sprintf("%9lu                   %lu file%s", rootsize || filesize, cnt, (cnt !== 1 ? "s" : "")));

	process.exit(0);
}
for(let i=0; i!==cfb.FullPaths.length; ++i) {
	if(cfb.FullPaths[i].slice(-1) === "/") {
		console.error("mkdir " + fix_string(cfb.FullPaths[i]));
		fs.mkdirSync(cfb.FullPaths[i]);
	} else {
		console.error("write " + fix_string(cfb.FullPaths[i]));
		fs.writeFileSync(cfb.FullPaths[i], cfb.FileIndex[i].content);
	}
}
