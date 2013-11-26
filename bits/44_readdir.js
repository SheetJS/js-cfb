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

