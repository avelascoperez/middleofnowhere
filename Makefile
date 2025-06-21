DIST=./dist
STATIC_DIST=$(DIST)/static

dist:
	mkdir -p $(DIST)
	mkdir -p $(STATIC_DIST)

build: dist build-html
	cp -R static $(DIST)
	npx tailwindcss -i ./index.css -o $(STATIC_DIST)/css/index.css --minify

watch:
	npx tailwindcss -i ./index.css -o $(STATIC_DIST)/css/index.css --watch

data:
	node csv-to-json.js projects.csv > data.json

build-html: data
	cp index.html $(DIST)/index.html
	node inject-data.js data.json $(DIST)/index.html

clean:
	rm data.json

install:
	npm install
