exports.find = find;
exports.read = read;
exports.parse = parse;
exports.write = write;
exports.writeFile = write_file;
exports.utils = {
	cfb_new: cfb_new,
	cfb_add: cfb_add,
	cfb_del: cfb_del,
	cfb_mov: cfb_mov,
	cfb_gc: cfb_gc,
	ReadShift: ReadShift,
	CheckField: CheckField,
	prep_blob: prep_blob,
	bconcat: bconcat,
	consts: consts
};

return exports;
