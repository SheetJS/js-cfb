LIB=cfb
DEPS=$(sort $(wildcard bits/*.js))
TARGET=$(LIB).js

$(TARGET): $(DEPS)
	cat $^ | tr -d '\15\32' > $@

bits/31_version.js: package.json
	echo "exports.version = '"`grep version package.json | awk '{gsub(/[^0-9a-z\.-]/,"",$$2); print $$2}'`"';" > $@

.PHONY: clean
clean:
	rm -f $(TARGET)
	rm -rf ./test_files/

.PHONY: init
init:
	if [ ! -e test_files ]; then git clone https://github.com/SheetJS/test_files; fi
	cd test_files; git pull; make

.PHONY: test mocha
test mocha: test.js
	mocha -R spec

.PHONY: prof
prof:
	cat misc/prof.js test.js > prof.js
	node --prof prof.js

.PHONY: lint
lint: $(TARGET)
	jshint --show-non-errors $(TARGET)
	jscs $(TARGET)

.PHONY: cov cov-spin
cov: misc/coverage.html
cov-spin:
	make cov & bash misc/spin.sh $$!

misc/coverage.html: $(TARGET) test.js
	mocha --require blanket -R html-cov > $@

.PHONY: coveralls coveralls-spin
coveralls:
	mocha --require blanket --reporter mocha-lcov-reporter | ./node_modules/coveralls/bin/coveralls.js

coveralls-spin:
	make coveralls & bash misc/spin.sh $$!

.PHONY: dist
dist: $(TARGET)
	cp $(TARGET) dist/
	cp LICENSE dist/
	uglifyjs $(TARGET) -o dist/$(LIB).min.js --source-map dist/$(LIB).min.map --preamble "$$(head -n 1 bits/00_header.js)"
