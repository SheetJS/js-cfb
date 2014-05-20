/* [MS-CFB] 2.6.4 Red-Black Tree */
function build_full_paths(Dir, pathobj, paths, patharr) {
	var i;
	var dad = new Array(patharr.length);

	var q = new Array(patharr.length);

	for(i=0; i != dad.length; ++i) { dad[i]=q[i]=i; paths[i]=patharr[i]; }

	while(q.length > 0) {
		for(i = q[0]; typeof i !== "undefined"; i = q.shift()) {
			if(dad[i] === i) {
				if(Dir[i].left && dad[Dir[i].left] != Dir[i].left) dad[i] = dad[Dir[i].left];
				if(Dir[i].right && dad[Dir[i].right] != Dir[i].right) dad[i] = dad[Dir[i].right];
			}
			if(Dir[i].child) dad[Dir[i].child] = i;
			if(Dir[i].left) { dad[Dir[i].left] = dad[i]; q.push(Dir[i].left); }
			if(Dir[i].right) { dad[Dir[i].right] = dad[i]; q.push(Dir[i].right); }
		}
		for(i=1; i != dad.length; ++i) if(dad[i] === i) {
			if(Dir[i].right && dad[Dir[i].right] != Dir[i].right) dad[i] = dad[Dir[i].right];
			else if(Dir[i].left && dad[Dir[i].left] != Dir[i].left) dad[i] = dad[Dir[i].left];
		}
	}

	for(i=1; i !== paths.length; ++i) {
		if(Dir[i].type === "unknown") continue;
		var j = dad[i];
		if(j === 0) paths[i] = paths[0] + "/" + paths[i];
		else while(j !== 0) {
			paths[i] = paths[j] + "/" + paths[i];
			j = dad[j];
		}
		dad[i] = 0;
	}

	paths[0] += "/";
	for(i=1; i !== paths.length; ++i) if(Dir[i].type !== 'stream') paths[i] += "/";
	for(i=0; i !== paths.length; ++i) pathobj[paths[i]] = FileIndex[i];
}
build_full_paths(FileIndex, FullPathDir, FullPaths, Paths);

