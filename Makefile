LIB=cfb
DEPS=$(wildcard bits/*.js)
TARGET=$(LIB).js

$(TARGET): $(DEPS)
	cat $^ > $@

bits/31_version.js: package.json
	echo "this.version = '"`grep version package.json | awk '{gsub(/[^0-9a-z\.-]/,"",$$2); print $$2}'`"';" > $@

.PHONY: clean
clean:
	rm -rf $(TARGET) ./test_files/

.PHONY: init
init:
	if [ ! -e test_files ]; then git clone https://github.com/SheetJS/test_files; fi
	cd test_files; git pull; make

.PHONY: test mocha
test mocha: test.js
	mocha -R spec

.PHONY: lint
lint: $(TARGET)
	jshint --show-non-errors $(TARGET)

.PHONY: cov
cov: misc/coverage.html

misc/coverage.html: $(TARGET) test.js
	mocha --require blanket -R html-cov > misc/coverage.html

.PHONY: coveralls
coveralls:
	mocha --require blanket --reporter mocha-lcov-reporter | ./node_modules/coveralls/bin/coveralls.js

.PHONY: dist
dist: $(TARGET)
	cp $(TARGET) dist/
	cp LICENSE dist/
	uglifyjs $(TARGET) -o dist/$(LIB).min.js --source-map dist/$(LIB).min.map --preamble "$$(head -n 1 bits/00_header.js)"
