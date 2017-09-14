	if(L[1]) {
		for(T = 0; T < L[1]; ++T) {
			for(; i < 236 + T * 127; ++i) o.write_shift(-4, i < L[2] ? L[1] + i : -1);
			o.write_shift(-4, T === L[1] - 1 ? ENDOFCHAIN : T + 1);
		}
	}
