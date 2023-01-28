const fs = require('fs');
const path = require('path');

const folderPath = 'output';

fs.readdir(folderPath, (err, files) => {
  if (err) {
    console.error(`Error reading files from ${folderPath}: ${err}`);
    return;
  }

  files.forEach((file) => {
    const filePath = path.join(folderPath, file);

    fs.rename(filePath, filePath.replace(/\s/g, '-'), (renameErr) => {
      if (renameErr) {
        console.error(`Error renaming ${filePath}: ${renameErr}`);
      }
    });
  });
});