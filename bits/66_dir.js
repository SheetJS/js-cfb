	for(i = 0; i < L[4]<<2; ++i) {
		var nm = cfb.FullPaths[i];
		if(!nm || nm.length === 0) {
			for(j = 0; j < 17; ++j) o.write_shift(4, 0);
			for(j = 0; j < 3; ++j) o.write_shift(4, -1);
			for(j = 0; j < 12; ++j) o.write_shift(4, 0);
			continue;
		}
		file = cfb.FileIndex[i];
		if(i === 0) file.start = file.size ? file.start - 1 : ENDOFCHAIN;
		flen = 2*(file.name.length+1);
		o.write_shift(64, file.name, "utf16le");
		o.write_shift(2, flen);
		o.write_shift(1, file.type);
		o.write_shift(1, file.color);
		o.write_shift(-4, file.L);
		o.write_shift(-4, file.R);
		o.write_shift(-4, file.C);
		if(!file.clsid) for(j = 0; j < 4; ++j) o.write_shift(4, 0);
		else o.write_shift(16, file.clsid, "hex");
		o.write_shift(4, file.state || 0);
		o.write_shift(4, 0); o.write_shift(4, 0);
		o.write_shift(4, 0); o.write_shift(4, 0);
		o.write_shift(4, file.start);
		o.write_shift(4, file.size); o.write_shift(4, 0);
	}
