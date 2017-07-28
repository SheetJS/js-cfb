/* vim: set ts=2: */
import * as CFB from 'cfb';
import fs = require('fs');
import program = require('commander');
program
	.version(CFB.version)
	.usage('[options] <file>')
	.option('-q, --quiet', 'process but do not report')
	.option('-d, --dump', 'dump internal representation but do not extract')
	.parse(process.argv);

if(program.args.length === 0 || !fs.existsSync(program.args[0])) {
	console.error("Usage: " + process.argv[1] + " [-q] <cfb_file>");
	process.exit(1);
}

const opts: CFB.CFBParsingOptions = {type:'file'};

const cfb: CFB.CFBContainer = CFB.read(program.args[0], opts);

if(program.dump) {
	console.log("Full Paths:");
	console.log(cfb.FullPaths.map((x) => "  " + x).join("\n"));
	console.log("Full Path Directory:");
	console.log(cfb.FullPathDir);
}
if(!program.quiet && !program.dump) for(let i=0; i!==cfb.FullPaths.length; ++i) {
	if(cfb.FullPaths[i].slice(-1) === "/") {
		console.error("mkdir " + cfb.FullPaths[i]);
		fs.mkdirSync(cfb.FullPaths[i]);
	} else {
		console.error("writing " + cfb.FullPaths[i]);
		fs.writeFileSync(cfb.FullPaths[i], cfb.FileIndex[i].content);
	}
}
