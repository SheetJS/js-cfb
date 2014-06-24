/* [MS-CFB] 2.6.4 */
function make_find_path(FullPaths, Paths, FileIndex, files, root_name) {
	var UCFullPaths = new Array(FullPaths.length);
	var UCPaths = new Array(Paths.length), i;
	for(i = 0; i < FullPaths.length; ++i) UCFullPaths[i] = FullPaths[i].toUpperCase();
	for(i = 0; i < Paths.length; ++i) UCPaths[i] = Paths[i].toUpperCase();
	return function find_path(path) {
		var k;
		if(path.charCodeAt(0) === 47 /* "/" */) { k=true; path = root_name + path; }
		else k = path.indexOf("/") !== -1;
		var UCPath = path.toUpperCase();
		var w = k === true ? UCFullPaths.indexOf(UCPath) : UCPaths.indexOf(UCPath);
		if(w === -1) return null;
		return k === true ? FileIndex[w] : files[Paths[w]];
	};
}

