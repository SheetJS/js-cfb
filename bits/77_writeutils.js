function write_file(cfb/*:CFBContainer*/, filename/*:string*/, options/*:CFBWriteOpts*/)/*:void*/ {
	var o = _write(cfb, options);
	/*:: if(typeof Buffer == 'undefined' || !Buffer.isBuffer(o) || !(o instanceof Buffer)) throw new Error("unreachable"); */
	fs.writeFileSync(filename, o);
}

function a2s(o/*:RawBytes*/)/*:string*/ {
	var out = new Array(o.length);
	for(var i = 0; i < o.length; ++i) out[i] = String.fromCharCode(o[i]);
	return out.join("");
}

function write(cfb/*:CFBContainer*/, options/*:CFBWriteOpts*/)/*:RawBytes|string*/ {
	var o = _write(cfb, options);
	switch(options && options.type) {
		case "file": fs.writeFileSync(options.filename, (o/*:any*/)); return o;
		case "binary": return a2s(o);
		case "base64": return Base64.encode(a2s(o));
	}
	return o;
}
