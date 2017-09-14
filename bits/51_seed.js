function seed_cfb(cfb/*:CFBContainer*/)/*:void*/ {
	var nm = "\u0001Sh33tJ5";
	if(CFB.find(cfb, "/" + nm)) return;
	var p = new_buf(4); p[0] = 55; p[1] = p[3] = 50; p[2] = 54;
	cfb.FileIndex.push(({ name: nm, type: 2, content:p, size:4, L:69, R:69, C:69 }/*:any*/));
	cfb.FullPaths.push(cfb.FullPaths[0] + nm);
	rebuild_cfb(cfb);
}
