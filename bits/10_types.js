/*::
declare var DO_NOT_EXPORT_CFB:?boolean;
type SectorEntry = {
	name?:string;
	nodes?:Array<number>;
	data:RawBytes;
};
type SectorList = {
	[k:string|number]:SectorEntry;
	name:?string;
	fat_addrs:Array<number>;
	ssz:number;
}
type CFBFiles = {[n:string]:CFBEntry};
*/
