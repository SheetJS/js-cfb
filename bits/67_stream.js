	for(i = 1; i < cfb.FileIndex.length; ++i) {
		file = cfb.FileIndex[i];
		/*:: if(!file.content) throw new Error("unreachable"); */
		if(file.size >= 0x1000) {
			o.l = (file.start+1) << 9;
			for(j = 0; j < file.size; ++j) o.write_shift(1, file.content[j]);
			for(; j & 0x1FF; ++j) o.write_shift(1, 0);
		}
	}
