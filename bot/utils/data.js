const fs = require("fs");
const path = require("path");

const PATH = path.join(__dirname, "../payouts.json");

function loadPayouts() {
 if (!fs.existsSync(PATH)) return [];
 return JSON.parse(fs.readFileSync(PATH));
}

function savePayouts(data) {
 fs.writeFileSync(PATH, JSON.stringify(data, null, 2));
}

module.exports = { loadPayouts, savePayouts };