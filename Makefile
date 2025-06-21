build: embed-data

data:
	node csv-to-json.js projects.csv > data.json

embed-data: data
	node inject-data.js

clean:
	rm data.json
