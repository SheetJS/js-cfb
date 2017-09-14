/* index.d.ts (C) 2013-present SheetJS */
// TypeScript Version: 2.2

/** Version string */
export const version: string;

/** Parse a buffer or array */
export function parse(f: CFB$Blob, options?: CFBParsingOptions): CFBContainer;

/** Read a blob or file or binary string */
export function read(f: CFB$Blob | string, options?: CFBParsingOptions): CFBContainer;

/** Find a file entry given a path or file name */
export function find(cfb: CFBContainer, path: string): CFBEntry | null;

/** Generate a container file */
export function write(cfb: CFBContainer, options?: any): any;

/** Write a container file to the filesystem */
export function writeFile(cfb: CFBContainer, filename: string, options?: any): any;

/** Utility functions */
export const utils: CFB$Utils;


/** Options for read and readFile */
export interface CFBParsingOptions {
  /** Input data encoding */
  type?: 'base64' | 'binary' | 'buffer' | 'file' | 'array';
  /** If true, throw errors when features are not understood */
  WTF?: boolean;
  /** If true, include raw data in output */
  raw?: boolean;
}

export type CFB$Blob = Buffer | number[] | Uint8Array;

export enum CFBEntryType { unknown, storage, stream, lockbytes, property, root }
export enum CFBStorageType { fat, minifat }

/** CFB File Entry Object */
export interface CFBEntry {
  /** Case-sensitive internal name */
  name: string;

  /** CFB type (salient types: stream, storage) -- see CFBEntryType */
  type: number;

  /** Raw Content (Buffer when available, Array of bytes otherwise) */
  content: CFB$Blob;

  /** Creation Time */
  ct?: Date;

  /** Modification Time */
  mt?: Date;

  /** Red/Black Tree color: 0 = red, 1 = black */
  color: number;

  /** Class ID represented as hex string */
  clsid: string;

  /** User-Defined State Bits */
  state: number;

  /** Starting Sector */
  start: number;

  /** Data Size */
  size: number;

  /** Storage location -- see CFBStorageType */
  storage?: string;
}


/* cfb.FullPathDir Directory object */
export interface CFBDirectory {
  /* cfb.FullPathDir keys are paths; cfb.Directory keys are file names */
  [key: string]: CFBEntry;
}


/* File object */
export interface CFBContainer {
  /* list of streams and storages */
  FullPaths: string[];

  /* Path -> CFB object mapping */
  FullPathDir: CFBDirectory;

  /* Array of entries in the same order as FullPaths */
  FileIndex: CFBEntry[];

  /* Raw Content, in chunks (Buffer when available, Array of bytes otherwise) */
  raw?: {
    header: CFB$Blob,
    sectors: CFB$Blob[];
  };
}

/** General utilities */
export interface CFB$Utils {
  cfb_new(opts?: any): CFBContainer;
  cfb_add(cfb: CFBContainer, name: string, content: any, opts?: any): CFBEntry;
  cfb_del(cfb: CFBContainer, name: string): boolean;
  cfb_mov(cfb: CFBContainer, old_name: string, new_name: string): boolean;
  cfb_gc(cfb: CFBContainer): void;
  ReadShift(size: number, t?: string): number|string;
  WarnField(hexstr: string, fld?: string): void;
  CheckField(hexstr: string, fld?: string): void;
  prep_blob(blob: any, pos?: number): CFB$Blob;
  bconcat(bufs: any[]): any;
}
