const fs = require('fs');
let content = fs.readFileSync('src/components/Sidebar.tsx', 'utf8');
content = content.replace(/<<<<<<< HEAD\n  Headphones,\n  MessageSquare,\n  Award,\n  AlertCircle\n=======\n  Headphones\n, Newspaper\n>>>>>>> [^\n]+\n/g, '  Headphones,\n  MessageSquare,\n  Award,\n  AlertCircle,\n  Newspaper\n');
fs.writeFileSync('src/components/Sidebar.tsx', content);
