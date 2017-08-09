/*::

type CFBModule = {
	version:string;
	find:(cfb:CFBContainer, path:string)=>?CFBEntry;
	read:(blob:RawBytes|string, opts:CFBReadOpts)=>CFBContainer;
	parse:(file:RawBytes, opts:CFBReadOpts)=>CFBContainer;
	utils:CFBUtils;
};

type CFBFullPathDir = {
	[n:string]: CFBEntry;
}

type CFBUtils = any;

type ReadShiftFunc = {
	//(size:number, t:?string):number|string;
	(size:16):string;
	(size:1|2|4, t:?string):number;
};
type CheckFieldFunc = {(hexstr:string, fld:string):void;};

type RawBytes = Array<number> | Buffer | Uint8Array;

class CFBlobArray extends Array<number> {
	l:number;
	read_shift:ReadShiftFunc;
	chk:CheckFieldFunc;
};
interface CFBlobBuffer extends Buffer {
	l:number;
	slice:(start:number, end:?number)=>Buffer;
	read_shift:ReadShiftFunc;
	chk:CheckFieldFunc;
};
interface CFBlobUint8 extends Uint8Array {
	l:number;
	slice:(start:number, end:?number)=>Uint8Array;
	read_shift:ReadShiftFunc;
	chk:CheckFieldFunc;
};

interface CFBlobber {
	[n:number]:number;
	l:number;
	length:number;
	slice:(start:number, end:?number)=>RawBytes;
	read_shift:ReadShiftFunc;
	chk:CheckFieldFunc;
};

type CFBlob = CFBlobArray | CFBlobBuffer | CFBlobUint8;

interface CFBReadOpts {
	type:?string;
};

type CFBFileIndex = Array<CFBEntry>;

type CFBFindPath = (n:string)=>?CFBEntry;

type CFBContainer = {
	raw:{
		header:any;
		sectors:Array<any>;
	};
	FileIndex:CFBFileIndex;
	FullPathDir:CFBDirectory;
	FullPaths:Array<string>;
	find:CFBFindPath;
}

type CFBEntry = {
	name: string;
	type: number;
	ct?: Date;
	mt?: Date;
	color: number;
	clsid: string;
	state: number;
	start: number;
	size: number;
	storage?: "fat" | "minifat";
	L: number;
	R: number;
	C: number;
	content?: CFBlob;
}
*/
