/* [MS-CFB] 2.6.1 Compound File Directory Entry */
function read_directory(dir_start, sector_list, sectors, Paths, nmfs, files, FileIndex) {
	var blob;
	var minifat_store = 0, pl = (Paths.length?2:0);
	var sector = sector_list[dir_start].data;
	var i = 0, namelen = 0, name, o, ctime, mtime;
	for(; i < sector.length; i+= 128) {
		blob = sector.slice(i, i+128);
		prep_blob(blob, 64);
		namelen = blob.read_shift(2);
		if(namelen === 0) continue;
		name = __utf16le(blob,0,namelen-pl);
		Paths.push(name);
		o = {
			name:  name,
			type:  blob.read_shift(1),
			color: blob.read_shift(1),
			L:     blob.read_shift(4, 'i'),
			R:     blob.read_shift(4, 'i'),
			C:     blob.read_shift(4, 'i'),
			clsid: blob.read_shift(16),
			state: blob.read_shift(4, 'i')
		};
		ctime = blob.read_shift(2) + blob.read_shift(2) + blob.read_shift(2) + blob.read_shift(2);
		if(ctime !== 0) {
			o.ctime = ctime; o.ct = read_date(blob, blob.l-8);
		}
		mtime = blob.read_shift(2) + blob.read_shift(2) + blob.read_shift(2) + blob.read_shift(2);
		if(mtime !== 0) {
			o.mtime = mtime; o.mt = read_date(blob, blob.l-8);
		}
		o.start = blob.read_shift(4, 'i');
		o.size = blob.read_shift(4, 'i');
		if(o.type === 5) { /* root */
			minifat_store = o.start;
			if(nmfs > 0 && minifat_store !== ENDOFCHAIN) sector_list[minifat_store].name = "!StreamData";
			/*minifat_size = o.size;*/
		} else if(o.size >= 4096 /* MSCSZ */) {
			o.storage = 'fat';
			if(sector_list[o.start] === undefined) if((o.start+=dir_start)>=sectors.length) o.start-=sectors.length;
			sector_list[o.start].name = o.name;
			o.content = sector_list[o.start].data.slice(0,o.size);
			prep_blob(o.content, 0);
		} else {
			o.storage = 'minifat';
			if(minifat_store !== ENDOFCHAIN && o.start !== ENDOFCHAIN) {
				o.content = sector_list[minifat_store].data.slice(o.start*MSSZ,o.start*MSSZ+o.size);
				prep_blob(o.content, 0);
			}
		}
		files[name] = o;
		FileIndex.push(o);
	}
}

function read_date(blob, offset) {
	return new Date(( ( (__readUInt32LE(blob,offset+4)/1e7)*Math.pow(2,32)+__readUInt32LE(blob,offset)/1e7 ) - 11644473600)*1000);
}

