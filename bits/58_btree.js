	for(i = 0; i < data.length; ++i) {
		var elt = cfb.FileIndex[i];
		var nm = cfb.FullPaths[i];

		elt.name =  filename(nm).replace("/","");
		elt.L = elt.R = elt.C = -(elt.color = 1);
		elt.size = elt.content ? elt.content.length : 0;
		elt.start = 0;
		elt.clsid = (elt.clsid || HEADER_CLSID);
		if(i === 0) {
			elt.C = data.length > 1 ? 1 : -1;
			elt.size = 0;
			elt.type = 5;
		} else if(nm.slice(-1) == "/") {
			for(j=i+1;j < data.length; ++j) if(dirname(cfb.FullPaths[j])==nm) break;
			elt.C = j >= data.length ? -1 : j;
			for(j=i+1;j < data.length; ++j) if(dirname(cfb.FullPaths[j])==dirname(nm)) break;
			elt.R = j >= data.length ? -1 : j;
			elt.type = 1;
		} else {
			if(dirname(cfb.FullPaths[i+1]||"") == dirname(nm)) elt.R = i + 1;
			elt.type = 2;
		}
	}

