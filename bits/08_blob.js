var Base64 = (function(){
	var map = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
	return {
		decode: function(input/*:string*/)/*:string*/ {
			var o = "";
			var c1/*:number*/, c2/*:number*/, c3/*:number*/;
			var e1/*:number*/, e2/*:number*/, e3/*:number*/, e4/*:number*/;
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

var s2a = function _s2a(s/*:string*/)/*:RawBytes*/ { return s.split("").map(function(x){ return x.charCodeAt(0) & 0xff; }); };
var _s2a = s2a;
var __toBuffer = function(bufs/*:Array<Array<RawBytes> >*/)/*:RawBytes*/ { var x = []; for(var i = 0; i < bufs[0].length; ++i) { x.push.apply(x, bufs[0][i]); } return x; };
var ___toBuffer = __toBuffer;
var __utf16le = function(b/*:RawBytes|CFBlob*/,s/*:number*/,e/*:number*/)/*:string*/ { var ss/*:Array<string>*/=[]; for(var i=s; i<e; i+=2) ss.push(String.fromCharCode(__readUInt16LE(b,i))); return ss.join("").replace(chr0,'').replace(chr1,'!'); };
var ___utf16le = __utf16le;
var __hexlify = function(b/*:RawBytes|CFBlob*/,s/*:number*/,l/*:number*/)/*:string*/ { var ss/*:Array<string>*/=[]; for(var i=s; i<s+l; ++i) ss.push(("0" + b[i].toString(16)).slice(-2)); return ss.join(""); };
var ___hexlify = __hexlify;
var __bconcat = function(bufs/*:Array<RawBytes>*/)/*:RawBytes*/ {
	if(Array.isArray(bufs[0])/*:: && bufs[0] instanceof Array*/) return /*::(*/[].concat.apply([], bufs)/*:: :any)*/;
	var maxlen = 0, i = 0;
	for(i = 0; i < bufs.length; ++i) maxlen += bufs[i].length;
	var o = new Uint8Array(maxlen);
	for(i = 0, maxlen = 0; i < bufs.length; maxlen += bufs[i].length, ++i) o.set(bufs[i], maxlen);
	return o;
};
var bconcat = __bconcat;


if(typeof Buffer !== "undefined") {
	__utf16le = function(b/*:RawBytes|CFBlob*/,s/*:number*/,e/*:number*/)/*:string*/ {
		if(!Buffer.isBuffer(b)/*:: || !(b instanceof Buffer)*/) return ___utf16le(b,s,e);
		return b.toString('utf16le',s,e).replace(chr0,'').replace(chr1,'!');
	};
	__hexlify = function(b/*:RawBytes|CFBlob*/,s/*:number*/,l/*:number*/)/*:string*/ { return Buffer.isBuffer(b)/*:: && b instanceof Buffer*/ ? b.toString('hex',s,s+l) : ___hexlify(b,s,l); };
	__toBuffer = function(bufs/*:Array<Array<RawBytes>>*/)/*:RawBytes*/ { return (bufs[0].length > 0 && Buffer.isBuffer(bufs[0][0])) ? Buffer.concat((bufs[0]/*:any*/)) : ___toBuffer(bufs);};
	s2a = function(s/*:string*/)/*:RawBytes*/ { return new Buffer(s, "binary"); };
	bconcat = function(bufs/*:Array<RawBytes>*/)/*:RawBytes*/ { return Buffer.isBuffer(bufs[0]) ? Buffer.concat(/*::(*/bufs/*:: :any)*/) : __bconcat(bufs); };
}


var __readUInt8 = function(b/*:RawBytes|CFBlob*/, idx/*:number*/)/*:number*/ { return b[idx]; };
var __readUInt16LE = function(b/*:RawBytes|CFBlob*/, idx/*:number*/)/*:number*/ { return b[idx+1]*(1<<8)+b[idx]; };
var __readInt16LE = function(b/*:RawBytes|CFBlob*/, idx/*:number*/)/*:number*/ { var u = b[idx+1]*(1<<8)+b[idx]; return (u < 0x8000) ? u : (0xffff - u + 1) * -1; };
var __readUInt32LE = function(b/*:RawBytes|CFBlob*/, idx/*:number*/)/*:number*/ { return b[idx+3]*(1<<24)+(b[idx+2]<<16)+(b[idx+1]<<8)+b[idx]; };
var __readInt32LE = function(b/*:RawBytes|CFBlob*/, idx/*:number*/)/*:number*/ { return (b[idx+3]<<24)+(b[idx+2]<<16)+(b[idx+1]<<8)+b[idx]; };

function ReadShift(size/*:number*/, t/*:?string*/)/*:number|string*/ {
	var oI/*:: :number = 0*/, oS/*:: :string = ""*/, type = 0;
	switch(size) {
		case 1: oI = __readUInt8(this, this.l); break;
		case 2: oI = (t !== 'i' ? __readUInt16LE : __readInt16LE)(this, this.l); break;
		case 4: oI = __readInt32LE(this, this.l); break;
		case 16: type = 2; oS = __hexlify(this, this.l, size);
	}
	this.l+=size; if(type === 0) return oI; return oS;
}

function CheckField(hexstr/*:string*/, fld/*:string*/)/*:void*/ {
	var m = __hexlify(this,this.l,hexstr.length>>1);
	if(m !== hexstr) throw new Error(fld + 'Expected ' + hexstr + ' saw ' + m);
	this.l += hexstr.length>>1;
}

function prep_blob(blob/*:CFBlob*/, pos/*:number*/)/*:void*/ {
	blob.l = pos;
	blob.read_shift = /*::(*/ReadShift/*:: :any)*/;
	blob.chk = CheckField;
}

