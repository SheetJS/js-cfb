/* shim.js (C) 2013-present SheetJS -- http://sheetjs.com */
/* ES3/5 Compatibility shims and other utilities for older browsers. */

if(!Array.prototype.forEach) Array.prototype.forEach = function(cb) {
  var len = (this.length>>>0), self = (arguments[1]||void 0);
  for(var i=0; i<len; ++i) if(i in this) self ? cb.call(self, this[i], i, this) : cb(this[i], i, this);
};

if(!Array.prototype.map) Array.prototype.map = function(cb) {
  var len = (this.length>>>0), self = (arguments[1]||void 0), A = new Array(len);
  for(var i=0; i<len; ++i) if(i in this) A[i] = self ? cb.call(self, this[i], i, this) : cb(this[i], i, this);
  return A;
};

if(!Array.prototype.indexOf) Array.prototype.indexOf = function(needle) {
  var len = (this.length>>>0), i = ((arguments[1]|0)||0);
  for(i<0 && (i+=len)<0 && (i=0); i<len; ++i) if(this[i] === needle) return i;
  return -1;
};

if(!Array.isArray) Array.isArray = function(obj) { return Object.prototype.toString.call(obj) === "[object Array]"; };

if(typeof ArrayBuffer !== 'undefined' && !ArrayBuffer.prototype.slice) ArrayBuffer.prototype.slice = function(start, end) {
  if(start == null) start = 0;
  if(start < 0) { start += this.byteLength; if(start < 0) start = 0; }
  if(start >= this.byteLength) return new Uint8Array(0);
  if(end == null) end = this.byteLength;
  if(end < 0) { end += this.byteLength; if(end < 0) end = 0; }
  if(end > this.byteLength) end = this.byteLength;
  if(start > end) return new Uint8Array(0);
  var out = new ArrayBuffer(end - start);
  var view = new Uint8Array(out);
  var data = new Uint8Array(this, start, end - start)
  /* IE10 should have Uint8Array#set */
  if(view.set) view.set(data); else while(start <= --end) view[end - start] = data[end];
  return out;
};
if(typeof Uint8Array !== 'undefined' && !Uint8Array.prototype.slice) Uint8Array.prototype.slice = function(start, end) {
  if(start == null) start = 0;
  if(start < 0) { start += this.length; if(start < 0) start = 0; }
  if(start >= this.length) return new Uint8Array(0);
  if(end == null) end = this.length;
  if(end < 0) { end += this.length; if(end < 0) end = 0; }
  if(end > this.length) end = this.length;
  if(start > end) return new Uint8Array(0);
  var out = new Uint8Array(end - start);
  while(start <= --end) out[end - start] = this[end];
  return out;
};
