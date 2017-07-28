/* [MS-CFB] 2.6.4 */
function make_find_path(FullPaths/*:Array<string>*/, Paths/*:Array<string>*/, FileIndex/*:CFBFileIndex*/, files/*:CFBFiles*/, root_name/*:string*/)/*:CFBFindPath*/ {
	var UCFullPaths/*:Array<string>*/ = [];
	var UCPaths/*:Array<string>*/ = [], i = 0;
	for(i = 0; i < FullPaths.length; ++i) UCFullPaths[i] = FullPaths[i].toUpperCase().replace(chr0,'').replace(chr1,'!');
	for(i = 0; i < Paths.length; ++i) UCPaths[i] = Paths[i].toUpperCase().replace(chr0,'').replace(chr1,'!');
	return function find_path(path/*:string*/)/*:?CFBEntry*/ {
		var k/*:boolean*/ = false;
		if(path.charCodeAt(0) === 47 /* "/" */) { k=true; path = root_name + path; }
		else k = path.indexOf("/") !== -1;
		var UCPath/*:string*/ = path.toUpperCase().replace(chr0,'').replace(chr1,'!');
		var w/*:number*/ = k === true ? UCFullPaths.indexOf(UCPath) : UCPaths.indexOf(UCPath);
		if(w === -1) return null;
		return k === true ? FileIndex[w] : files[Paths[w]];
	};
}

