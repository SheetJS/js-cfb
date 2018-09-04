/* node < 8.1 zlib does not expose bytesRead, so default to pure JS */
var _zlib;
function use_zlib(zlib) { try {
	var InflateRaw = zlib.InflateRaw;
	var InflRaw = new InflateRaw();
	InflRaw._processChunk(new Uint8Array([3, 0]), InflRaw._finishFlushFlag);
	if(InflRaw.bytesRead) _zlib = zlib;
	else throw new Error("zlib does not expose bytesRead");
} catch(e) {console.error("cannot use native zlib: " + (e.message || e)); } }

function _inflateRawSync(payload, usz) {
	if(!_zlib) return _inflate(payload, usz);
	var InflateRaw = _zlib.InflateRaw;
	var InflRaw = new InflateRaw();
	var out = InflRaw._processChunk(payload.slice(payload.l), InflRaw._finishFlushFlag);
	payload.l += InflRaw.bytesRead;
	return out;
}

function _deflateRawSync(payload) {
	return _zlib ? _zlib.deflateRawSync(payload) : _deflate(payload);
}
