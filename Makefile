.PHONY: init test clean
test: init 
	mocha -R spec

init:
	if [ ! -e test_files ]; then git clone https://github.com/Niggler/test_files; fi
	cd test_files; make
	
clean:
	rm -rf ./test_files/
