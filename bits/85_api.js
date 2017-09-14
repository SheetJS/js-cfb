function cfb_new(opts/*:?any*/)/*:CFBContainer*/ {
	var o/*:CFBContainer*/ = ({}/*:any*/);
	init_cfb(o, opts);
	return o;
}

function cfb_add(cfb/*:CFBContainer*/, name/*:string*/, content/*:?RawBytes*/, opts/*:?any*/)/*:CFBEntry*/ {
	init_cfb(cfb);
	var file = CFB.find(cfb, name);
	if(!file) {
		file = ({name: filename(name)}/*:any*/);
		cfb.FileIndex.push(file);
		cfb.FullPaths.push(name);
		CFB.utils.cfb_gc(cfb);
	}
	/*:: if(!file) throw new Error("unreachable"); */
	file.content = (content/*:any*/);
	file.size = content ? content.length : 0;
	if(opts) {
		if(opts.CLSID) file.clsid = opts.CLSID;
	}
	return file;
}

function cfb_del(cfb/*:CFBContainer*/, name/*:string*/)/*:boolean*/ {
	init_cfb(cfb);
	var file = CFB.find(cfb, name);
	if(file) for(var j = 0; j < cfb.FileIndex.length; ++j) if(cfb.FileIndex[j] == file) {
		cfb.FileIndex.splice(j, 1);
		cfb.FullPaths.splice(j, 1);
		return true;
	}
	return false;
}

function cfb_mov(cfb/*:CFBContainer*/, old_name/*:string*/, new_name/*:string*/)/*:boolean*/ {
	init_cfb(cfb);
	var file = CFB.find(cfb, old_name);
	if(file) for(var j = 0; j < cfb.FileIndex.length; ++j) if(cfb.FileIndex[j] == file) {
		cfb.FileIndex[j].name = filename(new_name);
		cfb.FullPaths[j] = new_name;
		return true;
	}
	return false;
}

function cfb_gc(cfb/*:CFBContainer*/)/*:void*/ { rebuild_cfb(cfb, true); }

