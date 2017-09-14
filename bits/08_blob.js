var __toBuffer = function(bufs/*:Array<Array<RawBytes> >*/)/*:RawBytes*/ { var x = []; for(var i = 0; i < bufs[0].length; ++i) { x.push.apply(x, bufs[0][i]); } return x; };
var ___toBuffer = __toBuffer;
var __utf16le = function(b/*:RawBytes|CFBlob*/,s/*:number*/,e/*:number*/)/*:string*/ { var ss/*:Array<string>*/=[]; for(var i=s; i<e; i+=2) ss.push(String.fromCharCode(__readUInt16LE(b,i))); return ss.join("").replace(chr0,''); };
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


if(has_buf/*:: && typeof Buffer !== 'undefined'*/) {
	__utf16le = function(b/*:RawBytes|CFBlob*/,s/*:number*/,e/*:number*/)/*:string*/ {
		if(!Buffer.isBuffer(b)/*:: || !(b instanceof Buffer)*/) return ___utf16le(b,s,e);
		return b.toString('utf16le',s,e).replace(chr0,'')/*.replace(chr1,'!')*/;
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
	this.l += size; if(type === 0) return oI; return oS;
}

var __writeUInt32LE = function(b/*:RawBytes|CFBlob*/, val/*:number*/, idx/*:number*/)/*:void*/ { b[idx] = (val & 0xFF); b[idx+1] = ((val >>> 8) & 0xFF); b[idx+2] = ((val >>> 16) & 0xFF); b[idx+3] = ((val >>> 24) & 0xFF); };
var __writeInt32LE  = function(b/*:RawBytes|CFBlob*/, val/*:number*/, idx/*:number*/)/*:void*/ { b[idx] = (val & 0xFF); b[idx+1] = ((val >> 8) & 0xFF); b[idx+2] = ((val >> 16) & 0xFF); b[idx+3] = ((val >> 24) & 0xFF); };

function WriteShift(t/*:number*/, val/*:string|number*/, f/*:?string*/)/*:any*/ {
	var size = 0, i = 0;
	switch(f) {
		case "hex": for(; i < t; ++i) {
			/*:: if(typeof val !== "string") throw new Error("unreachable"); */
			this[this.l++] = parseInt(val.slice(2*i, 2*i+2), 16)||0;
		} return this;
		case "utf16le":
			/*:: if(typeof val !== "string") throw new Error("unreachable"); */
			var end/*:number*/ = this.l + t;
			for(i = 0; i < Math.min(val.length, t); ++i) {
				var cc = val.charCodeAt(i);
				this[this.l++] = cc & 0xff;
				this[this.l++] = cc >> 8;
			}
			while(this.l < end) this[this.l++] = 0;
			return this;
	}
	/*:: if(typeof val !== "number") throw new Error("unreachable"); */
	switch(t) {
		case  1: size = 1; this[this.l] = val&0xFF; break;
		case  2: size = 2; this[this.l] = val&0xFF; val >>>= 8; this[this.l+1] = val&0xFF; break;
		case  4: size = 4; __writeUInt32LE(this, val, this.l); break;
		case -4: size = 4; __writeInt32LE(this, val, this.l); break;
	}
	this.l += size; return this;
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
	blob.write_shift = WriteShift;
}

function new_buf(sz/*:number*/)/*:any*/ {
	var o/*:CFBlob*/ = (new_raw_buf(sz)/*:any*/);
	prep_blob(o, 0);
	return o;
}

