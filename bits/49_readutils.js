var fs/*:: = require('fs'); */;
function readFileSync(filename/*:string*/, options/*:CFBReadOpts*/) {
	if(fs == null) fs = require('fs');
	return parse(fs.readFileSync(filename), options);
}

function readSync(blob/*:RawBytes|string*/, options/*:CFBReadOpts*/) {
	switch(options && options.type || "base64") {
		case "file": /*:: if(typeof blob !== 'string') throw "Must pass a filename when type='file'"; */return readFileSync(blob, options);
		case "base64": /*:: if(typeof blob !== 'string') throw "Must pass a base64-encoded binary string when type='file'"; */return parse(s2a(Base64.decode(blob)), options);
		case "binary": /*:: if(typeof blob !== 'string') throw "Must pass a binary string when type='file'"; */return parse(s2a(blob), options);
	}
	return parse(/*::typeof blob == 'string' ? new Buffer(blob, 'utf-8') : */blob, options);
}

