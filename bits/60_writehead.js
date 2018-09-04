function _write(cfb/*:CFBContainer*/, options/*:CFBWriteOpts*/)/*:RawBytes*/ {
	var _opts = options || {};
	rebuild_cfb(cfb);
	if(_opts.fileType == 'zip') return write_zip(cfb, _opts);
