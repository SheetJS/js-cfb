.PHONY: init test lint clean
test: init 
	mocha -R spec

lint:
	jshint cfb.js

init:
	if [ ! -e test_files ]; then git clone https://github.com/Niggler/test_files; fi
	cd test_files; make
	
clean:
	rm -rf ./test_files/
