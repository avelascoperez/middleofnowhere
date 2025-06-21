build: embed-data
	npx tailwindcss -i ./index.css -o ./static/css/index.css

watch:
	npx tailwindcss -i ./index.css -o ./static/css/index.css --watch

data:
	node csv-to-json.js projects.csv > data.json

embed-data: data
	node inject-data.js

clean:
	rm data.json
