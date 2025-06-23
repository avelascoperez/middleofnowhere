DIST=./dist
STATIC_DIST=$(DIST)/static
SCRIPTS=./scripts

dist:
	mkdir -p $(DIST)
	mkdir -p $(STATIC_DIST)
	mkdir -p $(STATIC_DIST)/js
	mkdir -p $(STATIC_DIST)/css
	mkdir -p $(STATIC_DIST)/assets

copy-libs:
	cp node_modules/marked/marked.min.js $(STATIC_DIST)/js

build: dist copy-libs minify-assets build-html
	cp -R static $(DIST)
	#cp -R assets $(STATIC_DIST)/assets
	npx tailwindcss -i ./index.css -o $(STATIC_DIST)/css/index.css --minify

watch:
	npx tailwindcss -i ./index.css -o $(STATIC_DIST)/css/index.css --watch

data:
	node $(SCRIPTS)/csv-to-json.js projects.csv > data.json

update-webp-paths:
	node $(SCRIPTS)/update-webp-paths.js data.json data.json

.PHONY: build-html
build-html: data update-webp-paths
	cp index.html $(DIST)/index.html
	node inject-data.js data.json $(DIST)/index.html

clean:
	rm data.json

install:
	npm install

minify-assets:
	node $(SCRIPTS)/minify-assets.js
