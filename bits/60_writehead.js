function _write(cfb/*:CFBContainer*/, options/*:CFBWriteOpts*/)/*:RawBytes*/ {
	var _opts = options || {};
	rebuild_cfb(cfb);
