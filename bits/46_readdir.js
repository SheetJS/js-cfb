/* [MS-CFB] 2.6.1 Compound File Directory Entry */
function read_directory(dir_start/*:number*/, sector_list/*:SectorList*/, sectors/*:Array<RawBytes>*/, Paths/*:Array<string>*/, nmfs, files, FileIndex) {
	var minifat_store = 0, pl = (Paths.length?2:0);
	var sector = sector_list[dir_start].data;
	var i = 0, namelen = 0, name;
	for(; i < sector.length; i+= 128) {
		var blob/*:CFBlob*/ = /*::(*/sector.slice(i, i+128)/*:: :any)*/;
		prep_blob(blob, 64);
		namelen = blob.read_shift(2);
		name = __utf16le(blob,0,namelen-pl);
		Paths.push(name);
		var o/*:CFBEntry*/ = ({
			name:  name,
			type:  blob.read_shift(1),
			color: blob.read_shift(1),
			L:     blob.read_shift(4, 'i'),
			R:     blob.read_shift(4, 'i'),
			C:     blob.read_shift(4, 'i'),
			clsid: blob.read_shift(16),
			state: blob.read_shift(4, 'i'),
			start: 0,
			size: 0
		});
		var ctime/*:number*/ = blob.read_shift(2) + blob.read_shift(2) + blob.read_shift(2) + blob.read_shift(2);
		if(ctime !== 0) o.ct = read_date(blob, blob.l-8);
		var mtime/*:number*/ = blob.read_shift(2) + blob.read_shift(2) + blob.read_shift(2) + blob.read_shift(2);
		if(mtime !== 0) o.mt = read_date(blob, blob.l-8);
		o.start = blob.read_shift(4, 'i');
		o.size = blob.read_shift(4, 'i');
		if(o.size < 0 && o.start < 0) { o.size = o.type = 0; o.start = ENDOFCHAIN; o.name = ""; }
		if(o.type === 5) { /* root */
			minifat_store = o.start;
			if(nmfs > 0 && minifat_store !== ENDOFCHAIN) sector_list[minifat_store].name = "!StreamData";
			/*minifat_size = o.size;*/
		} else if(o.size >= 4096 /* MSCSZ */) {
			o.storage = 'fat';
			if(sector_list[o.start] === undefined) sector_list[o.start] = get_sector_list(sectors, o.start, sector_list.fat_addrs, sector_list.ssz);
			sector_list[o.start].name = o.name;
			o.content = (sector_list[o.start].data.slice(0,o.size)/*:any*/);
			prep_blob(o.content, 0);
		} else {
			o.storage = 'minifat';
			if(minifat_store !== ENDOFCHAIN && o.start !== ENDOFCHAIN && sector_list[minifat_store]) {
				o.content = (sector_list[minifat_store].data.slice(o.start*MSSZ,o.start*MSSZ+o.size)/*:any*/);
				prep_blob(o.content, 0);
			}
		}
		files[name] = o;
		FileIndex.push(o);
	}
}

function read_date(blob/*:RawBytes|CFBlob*/, offset/*:number*/)/*:Date*/ {
	return new Date(( ( (__readUInt32LE(blob,offset+4)/1e7)*Math.pow(2,32)+__readUInt32LE(blob,offset)/1e7 ) - 11644473600)*1000);
}

