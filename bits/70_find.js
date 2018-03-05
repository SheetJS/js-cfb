/* [MS-CFB] 2.6.4 (Unicode 3.0.1 case conversion) */
function find(cfb/*:CFBContainer*/, path/*:string*/)/*:?CFBEntry*/ {
	var UCFullPaths/*:Array<string>*/ = cfb.FullPaths.map(function(x) { return x.toUpperCase(); });
	var UCPaths/*:Array<string>*/ = UCFullPaths.map(function(x) { var y = x.split("/"); return y[y.length - (x.slice(-1) == "/" ? 2 : 1)]; });
	var k/*:boolean*/ = false;
	if(path.charCodeAt(0) === 47 /* "/" */) { k = true; path = UCFullPaths[0].slice(0, -1) + path; }
	else k = path.indexOf("/") !== -1;
	var UCPath/*:string*/ = path.toUpperCase();
	var w/*:number*/ = k === true ? UCFullPaths.indexOf(UCPath) : UCPaths.indexOf(UCPath);
	if(w !== -1) return cfb.FileIndex[w];

	var m = !UCPath.match(chr1);
	UCPath = UCPath.replace(chr0,'');
	if(m) UCPath = UCPath.replace(chr1,'!');
	for(w = 0; w < UCFullPaths.length; ++w) {
		if((m ? UCFullPaths[w].replace(chr1,'!') : UCFullPaths[w]).replace(chr0,'') == UCPath) return cfb.FileIndex[w];
		if((m ? UCPaths[w].replace(chr1,'!') : UCPaths[w]).replace(chr0,'') == UCPath) return cfb.FileIndex[w];
	}
	return null;
}
