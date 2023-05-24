


// Handle exporting data

// Turn input JSON to CSV
function jsonToCsv(jsonData) {
    const replacer = (key, value) => value === null ? '' : value 
    const header = Object.keys(jsonData[0])
    const csv = [
      header.join(','),
      ...jsonData.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','))
    ].join('\r\n')
    return csv
  }

// download given data into new file
function exportFile(data, newFileName, newFileExtension = 'txt') {
    if (data === null) {
        console.log("No data to Export")
        return
    }
    const fileData = data;
    const blob = new Blob([fileData], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = newFileName + '.' + newFileExtension;
    link.href = url;
    link.click();
}

export { jsonToCsv, exportFile }