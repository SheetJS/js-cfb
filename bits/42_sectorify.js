/** Break the file up into sectors */
function sectorify(file/*:RawBytes*/, ssz/*:number*/)/*:Array<RawBytes>*/ {
	var nsectors = Math.ceil(file.length/ssz)-1;
	var sectors/*:Array<RawBytes>*/ = [];
	for(var i=1; i < nsectors; ++i) sectors[i-1] = file.slice(i*ssz,(i+1)*ssz);
	sectors[nsectors-1] = file.slice(nsectors*ssz);
	return sectors;
}

