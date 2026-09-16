const fs = require('fs');
let content = fs.readFileSync('src/services/routeGuard.ts', 'utf8');
content = content.replace(/<<<<<<< HEAD\n([\s\S]*?)=======\n    'news',\n>>>>>>> [^\n]+\n/g, "$1    'news',\n");
fs.writeFileSync('src/services/routeGuard.ts', content);
