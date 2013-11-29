/* cfb.js (C) 2013 SheetJS -- http://sheetjs.com */
/* vim: set ts=2: */
/*jshint eqnull:true */

/** Helper Functions */
function readIEEE754(buf, idx, isLE, nl, ml) {
	if(isLE === undefined) isLE = true;
	if(!nl) nl = 8;
	if(!ml && nl === 8) ml = 52;
	var e, m, el = nl * 8 - ml - 1, eMax = (1 << el) - 1, eBias = eMax >> 1;
	var bits = -7, d = isLE ? -1 : 1, i = isLE ? (nl - 1) : 0, s = buf[idx + i];

	i += d;
	e = s & ((1 << (-bits)) - 1); s >>>= (-bits); bits += el;
	for (; bits > 0; e = e * 256 + buf[idx + i], i += d, bits -= 8);
	m = e & ((1 << (-bits)) - 1); e >>>= (-bits); bits += ml;
	for (; bits > 0; m = m * 256 + buf[idx + i], i += d, bits -= 8);
	if (e === eMax) return m ? NaN : ((s ? -1 : 1) * Infinity);
	else if (e === 0) e = 1 - eBias;
	else { m = m + Math.pow(2, ml); e = e - eBias; }
	return (s ? -1 : 1) * m * Math.pow(2, e - ml);
}

var Base64 = (function(){
	var map = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
	return {
		encode: function(input, utf8) {
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
		},
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

if(typeof Buffer !== "undefined") {
	Buffer.prototype.hexlify= function() { return this.toString('hex'); };
	Buffer.prototype.utf16le= function(s,e){return this.toString('utf16le',s,e).replace(/\u0000/,'').replace(/[\u0001-\u0006]/,'!');};
	Buffer.prototype.utf8 = function(s,e) { return this.toString('utf8',s,e); };
}

Array.prototype.readUInt8 = function(idx) { return this[idx]; };
Array.prototype.readUInt16LE = function(idx) { return this[idx+1]*(1<<8)+this[idx]; };
Array.prototype.readInt16LE = function(idx) { var u = this.readUInt16LE(idx); if(!(u & 0x8000)) return u; return (0xffff - u + 1) * -1; };
Array.prototype.readUInt32LE = function(idx) { return this[idx+3]*(1<<24)+this[idx+2]*(1<<16)+this[idx+1]*(1<<8)+this[idx]; };
Array.prototype.readDoubleLE = function(idx) { return readIEEE754(this, idx||0);};

Array.prototype.hexlify = function() { return this.map(function(x){return (x<16?"0":"") + x.toString(16);}).join(""); };

Array.prototype.utf16le = function(s,e) { var str = ""; for(var i=s; i<e; i+=2) str += String.fromCharCode(this.readUInt16LE(i)); return str.replace(/\u0000/,'').replace(/[\u0001-\u0006]/,'!'); };

Array.prototype.utf8 = function(s,e) { var str = ""; for(var i=s; i<e; i++) str += String.fromCharCode(this.readUInt8(i)); return str; };

function bconcat(bufs) { return (typeof Buffer !== 'undefined') ? Buffer.concat(bufs) : [].concat.apply([], bufs); }

/** Buffer helpers -- keep track of read location `.l` and move it */
function ReadShift(size, t) {
	var o, w, vv; t = t || 'u';
	if(size === 'ieee754') { size = 8; t = 'f'; }
	switch(size) {
		case 1: o = this.readUInt8(this.l); break;
		case 2: o=t==='u'?this.readUInt16LE(this.l):this.readInt16LE(this.l);break;
		case 4: o = this.readUInt32LE(this.l); break;
		case 8: if(t === 'f') { o = this.readDoubleLE(this.l); break; }
		/* falls through */
		case 16: o = this.toString('hex', this.l,this.l+size); break;

		case 'utf8': size = t; o = this.utf8(this.l, this.l + size); break;
		case 'utf16le': size = 2*t; o = this.utf16le(this.l, this.l + size); break;

		case 'cstr': size = 0; o = "";
			while((w=this.readUInt8(this.l + size++))!==0) o+= String.fromCharCode(w);
			break;
		case 'wstr': size = 0; o = "";
			while((w=this.readUInt16LE(this.l +size))!==0){o+= String.fromCharCode(w);size+=2;}
			size+=2; break;
	}
	this.l+=size; return o;
}

function CheckField(hexstr, fld) {
	var m = this.slice(this.l, this.l+hexstr.length/2).hexlify('hex');
	if(m !== hexstr) throw (fld||"") + 'Expected ' + hexstr + ' saw ' + m;
	this.l += hexstr.length/2;
}

function WarnField(hexstr, fld) {
	var m = this.slice(this.l, this.l+hexstr.length/2).hexlify('hex');
	if(m !== hexstr) console.error((fld||"") + 'Expected ' + hexstr +' saw ' + m);
	this.l += hexstr.length/2;
}

function prep_blob(blob, pos) {
	blob.read_shift = ReadShift.bind(blob);
	blob.chk = CheckField;
	blob.l = pos || 0;
	var read = ReadShift.bind(blob), chk = CheckField.bind(blob);
	return [read, chk];
}

/* [MS-CFB] v20130118 */
var CFB = (function(){
function parse(file) {


var mver = 3; // major version
var ssz = 512; // sector size
var mssz = 64; // mini sector size
var nds = 0; // number of directory sectors
var nfs = 0; // number of FAT sectors
var nmfs = 0; // number of mini FAT sectors
var ndfs = 0; // number of DIFAT sectors
var dir_start = 0; // first directory sector location
var minifat_start = 0; // first mini FAT sector location
var difat_start = 0; // first mini FAT sector location

var ms_cutoff_size = 4096; // mini stream cutoff size
var minifat_store = 0; // first sector with minifat data
var minifat_size = 0; // size of minifat data

var fat_addrs = []; // locations of FAT sectors

/* [MS-CFB] 2.2 Compound File Header */
var blob = file.slice(0,512);
prep_blob(blob);
var read = ReadShift.bind(blob), chk = CheckField.bind(blob);
//var wrn = WarnField.bind(blob);
var j = 0, q;

// header signature 8
chk(HEADER_SIGNATURE, 'Header Signature: ');

// clsid 16
chk(HEADER_CLSID, 'CLSID: ');

// minor version 2
//wrn(HEADER_MINOR_VERSION, 'Minor Version: ');
read(2);

// major version 3
mver = read(2);
switch(mver) {
	case 3: ssz = 512; break;
	case 4: ssz = 4096; break;
	default: throw "Major Version: Expected 3 or 4 saw " + mver;
}

// reprocess header
var pos = blob.l;
blob = file.slice(0,ssz);
prep_blob(blob,pos);
read = ReadShift.bind(blob);
chk = CheckField.bind(blob);
var header = file.slice(0,ssz);

// Byte Order TODO
chk('feff', 'Byte Order: ');

// Sector Shift
switch((q = read(2))) {
	case 0x09: if(mver !== 3) throw 'MajorVersion/SectorShift Mismatch'; break;
	case 0x0c: if(mver !== 4) throw 'MajorVersion/SectorShift Mismatch'; break;
	default: throw 'Sector Shift: Expected 9 or 12 saw ' + q;
}

// Mini Sector Shift
chk('0600', 'Mini Sector Shift: ');

// Reserved
chk('000000000000', 'Mini Sector Shift: ');

// Number of Directory Sectors
nds = read(4);
if(mver === 3 && nds !== 0) throw '# Directory Sectors: Expected 0 saw ' + nds;

// Number of FAT Sectors
nfs = read(4);

// First Directory Sector Location
dir_start = read(4);

// Transaction Signature TODO
read(4);

// Mini Stream Cutoff Size TODO
chk('00100000', 'Mini Stream Cutoff Size: ');

// First Mini FAT Sector Location
minifat_start = read(4);

// Number of Mini FAT Sectors
nmfs = read(4);

// First DIFAT sector location
difat_start = read(4);

// Number of DIFAT Sectors
ndfs = read(4);

// Grab FAT Sector Locations
for(j = 0; blob.l != 512; ) {
	if((q = read(4))>=MAXREGSECT) break;
	fat_addrs[j++] = q;
}


/** Break the file up into sectors */
var nsectors = Math.ceil((file.length - ssz)/ssz);
var sectors = [];
for(var i=1; i != nsectors; ++i) sectors[i-1] = file.slice(i*ssz,(i+1)*ssz);
sectors[nsectors-1] = file.slice(nsectors*ssz);

/** Chase down the rest of the DIFAT chain to build a comprehensive list
    DIFAT chains by storing the next sector number as the last 32 bytes */
function sleuth_fat(idx, cnt) {
	if(idx === ENDOFCHAIN) {
		if(cnt !== 0) throw "DIFAT chain shorter than expected";
		return;
	}
	if(idx !== FREESECT) {
		var sector = sectors[idx];
		for(var i = 0; i != ssz/4-1; ++i) {
			if((q = sector.readUInt32LE(i*4)) === ENDOFCHAIN) break;
			fat_addrs.push(q);
		}
		sleuth_fat(sector.readUInt32LE(ssz-4),cnt - 1);
	}
}
sleuth_fat(difat_start, ndfs);

/** DONT CAT THE FAT!  Just calculate where we need to go */
function get_buffer(byte_addr, bytes) {
	var addr = fat_addrs[Math.floor(byte_addr*4/ssz)];
	if(ssz - (byte_addr*4 % ssz) < (bytes || 0))
		throw "FAT boundary crossed: " + byte_addr + " "+bytes+" "+ssz;
	return sectors[addr].slice((byte_addr*4 % ssz));
}

function get_buffer_u32(byte_addr) {
	return get_buffer(byte_addr,4).readUInt32LE(0);
}

function get_next_sector(idx) { return get_buffer_u32(idx); }

/** Chains */
var chkd = new Array(sectors.length), sector_list = [];
var get_sector = function get_sector(k) { return sectors[k]; };
for(i=0; i != sectors.length; ++i) {
	var buf = [], k = (i + dir_start) % sectors.length;
	if(chkd[k]) continue;
	for(j=k; j<=MAXREGSECT; buf.push(j),j=get_next_sector(j)) chkd[j] = true;
	sector_list[k] = {nodes: buf};
	sector_list[k].data = Array(buf.map(get_sector)).toBuffer();
}
sector_list[dir_start].name = "!Directory";
if(nmfs > 0 && minifat_start !== ENDOFCHAIN) sector_list[minifat_start].name = "!MiniFAT";
sector_list[fat_addrs[0]].name = "!FAT";

/* [MS-CFB] 2.6.1 Compound File Directory Entry */
var files = {}, Paths = [], FileIndex = [], FullPaths = [], FullPathDir = {};
function read_directory(idx) {
	var blob, read, w;
	var sector = sector_list[idx].data;
	for(var i = 0; i != sector.length; i+= 128) {
		blob = sector.slice(i, i+128);
		prep_blob(blob, 64);
		read = ReadShift.bind(blob);
		var namelen = read(2);
		if(namelen === 0) return;
		var name = blob.utf16le(0,namelen-(Paths.length?2:0)); // OLE
		Paths.push(name);
		var o = { name: name };
		o.type = EntryTypes[read(1)];
		o.color = read(1);
		o.left = read(4); if(o.left === NOSTREAM) delete o.left;
		o.right = read(4); if(o.right === NOSTREAM) delete o.right;
		o.child = read(4); if(o.child === NOSTREAM) delete o.child;
		o.clsid = read(16);
		o.state = read(4);
		var ctime = read(8); if(ctime != "0000000000000000") o.ctime = ctime;
		var mtime = read(8); if(mtime != "0000000000000000") o.mtime = mtime;
		o.start = read(4);
		o.size = read(4);
		if(o.type === 'root') { //root entry
			minifat_store = o.start;
			if(nmfs > 0 && minifat_store !== ENDOFCHAIN) sector_list[minifat_store].name = "!StreamData";
			minifat_size = o.size;
		} else if(o.size >= ms_cutoff_size) {
			o.storage = 'fat';
			if(!sector_list[o.start] && dir_start > 0) o.start = (o.start + dir_start) % sectors.length;
			sector_list[o.start].name = o.name;
			o.content = sector_list[o.start].data.slice(0,o.size);
			prep_blob(o.content);
		} else {
			o.storage = 'minifat';
			w = o.start * mssz;
			if(minifat_store !== ENDOFCHAIN && o.start !== ENDOFCHAIN) {
				o.content = sector_list[minifat_store].data.slice(w,w+o.size);
				prep_blob(o.content);
			}
		}
		if(o.ctime) {
			var ct = blob.slice(blob.l-24, blob.l-16);
			var c2 = (ct.readUInt32LE(4)/1e7)*Math.pow(2,32)+ct.readUInt32LE(0)/1e7;
			o.ct = new Date((c2 - 11644473600)*1000);
		}
		if(o.mtime) {
			var mt = blob.slice(blob.l-16, blob.l-8);
			var m2 = (mt.readUInt32LE(4)/1e7)*Math.pow(2,32)+mt.readUInt32LE(0)/1e7;
			o.mt = new Date((m2 - 11644473600)*1000);
		}
		files[name] = o;
		FileIndex.push(o);
	}
}
read_directory(dir_start);

/* [MS-CFB] 2.6.4 Red-Black Tree */
function build_full_paths(Dir, pathobj, paths, patharr) {
	var i;
	var dad = new Array(patharr.length);

	var q = new Array(patharr.length);

	for(i=0; i != dad.length; ++i) { dad[i]=q[i]=i; paths[i]=patharr[i]; }

	for(i = q[0]; typeof i !== "undefined"; i = q.shift()) {
		if(Dir[i].child) dad[Dir[i].child] = i;
		if(Dir[i].left) { dad[Dir[i].left] = dad[i]; q.push(Dir[i].left); }
		if(Dir[i].right) { dad[Dir[i].right] = dad[i]; q.push(Dir[i].right); }
	}

	for(i=1; i !== paths.length; ++i) {
		if(Dir[i].type === "unknown") continue;
		var j = dad[i];
		if(j === 0) paths[i] = paths[0] + "/" + paths[i];
		else while(j !== 0) {
			paths[i] = paths[j] + "/" + paths[i];
			j = dad[j];
		}
		dad[i] = 0;
	}

	paths[0] += "/";
	for(i=1; i !== paths.length; ++i) if(Dir[i].type !== 'stream') paths[i] += "/";
	for(i=0; i !== paths.length; ++i) pathobj[paths[i]] = FileIndex[i];
}
build_full_paths(FileIndex, FullPathDir, FullPaths, Paths);

var root_name = Paths.shift();
Paths.root = root_name;

/* [MS-CFB] 2.6.4 (Unicode 3.0.1 case conversion) */
function find_path(path) {
	if(path[0] === "/") path = root_name + path;
	var UCNames = (path.indexOf("/") !== -1 ? FullPaths : Paths).map(function(x) { return x.toUpperCase(); });
	var UCPath = path.toUpperCase();
	var w = UCNames.indexOf(UCPath);
	if(w === -1) return null;
	return path.indexOf("/") !== -1 ? FileIndex[w] : files[Paths[w]];
}

var rval = {
	raw: {header: header, sectors: sectors},
	FileIndex: FileIndex,
	FullPaths: FullPaths,
	FullPathDir: FullPathDir,
	find: find_path
};

return rval;
} // parse


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

this.read = readSync;
this.parse = parse;
return this;
})();

/** CFB Constants */
{
	/* 2.1 Compund File Sector Numbers and Types */
	var MAXREGSECT = 0xFFFFFFFA;
	var DIFSECT = 0xFFFFFFFC;
	var FATSECT = 0xFFFFFFFD;
	var ENDOFCHAIN = 0xFFFFFFFE;
	var FREESECT = 0xFFFFFFFF;
	/* 2.2 Compound File Header */
	var HEADER_SIGNATURE = 'd0cf11e0a1b11ae1';
	var HEADER_MINOR_VERSION = '3e00';
	var MAXREGSID = 0xFFFFFFFA;
	var NOSTREAM = 0xFFFFFFFF;
	var HEADER_CLSID = '00000000000000000000000000000000';
	/* 2.6.1 Compound File Directory Entry */
	var EntryTypes = ['unknown','storage','stream','lockbytes','property','root'];
}

var CFB_utils = {
	ReadShift: ReadShift,
	WarnField: WarnField,
	CheckField: CheckField,
	prep_blob: prep_blob,
	bconcat: bconcat
};

if(typeof require !== 'undefined' && typeof exports !== 'undefined') {
	Array.prototype.toBuffer = function() {
		return Buffer.concat(this[0]);
	};
	var fs = require('fs');
	exports.read = CFB.read;
	exports.parse = CFB.parse;
	exports.utils = CFB_utils;
	exports.main = function(args) {
		var cfb = CFB.read(args[0], {type:'file'});
		console.log(cfb);
	};
	if(typeof module !== 'undefined' && require.main === module)
		exports.main(process.argv.slice(2));
} else {
	Array.prototype.toBuffer = function() {
		var x = [];
		for(var i = 0; i != this[0].length; ++i) { x = x.concat(this[0][i]); }
		return x;
	};
}
