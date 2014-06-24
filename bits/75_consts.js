/** CFB Constants */
var MSSZ = 64; /* Mini Sector Size = 1<<6 */
//var MSCSZ = 4096; /* Mini Stream Cutoff Size */
/* 2.1 Compound File Sector Numbers and Types */
var ENDOFCHAIN = -2;
/* 2.2 Compound File Header */
var HEADER_SIGNATURE = 'd0cf11e0a1b11ae1';
var HEADER_CLSID = '00000000000000000000000000000000';
var consts = {
	/* 2.1 Compund File Sector Numbers and Types */
	MAXREGSECT: -6,
	DIFSECT: -4,
	FATSECT: -3,
	ENDOFCHAIN: ENDOFCHAIN,
	FREESECT: -1,
	/* 2.2 Compound File Header */
	HEADER_SIGNATURE: HEADER_SIGNATURE,
	HEADER_MINOR_VERSION: '3e00',
	MAXREGSID: -6,
	NOSTREAM: -1,
	HEADER_CLSID: HEADER_CLSID,
	/* 2.6.1 Compound File Directory Entry */
	EntryTypes: ['unknown','storage','stream','lockbytes','property','root']
};

