var Base64 = (function(){
	var map = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
	return {
		decode: function(input) {
			var o = "";
			var c1, c2, c3;
			var e1, e2, e3, e4;
			input = input.replace(/[^\w\+\/\=]/g, "");
			for(var i = 0; i < input.length;) {
				e1 = map.indexOf(input.charAt(i++));
				e2 = map.indexOf(input.charAt(i++));
				c1 = (e1 << 2) | (e2 >> 4);
				o += String.fromCharCode(c1);

				e3 = map.indexOf(input.charAt(i++));
				c2 = ((e2 & 15) << 4) | (e3 >> 2);
				if (e3 !== 64) { o += String.fromCharCode(c2); }

				e4 = map.indexOf(input.charAt(i++));
				c3 = ((e3 & 3) << 6) | e4;
				if (e4 !== 64) { o += String.fromCharCode(c3); }
			}
			return o;
		}
	};
})();

var chr0 = /\u0000/g, chr1 = /[\u0001-\u0006]/;

var s2a, _s2a;
s2a = _s2a = function _s2a(s/*:string*/) { return s.split("").map(function(x){ return x.charCodeAt(0) & 0xff; }); };
var __toBuffer, ___toBuffer;
__toBuffer = ___toBuffer = function(bufs/*:any*/) { var x = []; for(var i = 0; i < bufs[0].length; ++i) { x.push.apply(x, bufs[0][i]); } return x; };
var __utf16le, ___utf16le;
__utf16le = ___utf16le = function(b,s,e) { var ss=[]; for(var i=s; i<e; i+=2) ss.push(String.fromCharCode(__readUInt16LE(b,i))); return ss.join("").replace(chr0,'').replace(chr1,'!'); };
var __hexlify, ___hexlify;
__hexlify = ___hexlify = function(b,s,l) { return b.slice(s,(s+l)).map(function(x){return (x<16?"0":"") + x.toString(16);}).join(""); };
var bconcat = function(bufs/*:any*/) { return [].concat.apply([], bufs); };


if(typeof Buffer !== "undefined") {
	__utf16le = function(b,s,e) {
		if(!Buffer.isBuffer(b)) return ___utf16le(b,s,e);
		return b.toString('utf16le',s,e).replace(chr0,'').replace(chr1,'!');
	};
	__hexlify = function(b,s,l) { return Buffer.isBuffer(b) ? b.toString('hex',s,s+l) : ___hexlify(b,s,l); };
	__toBuffer = function(bufs/*:any*/) { return (bufs[0].length > 0 && Buffer.isBuffer(bufs[0][0])) ? Buffer.concat(bufs[0]) : ___toBuffer(bufs);};
	s2a = function(s/*:string*/) { return new Buffer(s, "binary"); };
	bconcat = function(bufs/*:any*/) { return Buffer.isBuffer(bufs[0]) ? Buffer.concat(bufs) : [].concat.apply([], bufs); };
}


var __readUInt8 = function(b, idx) { return b[idx]; };
var __readUInt16LE = function(b, idx) { return b[idx+1]*(1<<8)+b[idx]; };
var __readInt16LE = function(b, idx) { var u = b[idx+1]*(1<<8)+b[idx]; return (u < 0x8000) ? u : (0xffff - u + 1) * -1; };
var __readUInt32LE = function(b, idx) { return b[idx+3]*(1<<24)+(b[idx+2]<<16)+(b[idx+1]<<8)+b[idx]; };
var __readInt32LE = function(b, idx) { return (b[idx+3]<<24)+(b[idx+2]<<16)+(b[idx+1]<<8)+b[idx]; };

function ReadShift(size/*:number*/, t/*:?any*/) {
	var oI, oS, type = 0;
	switch(size) {
		case 1: oI = __readUInt8(this, this.l); break;
		case 2: oI = (t !== 'i' ? __readUInt16LE : __readInt16LE)(this, this.l); break;
		case 4: oI = __readInt32LE(this, this.l); break;
		case 16: type = 2; oS = __hexlify(this, this.l, size);
	}
	this.l+=size; if(type === 0) return oI; return oS;
}

function CheckField(hexstr/*:string*/, fld/*:string*/) {
	var m = __hexlify(this,this.l,hexstr.length>>1);
	if(m !== hexstr) throw fld + 'Expected ' + hexstr + ' saw ' + m;
	this.l += hexstr.length>>1;
}

function prep_blob(blob/*:any*/, pos/*:number*/) {
	blob.l = pos;
	blob.read_shift = ReadShift;
	blob.chk = CheckField;
}

