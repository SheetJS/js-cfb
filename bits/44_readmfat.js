function get_mfat_entry(entry/*:CFBEntry*/, payload/*:RawBytes*/, mini/*:?RawBytes*/)/*:CFBlob*/ {
	var start = entry.start, size = entry.size;
	//return (payload.slice(start*MSSZ, start*MSSZ + size)/*:any*/);
	var o = [];
	var idx = start;
	while(mini && size > 0 && idx >= 0) {
		o.push(payload.slice(idx * MSSZ, idx * MSSZ + MSSZ));
		size -= MSSZ;
		idx = __readInt32LE(mini, idx * 4);
	}
	if(o.length === 0) return (new_buf(0)/*:any*/);
	return (bconcat(o).slice(0, entry.size)/*:any*/);
}

