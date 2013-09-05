# Compound File Binary Format 

This is a Pure-JS implementation of MS-CFB: Compound File Binary File Format, a
format used in many Microsoft file types (such as XLS, DOC, and other Microsoft
Office file types). 

# Installation and Usage

The package is available on NPM:

```
$ npm install -g cfb
$ cfb path/to/CFB/file
```

The command will extract the storages and streams in the container, generating
files that line up with the tree-based structure of the storage.  Metadata 
such as the red-black tree are discarded (and in the future, new CFB containers
will exclusively use black nodes)

# License

This implementation is covered under Apache 2.0 license.  It complies with the
[Open Specifications Promise](http://www.microsoft.com/openspecifications/)

