/** Chase down the rest of the DIFAT chain to build a comprehensive list
    DIFAT chains by storing the next sector number as the last 32 bits */
function sleuth_fat(idx/*:number*/, cnt/*:number*/, sectors/*:Array<RawBytes>*/, ssz/*:number*/, fat_addrs)/*:void*/ {
	var q/*:number*/ = ENDOFCHAIN;
	if(idx === ENDOFCHAIN) {
		if(cnt !== 0) throw new Error("DIFAT chain shorter than expected");
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
function get_sector_list(sectors/*:Array<RawBytes>*/, start/*:number*/, fat_addrs/*:Array<number>*/, ssz/*:number*/, chkd/*:?Array<boolean>*/)/*:SectorEntry*/ {
	var buf/*:Array<number>*/ = [], buf_chain/*:Array<any>*/ = [];
	if(!chkd) chkd = [];
	var modulus = ssz - 1, j = 0, jj = 0;
	for(j=start; j>=0;) {
		chkd[j] = true;
		buf[buf.length] = j;
		buf_chain.push(sectors[j]);
		var addr = fat_addrs[Math.floor(j*4/ssz)];
		jj = ((j*4) & modulus);
		if(ssz < 4 + jj) throw new Error("FAT boundary crossed: " + j + " 4 "+ssz);
		if(!sectors[addr]) break;
		j = __readInt32LE(sectors[addr], jj);
	}
	return {nodes: buf, data:__toBuffer([buf_chain])};
}

/** Chase down the sector linked lists */
function make_sector_list(sectors/*:Array<RawBytes>*/, dir_start/*:number*/, fat_addrs/*:Array<number>*/, ssz/*:number*/)/*:SectorList*/ {
	var sl = sectors.length, sector_list/*:SectorList*/ = ([]/*:any*/);
	var chkd/*:Array<boolean>*/ = [], buf/*:Array<number>*/ = [], buf_chain/*:Array<RawBytes>*/ = [];
	var modulus = ssz - 1, i=0, j=0, k=0, jj=0;
	for(i=0; i < sl; ++i) {
		buf = ([]/*:Array<number>*/);
		k = (i + dir_start); if(k >= sl) k-=sl;
		if(chkd[k]) continue;
		buf_chain = [];
		var seen = [];
		for(j=k; j>=0;) {
			seen[j] = true;
			chkd[j] = true;
			buf[buf.length] = j;
			buf_chain.push(sectors[j]);
			var addr/*:number*/ = fat_addrs[Math.floor(j*4/ssz)];
			jj = ((j*4) & modulus);
			if(ssz < 4 + jj) throw new Error("FAT boundary crossed: " + j + " 4 "+ssz);
			if(!sectors[addr]) break;
			j = __readInt32LE(sectors[addr], jj);
			if(seen[j]) break;
		}
		sector_list[k] = ({nodes: buf, data:__toBuffer([buf_chain])}/*:SectorEntry*/);
	}
	return sector_list;
}

