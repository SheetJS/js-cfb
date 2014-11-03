LIB=cfb
FMT=xls doc ppt misc full
REQS=
ADDONS=
AUXTARGETS=xlscfb.js

ULIB=$(shell echo $(LIB) | tr a-z A-Z)
DEPS=$(sort $(wildcard bits/*.js))
TARGET=$(LIB).js

.PHONY: all
all: $(TARGET) $(AUXTARGETS)

$(TARGET): $(DEPS)
	cat $^ | tr -d '\15\32' > $@

bits/31_version.js: package.json
	echo "exports.version = '"`grep version package.json | awk '{gsub(/[^0-9a-z\.-]/,"",$$2); print $$2}'`"';" > $@

.PHONY: clean
clean:
	rm -f $(TARGET)

.PHONY: clean-data
clean-data:
	rm -fr ./test_files/ ./test_files_pres/

.PHONY: init
init:
	if [ ! -e test_files ]; then git clone https://github.com/SheetJS/test_files; fi
	cd test_files; git pull; make
	if [ ! -e test_files_pres ]; then git clone https://github.com/SheetJS/test_files_pres; fi
	cd test_files_pres; git pull

.PHONY: test mocha
test mocha: test.js
	mocha -R spec -t 20000

.PHONY: prof
prof:
	cat misc/prof.js test.js > prof.js
	node --prof prof.js

TESTFMT=$(patsubst %,test_%,$(FMT))
.PHONY: $(TESTFMT)
$(TESTFMT): test_%:
	FMTS=$* make test


.PHONY: lint
lint: $(TARGET)
	jshint --show-non-errors $(TARGET) $(AUXTARGETS)
	jscs $(TARGET) $(AUXTARGETS)

.PHONY: cov cov-spin
cov: misc/coverage.html
cov-spin:
	make cov & bash misc/spin.sh $$!

COVFMT=$(patsubst %,cov_%,$(FMT))
.PHONY: $(COVFMT)
$(COVFMT): cov_%:
	FMTS=$* make cov

misc/coverage.html: $(TARGET) test.js
	mocha --require blanket -R html-cov > $@

.PHONY: coveralls coveralls-spin
coveralls:
	mocha --require blanket --reporter mocha-lcov-reporter | ./node_modules/coveralls/bin/coveralls.js

coveralls-spin:
	make coveralls & bash misc/spin.sh $$!

.PHONY: dist
dist: dist-deps $(TARGET)
	cp $(TARGET) dist/
	cp LICENSE dist/
	uglifyjs $(TARGET) -o dist/$(LIB).min.js --source-map dist/$(LIB).min.map --preamble "$$(head -n 1 bits/00_header.js)"
	misc/strip_sourcemap.sh dist/$(LIB).min.js

.PHONY: aux
aux: $(AUXTARGETS)

.PHONY: xls
xls: xlscfb.js

XLSDEPS=misc/suppress_export.js $(filter-out bits/08_blob.js,$(DEPS))
xlscfb.js: $(XLSDEPS)
	cat $^ | tr -d '\15\32' > $@

.PHONY: dist-deps
dist-deps: xlscfb.js
	cp xlscfb.js dist/xlscfb.js
