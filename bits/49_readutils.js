var fs;
function readFileSync(filename) {
	if(fs === undefined) fs = require('fs');
	return parse(fs.readFileSync(filename));
}

function readSync(blob, options) {
	switch(options !== undefined && options.type !== undefined ? options.type : "base64") {
		case "file": return readFileSync(blob);
		case "base64": return parse(s2a(Base64.decode(blob)));
		case "binary": return parse(s2a(blob));
	}
	return parse(blob);
}

