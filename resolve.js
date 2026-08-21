const fs = require('fs');

function resolveConflictsKeepHead(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/<<<<<<< HEAD\r?\n([\s\S]*?)\r?\n=======\r?\n[\s\S]*?\r?\n>>>>>>> origin\/main/g, '$1');
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Resolved conflicts in ' + filePath + ' by keeping HEAD.');
}

resolveConflictsKeepHead('index.html');
resolveConflictsKeepHead('js/app.js');
