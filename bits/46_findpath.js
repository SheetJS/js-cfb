var root_name = Paths.shift();
Paths.root = root_name;

/* [MS-CFB] 2.6.4 (Unicode 3.0.1 case conversion) */
function find_path(path) {
	if(path[0] === "/") path = root_name + path;
	var UCNames = (path.indexOf("/") !== -1 ? FullPaths : Paths).map(function(x) { return x.toUpperCase(); });
	var UCPath = path.toUpperCase();
	var w = UCNames.indexOf(UCPath);
	if(w === -1) return null;
	return path.indexOf("/") !== -1 ? FileIndex[w] : files[Paths[w]];
}

