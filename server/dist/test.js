const fs = require("fs");
let allimgs = "pastimgs:"
let filenames = fs.readdirSync('./public/uploads/');
filenames.forEach(file => {
    allimgs += "\n - "+file
});
fs.writeFileSync('./persist_data.yml',allimgs);