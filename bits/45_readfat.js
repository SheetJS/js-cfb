/** Chase down the rest of the DIFAT chain to build a comprehensive list
    DIFAT chains by storing the next sector number as the last 32 bytes */
function sleuth_fat(idx, cnt, sectors, ssz, fat_addrs) {
	var q;
	if(idx === ENDOFCHAIN) {
		if(cnt !== 0) throw "DIFAT chain shorter than expected";
	} else if(idx !== -1 /*FREESECT*/) {
		var sector = sectors[idx], m = (ssz>>>2)-1;
		if(!sector) return;
		for(var i = 0; i < m; ++i) {
			if((q = __readInt32LE(sector,i*4)) === ENDOFCHAIN) break;
			fat_addrs.push(q);
		}
		sleuth_fat(__readInt32LE(sector,ssz-4),cnt - 1, sectors, ssz, fat_addrs);
	}
}

/** Follow the linked list of sectors for a given starting point */
function get_sector_list(sectors, start, fat_addrs, ssz, chkd) {
	var sl = sectors.length;
	var buf, buf_chain;
	if(!chkd) chkd = new Array(sl);
	var modulus = ssz - 1, j, jj;
	buf = [];
	buf_chain = [];
	for(j=start; j>=0;) {
		chkd[j] = true;
		buf[buf.length] = j;
		buf_chain.push(sectors[j]);
		var addr = fat_addrs[Math.floor(j*4/ssz)];
		jj = ((j*4) & modulus);
		if(ssz < 4 + jj) throw "FAT boundary crossed: " + j + " 4 "+ssz;
		if(!sectors[addr]) break;
		j = __readInt32LE(sectors[addr], jj);
	}
	return {nodes: buf, data:__toBuffer([buf_chain])};
}

/** Chase down the sector linked lists */
function make_sector_list(sectors, dir_start, fat_addrs, ssz/*:number*/)/*:any*/ {
	var sl = sectors.length, sector_list = new Array(sl);
	var chkd = new Array(sl), buf, buf_chain;
	var modulus = ssz - 1, i, j, k, jj;
	for(i=0; i < sl; ++i) {
		buf = [];
		k = (i + dir_start); if(k >= sl) k-=sl;
		if(chkd[k] === true) continue;
		buf_chain = [];
		for(j=k; j>=0;) {
			chkd[j] = true;
			buf[buf.length] = j;
			buf_chain.push(sectors[j]);
			var addr = fat_addrs[Math.floor(j*4/ssz)];
			jj = ((j*4) & modulus);
			if(ssz < 4 + jj) throw "FAT boundary crossed: " + j + " 4 "+ssz;
			if(!sectors[addr]) break;
			j = __readInt32LE(sectors[addr], jj);
		}
		sector_list[k] = {nodes: buf, data:__toBuffer([buf_chain])};
	}
	return sector_list;
}

