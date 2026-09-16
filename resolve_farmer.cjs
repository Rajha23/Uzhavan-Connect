const fs = require('fs');
let content = fs.readFileSync('src/pages/FarmerDashboard.tsx', 'utf8');

// Conflict 1
content = content.replace(/<<<<<<< HEAD\nimport \{ CHENNAI_TOMATO_FORECAST, AGRICULTURE_NEWS \} from '\.\.\/data\/mockData';\nimport \{ getCropImageUrl \} from "\.\.\/utils\/cropImages";\n\n=======\nimport \{ CHENNAI_TOMATO_FORECAST \} from '\.\.\/data\/mockData';\n>>>>>>> [^\n]+\n/, "import { CHENNAI_TOMATO_FORECAST } from '../data/mockData';\nimport { getCropImageUrl } from '../utils/cropImages';\n");

// Conflict 2
content = content.replace(/<<<<<<< HEAD\n      \{\/\* Agriculture News Section \*\/\}\n[\s\S]*?=======\n>>>>>>> [^\n]+\n/, "");

// Conflict 3
content = content.replace(/<<<<<<< HEAD\n      <\/div>\n=======\n    <\/div>\n\n      \{\/\* ── DETAIL DRAWER/, "    </div>\n\n      {/* ── DETAIL DRAWER");

fs.writeFileSync('src/pages/FarmerDashboard.tsx', content);
