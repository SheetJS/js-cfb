var has_buf = (typeof Buffer !== 'undefined' && typeof process !== 'undefined' && typeof process.versions !== 'undefined' && process.versions.node);

if(typeof Buffer !== 'undefined') {
	// $FlowIgnore
	if(!Buffer.from) Buffer.from = function(buf, enc) { return (enc) ? new Buffer(buf, enc) : new Buffer(buf); };
	// $FlowIgnore
	if(!Buffer.alloc) Buffer.alloc = function(n) { return new Buffer(n); };
}

function new_raw_buf(len/*:number*/) {
	/* jshint -W056 */
	return has_buf ? Buffer.alloc(len) : new Array(len);
	/* jshint +W056 */
}

var s2a = function s2a(s/*:string*/) {
	if(has_buf) return Buffer.from(s, "binary");
	return s.split("").map(function(x){ return x.charCodeAt(0) & 0xff; });
};

var chr0 = /\u0000/g, chr1 = /[\u0001-\u0006]/g;
