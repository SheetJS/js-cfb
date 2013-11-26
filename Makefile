DEPS=$(wildcard bits/*.js)
TARGET=cfb.js

$(TARGET): $(DEPS)
	cat $^ > $@

.PHONY: test mocha
test mocha: init 
	mocha -R spec

.PHONY: lint
lint:
	jshint cfb.js

.PHONY: init
init:
	if [ ! -e test_files ]; then git clone https://github.com/SheetJS/test_files; cd test_files; make; fi

.PHONY: clean	
clean:
	rm -rf $(TARGET) ./test_files/
