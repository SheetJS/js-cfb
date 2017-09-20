	var now = new Date(1987, 1, 19), j = 0;
	var data/*:Array<[string, CFBEntry]>*/ = [];
	for(i = 0; i < cfb.FullPaths.length; ++i) {
		if(cfb.FileIndex[i].type === 0) continue;
		data.push([cfb.FullPaths[i], cfb.FileIndex[i]]);
	}
	for(i = 0; i < data.length; ++i) {
		var dad = dirname(data[i][0]);
		s = false;
		for(j = 0; j < data.length; ++j) if(data[j][0] === dad) s = true;
		if(!s) data.push([dad, ({
			name: filename(dad).replace("/",""),
			type: 1,
			clsid: HEADER_CLSID,
			ct: now, mt: now,
			content: null
		}/*:any*/)]);
	}

