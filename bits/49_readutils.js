
function readFileSync(filename) {
	var fs = require('fs');
	var file = fs.readFileSync(filename);
	return parse(file);
}

function readSync(blob, options) {
	var o = options || {};
	switch((o.type || "base64")) {
		case "file": return readFileSync(blob);
		case "base64": blob = Base64.decode(blob);
		/* falls through */
		case "binary": blob = s2a(blob); break;
	}
	return parse(blob);
}

