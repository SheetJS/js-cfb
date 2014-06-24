exports.read = readSync;
exports.parse = parse;
exports.utils = {
	ReadShift: ReadShift,
	CheckField: CheckField,
	prep_blob: prep_blob,
	bconcat: bconcat,
	consts: consts
};

return exports;
