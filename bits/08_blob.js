var Base64 = (function(){
	var map = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
	return {
		/* (will need this for writing) encode: function(input, utf8) {
			var o = "";
			var c1, c2, c3, e1, e2, e3, e4;
			for(var i = 0; i < input.length; ) {
				c1 = input.charCodeAt(i++);
				c2 = input.charCodeAt(i++);
				c3 = input.charCodeAt(i++);
				e1 = c1 >> 2;
				e2 = (c1 & 3) << 4 | c2 >> 4;
				e3 = (c2 & 15) << 2 | c3 >> 6;
				e4 = c3 & 63;
				if (isNaN(c2)) { e3 = e4 = 64; }
				else if (isNaN(c3)) { e4 = 64; }
				o += map.charAt(e1) + map.charAt(e2) + map.charAt(e3) + map.charAt(e4);
			}
			return o;
		},*/
		decode: function(input, utf8) {
			var o = "";
			var c1, c2, c3;
			var e1, e2, e3, e4;
			input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
			for(var i = 0; i < input.length;) {
				e1 = map.indexOf(input.charAt(i++));
				e2 = map.indexOf(input.charAt(i++));
				e3 = map.indexOf(input.charAt(i++));
				e4 = map.indexOf(input.charAt(i++));
				c1 = e1 << 2 | e2 >> 4;
				c2 = (e2 & 15) << 4 | e3 >> 2;
				c3 = (e3 & 3) << 6 | e4;
				o += String.fromCharCode(c1);
				if (e3 != 64) { o += String.fromCharCode(c2); }
				if (e4 != 64) { o += String.fromCharCode(c3); }
			}
			return o;
		}
	};
})();

function s2a(s) {
	if(typeof Buffer !== 'undefined') return new Buffer(s, "binary");
	var w = s.split("").map(function(x){ return x.charCodeAt(0) & 0xff; });
	return w;
}

var __toBuffer;
if(typeof Buffer !== "undefined") {
	Buffer.prototype.hexlify= function() { return this.toString('hex'); };
	Buffer.prototype.utf16le= function(s,e){return this.toString('utf16le',s,e).replace(/\u0000/,'').replace(/[\u0001-\u0006]/,'!');};
	Buffer.prototype.utf8 = function(s,e) { return this.toString('utf8',s,e); };
	__toBuffer = function(bufs) { return Buffer.concat(bufs[0]); };
} else {
	__toBuffer = function(bufs) {
		var x = [];
		for(var i = 0; i != bufs[0].length; ++i) { x = x.concat(bufs[0][i]); }
		return x;
	};
}

var __readUInt8 = function(b, idx) { return b.readUInt8 ? b.readUInt8(idx) : b[idx]; };
var __readUInt16LE = function(b, idx) { return b.readUInt16LE ? b.readUInt16LE(idx) : b[idx+1]*(1<<8)+b[idx]; };
var __readInt16LE = function(b, idx) { var u = __readUInt16LE(b,idx); if(!(u & 0x8000)) return u; return (0xffff - u + 1) * -1; };
var __readUInt32LE = function(b, idx) { return b.readUInt32LE ? b.readUInt32LE(idx) : b[idx+3]*(1<<24)+b[idx+2]*(1<<16)+b[idx+1]*(1<<8)+b[idx]; };
var __readInt32LE = function(b, idx) { if(b.readInt32LE) return b.readInt32LE(idx); var u = __readUInt32LE(b,idx); if(!(u & 0x80000000)) return u; return (0xffffffff - u + 1) * -1; };

var __hexlify = function(b) { return b.map(function(x){return (x<16?"0":"") + x.toString(16);}).join(""); };

var __utf16le = function(b,s,e) { if(b.utf16le) return b.utf16le(s,e); var ss=[]; for(var i=s; i<e; i+=2) ss.push(String.fromCharCode(__readUInt16LE(b,i))); return ss.join("").replace(/\u0000/,'').replace(/[\u0001-\u0006]/,'!'); };

var __utf8 = function(b,s,e) { if(b.utf8) return b.utf8(s,e); var ss=[]; for(var i=s; i<e; i++) ss.push(String.fromCharCode(__readUInt8(b,i))); return ss.join(""); };

function bconcat(bufs) { return (typeof Buffer !== 'undefined') ? Buffer.concat(bufs) : [].concat.apply([], bufs); }

/** Buffer helpers -- keep track of read location `.l` and move it */
function ReadShift(size, t) {
	var o, oo=[], w, vv; t = t || 'u';
	switch(size) {
		case 1: o = __readUInt8(this, this.l); break;
		case 2: o=(t==='u' ? __readUInt16LE : __readInt16LE)(this, this.l); break;
		case 4: o = __readUInt32LE(this, this.l); break;
		case 8:
		case 16: o = this.toString('hex', this.l,this.l+size); break;

		case 'utf8': size = t; o = __utf8(this, this.l, this.l + size); break;
		case 'utf16le': size=2*t; o = __utf16le(this, this.l, this.l + size); break;

		case 'cstr': size = 0; o = "";
			while((w=__readUInt8(this, this.l + size++))!==0) oo.push(String.fromCharCode(w));
			o = oo.join(""); break;
		case 'wstr': size = 0; o = "";
			while((w=__readUInt16LE(this,this.l +size))!==0){oo.push(String.fromCharCode(w));size+=2;}
			size+=2; break;
	}
	this.l+=size; return o;
}

function CheckField(hexstr, fld) {
	var b = this.slice(this.l, this.l+hexstr.length/2);
	var m = b.hexlify ? b.hexlify() : __hexlify(b);
	if(m !== hexstr) throw (fld||"") + 'Expected ' + hexstr + ' saw ' + m;
	this.l += hexstr.length/2;
}

function prep_blob(blob, pos) {
	blob.read_shift = ReadShift.bind(blob);
	blob.chk = CheckField;
	blob.l = pos || 0;
	var read = ReadShift.bind(blob), chk = CheckField.bind(blob);
	return [read, chk];
}

