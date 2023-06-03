function getCSVString (data, headers) {
    return headers.map(header => data[header]).join(',') + '\n'
}

module.exports = getCSVString
