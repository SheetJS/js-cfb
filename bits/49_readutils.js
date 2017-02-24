var fs;
function readFileSync(filename/*:string*/, options/*:any*/) {
	if(fs === undefined) fs = require('fs');
	return parse(fs.readFileSync(filename), options);
}

function readSync(blob/*:any*/, options/*:any*/) {
	switch(options !== undefined && options.type !== undefined ? options.type : "base64") {
		case "file": return readFileSync(blob, options);
		case "base64": return parse(s2a(Base64.decode(blob)), options);
		case "binary": return parse(s2a(blob), options);
	}
	return parse(blob);
}

