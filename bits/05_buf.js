var has_buf = /*#__PURE__*/(function() { return typeof Buffer !== 'undefined' && typeof process !== 'undefined' && typeof process.versions !== 'undefined' && !!process.versions.node; })();

var Buffer_from = /*#__PURE__*/(function() {
	if(typeof Buffer !== 'undefined') {
		var nbfs = !Buffer.from;
		if(!nbfs) try { Buffer.from("foo", "utf8"); } catch(e) { nbfs = true; }
		return nbfs ? function(buf, enc) { return (enc) ? new Buffer(buf, enc) : new Buffer(buf); } : Buffer.from.bind(Buffer);
	}
	return function() {};
})();


function new_raw_buf(len/*:number*/) {
	/* jshint -W056 */
	if(has_buf) {
		if(Buffer.alloc) return Buffer.alloc(len);
		var b = new Buffer(len); b.fill(0); return b;
	}
	return typeof Uint8Array != "undefined" ? new Uint8Array(len) : new Array(len);
	/* jshint +W056 */
}

function new_unsafe_buf(len/*:number*/) {
	/* jshint -W056 */
	if(has_buf) return Buffer.allocUnsafe ? Buffer.allocUnsafe(len) : new Buffer(len);
	return typeof Uint8Array != "undefined" ? new Uint8Array(len) : new Array(len);
	/* jshint +W056 */
}

var s2a = function s2a(s/*:string*/)/*:RawBytes*/ {
	if(has_buf) return Buffer_from(s, "binary");
	return s.split("").map(function(x/*:string*/)/*:number*/{ return x.charCodeAt(0) & 0xff; });
};

var chr0 = /\u0000/g, chr1 = /[\u0001-\u0006]/g;
