var mver = 3; // major version
var ssz = 512; // sector size
var mssz = 64; // mini sector size
var nds = 0; // number of directory sectors
var nfs = 0; // number of FAT sectors
var nmfs = 0; // number of mini FAT sectors
var ndfs = 0; // number of DIFAT sectors
var dir_start = 0; // first directory sector location
var minifat_start = 0; // first mini FAT sector location
var difat_start = 0; // first mini FAT sector location

var ms_cutoff_size = 4096; // mini stream cutoff size
var minifat_store = 0; // first sector with minifat data
var minifat_size = 0; // size of minifat data

var fat_addrs = []; // locations of FAT sectors

/* [MS-CFB] 2.2 Compound File Header */
var blob = file.slice(0,512);
prep_blob(blob);
var read = ReadShift.bind(blob), chk = CheckField.bind(blob);
//var wrn = WarnField.bind(blob);
var j = 0, q;

// header signature 8
chk(HEADER_SIGNATURE, 'Header Signature: ');

// clsid 16
chk(HEADER_CLSID, 'CLSID: ');

// minor version 2
//wrn(HEADER_MINOR_VERSION, 'Minor Version: ');
read(2);

// major version 3
mver = read(2);
switch(mver) {
	case 3: ssz = 512; break;
	case 4: ssz = 4096; break;
	default: throw "Major Version: Expected 3 or 4 saw " + mver;
}

// reprocess header
var pos = blob.l;
blob = file.slice(0,ssz);
prep_blob(blob,pos);
read = ReadShift.bind(blob);
chk = CheckField.bind(blob);
var header = file.slice(0,ssz);

// Byte Order TODO
chk('feff', 'Byte Order: ');

// Sector Shift
switch((q = read(2))) {
	case 0x09: if(mver !== 3) throw 'MajorVersion/SectorShift Mismatch'; break;
	case 0x0c: if(mver !== 4) throw 'MajorVersion/SectorShift Mismatch'; break;
	default: throw 'Sector Shift: Expected 9 or 12 saw ' + q;
}

// Mini Sector Shift
chk('0600', 'Mini Sector Shift: ');

// Reserved
chk('000000000000', 'Mini Sector Shift: ');

// Number of Directory Sectors
nds = read(4);
if(mver === 3 && nds !== 0) throw '# Directory Sectors: Expected 0 saw ' + nds;

// Number of FAT Sectors
nfs = read(4);

// First Directory Sector Location
dir_start = read(4);

// Transaction Signature TODO
read(4);

// Mini Stream Cutoff Size TODO
chk('00100000', 'Mini Stream Cutoff Size: ');

// First Mini FAT Sector Location
minifat_start = read(4);

// Number of Mini FAT Sectors
nmfs = read(4);

// First DIFAT sector location
difat_start = read(4);

// Number of DIFAT Sectors
ndfs = read(4);

// Grab FAT Sector Locations
for(j = 0; blob.l != 512; ) {
	if((q = read(4))>=MAXREGSECT) break;
	fat_addrs[j++] = q;
}


