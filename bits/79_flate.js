var CLEN_ORDER = [ 16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15 ];

/*  LEN_ID = [ 257, 258, 259, 260, 261, 262, 263, 264, 265, 266, 267, 268, 269, 270, 271, 272, 273, 274, 275, 276, 277, 278, 279, 280, 281, 282, 283, 284, 285 ]; */
var LEN_LN = [   3,   4,   5,   6,   7,   8,   9,  10,  11,  13 , 15,  17,  19,  23,  27,  31,  35,  43,  51,  59,  67,  83,  99, 115, 131, 163, 195, 227, 258 ];

/*  DST_ID = [  0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 13,  14,  15,  16,  17,  18,  19,   20,   21,   22,   23,   24,   25,   26,    27,    28,    29 ]; */
var DST_LN = [  1,  2,  3,  4,  5,  7,  9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577 ];

function bit_swap_8(n) { var t = (((((n<<1)|(n<<11)) & 0x22110) | (((n<<5)|(n<<15)) & 0x88440))); return ((t>>16) | (t>>8) |t)&0xFF; }

var use_typed_arrays = typeof Uint8Array !== 'undefined';

var bitswap8 = use_typed_arrays ? new Uint8Array(1<<8) : [];
for(var q = 0; q < (1<<8); ++q) bitswap8[q] = bit_swap_8(q);

function bit_swap_n(n, b) {
	var rev = bitswap8[n & 0xFF];
	if(b <= 8) return rev >>> (8-b);
	rev = (rev << 8) | bitswap8[(n>>8)&0xFF];
	if(b <= 16) return rev >>> (16-b);
	rev = (rev << 8) | bitswap8[(n>>16)&0xFF];
	return rev >>> (24-b);
}

/* helpers for unaligned bit reads */
function read_bits_2(buf, bl) { var w = (bl&7), h = (bl>>>3); return ((buf[h]|(w <= 6 ? 0 : buf[h+1]<<8))>>>w)& 0x03; }
function read_bits_3(buf, bl) { var w = (bl&7), h = (bl>>>3); return ((buf[h]|(w <= 5 ? 0 : buf[h+1]<<8))>>>w)& 0x07; }
function read_bits_4(buf, bl) { var w = (bl&7), h = (bl>>>3); return ((buf[h]|(w <= 4 ? 0 : buf[h+1]<<8))>>>w)& 0x0F; }
function read_bits_5(buf, bl) { var w = (bl&7), h = (bl>>>3); return ((buf[h]|(w <= 3 ? 0 : buf[h+1]<<8))>>>w)& 0x1F; }
function read_bits_7(buf, bl) { var w = (bl&7), h = (bl>>>3); return ((buf[h]|(w <= 1 ? 0 : buf[h+1]<<8))>>>w)& 0x7F; }

/* works up to n = 3 * 8 + 1 = 25 */
function read_bits_n(buf, bl, n) {
	var w = (bl&7), h = (bl>>>3), f = ((1<<n)-1);
	var v = buf[h] >>> w;
	if(n < 8 - w) return v & f;
	v |= buf[h+1]<<(8-w);
	if(n < 16 - w) return v & f;
	v |= buf[h+2]<<(16-w);
	if(n < 24 - w) return v & f;
	v |= buf[h+3]<<(24-w);
	return v & f;
}

/* until ArrayBuffer#realloc is a thing, fake a realloc */
function realloc(b, sz/*:number*/) {
	var L = b.length, M = 2*L > sz ? 2*L : sz + 5, i = 0;
	if(L >= sz) return b;
	if(has_buf) {
		var o = new_unsafe_buf(M);
		// $FlowIgnore
		if(b.copy) b.copy(o);
		else for(; i < b.length; ++i) o[i] = b[i];
		return o;
	} else if(use_typed_arrays) {
		var a = new Uint8Array(M);
		if(a.set) a.set(b);
		else for(; i < b.length; ++i) a[i] = b[i];
		return a;
	}
	b.length = M;
	return b;
}

/* zero-filled arrays for older browsers */
function zero_fill_array(n) {
	var o = new Array(n);
	for(var i = 0; i < n; ++i) o[i] = 0;
	return o;
}