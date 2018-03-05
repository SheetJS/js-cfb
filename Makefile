SHELL=/bin/bash
LIB=cfb
FMT=xls doc ppt misc full
REQS=
ADDONS=
AUXTARGETS=xlscfb.js
CMDS=bin/cfb.njs
HTMLLINT=index.html

ULIB=$(shell echo $(LIB) | tr a-z A-Z)
DEPS=$(sort $(wildcard bits/*.js))
TARGET=$(LIB).js
FLOWTARGET=$(LIB).flow.js
FLOWTGTS=$(TARGET) $(AUXTARGETS)
UGLIFYOPTS=--support-ie8 -m
CLOSURE=/usr/local/lib/node_modules/google-closure-compiler/compiler.jar

## Main Targets

.PHONY: all
all: $(TARGET) $(AUXTARGETS) ## Build library and auxiliary scripts

$(FLOWTGTS): %.js : %.flow.js
	node -e 'process.stdout.write(require("fs").readFileSync("$<","utf8").replace(/^[ \t]*\/\*[:#][^*]*\*\/\s*(\n)?/gm,"").replace(/\/\*[:#][^*]*\*\//gm,""))' > $@

$(FLOWTARGET): $(DEPS)
	cat $^ | tr -d '\15\32' > $@

bits/31_version.js: package.json
	echo "exports.version = '"`grep version package.json | awk '{gsub(/[^0-9a-z\.-]/,"",$$2); print $$2}'`"';" > $@

.PHONY: clean
clean: ## Remove targets and build artifacts
	rm -f $(TARGET) $(FLOWTARGET)

.PHONY: clean-data
clean-data:
	rm -fr ./test_files/ ./test_files_pres/

.PHONY: init
init: ## Initial setup for development
	if [ ! -e test_files ]; then git clone --depth=1 https://github.com/SheetJS/test_files; fi
	cd test_files; git pull; make
	if [ ! -e test_files_pres ]; then git clone --depth=1 https://github.com/SheetJS/test_files_pres; fi
	cd test_files_pres; git pull

.PHONY: dist
dist: dist-deps $(TARGET) ## Prepare JS files for distribution
	cp $(TARGET) dist/
	cp LICENSE dist/
	uglifyjs $(TARGET) $(UGLIFYOPTS) -o dist/$(LIB).min.js --source-map dist/$(LIB).min.map --preamble "$$(head -n 1 bits/00_header.js)"
	misc/strip_sourcemap.sh dist/$(LIB).min.js

.PHONY: dist-deps
dist-deps: xlscfb.js ## Copy dependencies for distribution
	cp xlscfb.flow.js dist/xlscfb.js

.PHONY: aux
aux: $(AUXTARGETS)

.PHONY: xls
xls: xlscfb.js

XLSSKIP=bits/08_blob.js bits/04_base64.js bits/05_buf.js
XLSDEPS=misc/suppress_export.js $(filter-out $(XLSSKIP),$(DEPS))
xlscfb.flow.js: $(XLSDEPS) ## Build support library
	cat $^ | tr -d '\15\32' > $@

BYTEFILE=dist/cfb.min.js dist/xlscfb.js
.PHONY: bytes
bytes: ## Display minified and gzipped file sizes
	for i in $(BYTEFILE); do printj "%-30s %7d %10d" $$i $$(wc -c < $$i) $$(gzip --best --stdout $$i | wc -c); done


## Testing

.PHONY: test mocha
test mocha: test.js $(TARGET) ## Run test suite
	mocha -R spec -t 20000

#*                      To run tests for one format, make test_<fmt>
#*                      To run the core test suite, make test_misc
TESTFMT=$(patsubst %,test_%,$(FMT))
.PHONY: $(TESTFMT)
$(TESTFMT): test_%:
	FMTS=$* make test


## Code Checking

.PHONY: fullint
fullint: lint old-lint tslint flow mdlint ## Run all checks

.PHONY: lint
lint: $(TARGET) $(AUXTARGETS) ## Run eslint checks
	@eslint --ext .js,.njs,.json,.html,.htm $(TARGET) $(CMDS) $(HTMLLINT) package.json
	if [ -e $(CLOSURE) ]; then java -jar $(CLOSURE) $(REQS) $(FLOWTARGET) --jscomp_warning=reportUnknownTypes >/dev/null; fi

.PHONY: old-lint
old-lint: $(TARGET) $(AUXTARGETS) ## Run jshint and jscs checks
	@jshint --show-non-errors $(TARGET) $(AUXTARGETS)
	@jshint --show-non-errors $(CMDS)
	@jshint --show-non-errors package.json test.js
	@jshint --show-non-errors --extract=always $(HTMLLINT)
	@jscs $(TARGET) $(AUXTARGETS) test.js
	if [ -e $(CLOSURE) ]; then java -jar $(CLOSURE) $(REQS) $(FLOWTARGET) --jscomp_warning=reportUnknownTypes >/dev/null; fi

.PHONY: tslint
tslint: $(TARGET) ## Run typescript checks
	#@npm install dtslint typescript
	#@npm run-script dtslint
	dtslint types

.PHONY: flow
flow: lint ## Run flow checker
	@flow check --all --show-all-errors --include-warnings

.PHONY: cov
cov: misc/coverage.html ## Run coverage test

misc/coverage.html: $(TARGET) test.js
	mocha --require blanket -R html-cov -t 20000 > $@

.PHONY: coveralls
coveralls: ## Coverage Test + Send to coveralls.io
	mocha --require blanket --reporter mocha-lcov-reporter -t 20000 | node ./node_modules/coveralls/bin/coveralls.js

MDLINT=README.md
.PHONY: mdlint
mdlint: $(MDLINT) ## Check markdown documents
	alex $^
	mdspell -a -n -x -r --en-us $^

.PHONY: help
help:
	@grep -hE '(^[a-zA-Z_-][ a-zA-Z_-]*:.*?|^#[#*])' $(MAKEFILE_LIST) | bash misc/help.sh

#* To show a spinner, append "-spin" to any target e.g. cov-spin
%-spin:
	@make $* & bash misc/spin.sh $$!
