import fs from 'fs'
import csv from 'csv-parser'

function parseDate(dateStr) {
  if (!dateStr || dateStr.trim() === '') return { dateStart: null, dateEnd: null };
  // Handle "YYYY-"
  if (dateStr.endsWith('-')) {
    return { dateStart: dateStr.slice(0, -1), dateEnd: null };
  }
  // Handle "YYYY-YY" or "YYYY-YYYY"
  if (dateStr.includes('-')) {
    const [start, end] = dateStr.split('-');
    const dateStart = start;
    // Pad end to 4 digits if needed (e.g., "20-23" -> "2023")
    const dateEnd = end.length === 2 ? start.slice(0, 2) + end : end;
    return { dateStart, dateEnd };
  }
  // Handle "YYYY"
  return { dateStart: dateStr, dateEnd: dateStr };
}

(() => {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Please provide the CSV file path as an argument.');
    process.exit(1);
  }

  const csvFilePath = args[0];
  const results = [];

  fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on('data', (row) => {
      // Split Secondary Category by "|"
      const secondary = row['Secondary Category'] ? row['Secondary Category'].split('|').filter(Boolean) : [];
      // Create tags array
      const tags = [row['Main Category'], ...secondary];
      // Parse Date
      const { dateStart, dateEnd } = parseDate(row['Date']);
      // Build the object
      results.push({
        id: row['id'],
        "Project Title": row['Project Title'],
        "Collaboration": row['Collaboration'],
        "Date": row['Date'],
        "Location": row['Location'],
        "Main Category": row['Main Category'],
        "Secondary Category": secondary,
        "Notes": row['Notes'] || '',
        "tags": tags.filter(Boolean).map(t => t.trim()),
        "dateStart": dateStart,
        "dateEnd": dateEnd
      });
    })
    .on('end', () => {
      // Output the result as JSON
      console.log(JSON.stringify(results, null, 2));
    });
})();
