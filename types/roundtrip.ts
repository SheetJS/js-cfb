/* cfb.js (C) 2013-present SheetJS -- http://sheetjs.com */
import CFB = require("cfb");
import { buf } from 'crc-32';
import { sprintf } from 'printj';
import { writeFileSync } from 'fs';

const F = process.argv[2] || 	"test_files/BlankSheetTypes.xls";

const dumpit = process.env.WTF ? console.log : (msg: string) => {};

/* read file */
const cfb1 = CFB.read(F, {type:"file"});
dumpit(cfb1.FullPaths);

/* write to t1.xls */
const out1 = CFB.write(cfb1, {});
writeFileSync("t1.xls", out1);

/* read from memory */
const cfb2 = CFB.read(out1, {type:"buffer"});
dumpit(cfb2.FullPaths);

/* compare subfile contents */
[
	'/Workbook',
	'/!SummaryInformation',
	'/!DocumentSummaryInformation',
	'/MBD01519A90/\u0001Ole',
	'/MBD01519A90/\u0001CompObj',
	'/MBD01519A90/\u0001Ole10Native',
	'/MBD01519A90/\u0001Ole10ItemName',
	'/_VBA_PROJECT_CUR/VBA/ThisWorkbook'
].forEach(path => {
	if(!CFB.find(cfb1, path)) return;
	const d1 = CFB.find(cfb1, path).content, c1 = buf(d1);
	const d2 = CFB.find(cfb2, path).content, c2 = buf(d2);
	if(c1 === c2) return;
	console.log(path); console.log(d1); console.log(d2);
	throw sprintf("%s mismatch: %08X != %08X", path, c1, c2);
});

const out2 = CFB.write(cfb2, {});
const cc1 = buf(out1), cc2 = buf(out2);
if(cc1 !== cc2) throw sprintf("idempotent fail: %08X != %08X", cc1, cc2);
dumpit(sprintf("%08X %08X", cc1, cc2));

/* roundtrip through buffer, binary, and base64 types */
const cfb_1 = CFB.read(out2, {type:"buffer"});
const out_1 = CFB.write(cfb_1, {type:"binary"});
dumpit(out_1.substr(0,100));
const cfb_2 = CFB.read(out_1, {type:"binary"});
const out_2 = CFB.write(cfb_1, {type:"base64"});
dumpit(out_2.substr(0,100));
const cfb_3 = CFB.read(out_2, {type:"base64"});

/* save to file and re-read */
CFB.writeFile(cfb_3, "t2.xls");
const old_cfb = CFB.read("t2.xls", {type:"file"});

/* manually build a new file with the old-style "R" root entry */
const new_cfb = CFB.utils.cfb_new({root:"R", clsid: old_cfb.FileIndex[0].clsid });
old_cfb.FullPaths.forEach((p, i) => {
	if(p.slice(-1) === "/") return;
	CFB.utils.cfb_add(new_cfb, p.replace(/^[^/]*/,"R"), old_cfb.FileIndex[i].content);
});
dumpit(new_cfb);
CFB.writeFile(new_cfb, "t3.xls");
