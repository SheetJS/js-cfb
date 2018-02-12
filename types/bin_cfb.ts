/* cfb.js (C) 2013-present  SheetJS -- http://sheetjs.com */
/* eslint-env node */
/* vim: set ts=2 ft=javascript: */
const n = "cfb";
import * as X from 'cfb';
import fs = require('fs');
import program = require('commander');
import PRINTJ = require("printj");
const sprintf = PRINTJ.sprintf;
program
	.version(X.version)
	.usage('[options] <file> [subfiles...]')
	.option('-q, --quiet', 'process but do not report')
	.option('-l, --list-files', 'list files')
	.option('-z, --dump', 'dump internal representation but do not extract')
	.option('-r, --repair', 'attempt to repair and garbage-collect archive')
	.option('-c, --create', 'create file')
	.option('-a, --append', 'add files to CFB (overwrite existing data)')
	.option('-d, --delete', 'delete files from CFB')
	.option('--dev', 'development mode')
	.option('--read', 'read but do not print out contents');

program.parse(process.argv);

const exit = process.exit;
const die = (errno: number, msg: string) => { console.error(n + ": " + msg); exit(errno); };
const logit = (cmd: string, f: string) => { console.error(sprintf("%-6s %s", cmd, f)); };

if(program.args.length === 0) die(1, "must specify a filename");

if(program.create) {
	logit("create", program.args[0]);
	const newcfb = X.utils.cfb_new();
	X.writeFile(newcfb, program.args[0]);
}

if(!fs.existsSync(program.args[0])) die(1, "must specify a filename");

const opts: X.CFB$ParsingOptions = {type:'file'};
if(program.dev) opts.WTF = true;

const cfb: X.CFB$Container = X.read(program.args[0], opts);
if(program.quiet) exit(0);

if(program.dump) {
	console.log("Full Paths:");
	console.log(cfb.FullPaths.map((x) => "  " + x).join("\n"));
	console.log("File Index:");
	console.log(cfb.FileIndex);
	exit(0);
}
if(program.repair) { X.writeFile(cfb, program.args[0]); exit(0); }

const fix_string = (x: string): string => x.replace(/[\u0000-\u001f]/, ($$) => sprintf("\\u%04X", $$.charCodeAt(0)));
const format_date = (date: Date): string => {
	return sprintf("%02u-%02u-%02u %02u:%02u", date.getUTCMonth()+1, date.getUTCDate(), date.getUTCFullYear()%100, date.getUTCHours(), date.getUTCMinutes());
};

if(program.listFiles) {
	let basetime = new Date(1980,0,1);
	let cnt = 0, rootsize = 0, filesize = 0;
	console.log("  Length     Date   Time    Name");
	console.log(" --------    ----   ----    ----");
	cfb.FileIndex.forEach((file: X.CFB$Entry, i: number) => {
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

	exit(0);
}

const mkdirp = (path: string) => { path.split("/").reduce((acc: string, p: string): string => {
	acc += p + "/";
	if(!fs.existsSync(acc)) { logit("mkdir", acc); fs.mkdirSync(acc); }
	return acc;
}, ""); };

const write = (path: string, data: X.CFB$Entry) => {
	logit("write", fix_string(path));
	fs.writeFileSync(path, /*::new Buffer((*/data.content/*:: :any))*/);
};

if(program.create || program.append) {
	program.args.slice(1).forEach((x: string) => {
		logit("append", x);
		X.utils.cfb_add(cfb, "/" + x, fs.readFileSync(x));
	});
	X.writeFile(cfb, program.args[0]);
	exit(0);
}

if(program.delete) {
	program.args.slice(1).forEach((x: string) => {
		logit("delete", x);
		X.utils.cfb_del(cfb, "/" + x);
	});
	X.writeFile(cfb, program.args[0]);
	exit(0);
}

if(program.args.length > 1) {
	program.args.slice(1).forEach((x: string) => {
		const data: X.CFB$Entry = X.find(cfb, x);
		if(!data) { console.error(x + ": file not found"); return; }
		if(data.type !== 2) { console.error(x + ": not a file"); return; }
		const idx = cfb.FileIndex.indexOf(data), path = cfb.FullPaths[idx];
		mkdirp(path.slice(0, path.lastIndexOf("/")));
		write(path, data);
	});
	exit(0);
}

for(let i=0; i!==cfb.FullPaths.length; ++i) {
	if(!cfb.FileIndex[i].name) continue;
	if(cfb.FullPaths[i].slice(-1) === "/") mkdirp(cfb.FullPaths[i]);
	else write(cfb.FullPaths[i], cfb.FileIndex[i]);
}
