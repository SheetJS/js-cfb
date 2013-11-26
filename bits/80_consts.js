/** CFB Constants */
{
	/* 2.1 Compund File Sector Numbers and Types */
	var MAXREGSECT = 0xFFFFFFFA;
	var DIFSECT = 0xFFFFFFFC;
	var FATSECT = 0xFFFFFFFD;
	var ENDOFCHAIN = 0xFFFFFFFE;
	var FREESECT = 0xFFFFFFFF;
	/* 2.2 Compound File Header */
	var HEADER_SIGNATURE = 'd0cf11e0a1b11ae1';
	var HEADER_MINOR_VERSION = '3e00';
	var MAXREGSID = 0xFFFFFFFA;
	var NOSTREAM = 0xFFFFFFFF;
	var HEADER_CLSID = '00000000000000000000000000000000';
	/* 2.6.1 Compound File Directory Entry */
	var EntryTypes = ['unknown','storage','stream','lockbytes','property','root'];
}

