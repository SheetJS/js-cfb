	var gc = false, s = false;
	for(var i = cfb.FullPaths.length - 1; i >= 0; --i) {
		var _file = cfb.FileIndex[i];
		switch(_file.type) {
			case 0:
				if(s) gc = true;
				else { cfb.FileIndex.pop(); cfb.FullPaths.pop(); }
				break;
			case 1: case 2: case 5:
				s = true;
				if(isNaN(_file.R * _file.L * _file.C)) gc = true;
				if(_file.R > -1 && _file.L > -1 && _file.R == _file.L) gc = true;
				break;
			default: gc = true; break;
		}
	}
	if(!gc && !f) return;

