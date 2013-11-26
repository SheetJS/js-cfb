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

