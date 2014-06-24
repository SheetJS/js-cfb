/* [MS-CFB] 2.2 Compound File Header -- read up to major version */
function check_get_mver(blob) {
	// header signature 8
	blob.chk(HEADER_SIGNATURE, 'Header Signature: ');

	// clsid 16
	blob.chk(HEADER_CLSID, 'CLSID: ');

	// minor version 2
	blob.l += 2;

	return blob.read_shift(2,'u');
}
function check_shifts(blob, mver) {
	var shift = 0x09;

	// Byte Order
	blob.chk('feff', 'Byte Order: ');

	// Sector Shift
	switch((shift = blob.read_shift(2))) {
		case 0x09: if(mver !== 3) throw 'MajorVersion/SectorShift Mismatch'; break;
		case 0x0c: if(mver !== 4) throw 'MajorVersion/SectorShift Mismatch'; break;
		default: throw 'Sector Shift: Expected 9 or 12 saw ' + shift;
	}

	// Mini Sector Shift
	blob.chk('0600', 'Mini Sector Shift: ');

	// Reserved
	blob.chk('000000000000', 'Reserved: ');
}

