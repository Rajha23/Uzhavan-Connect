const fs = require('fs');
let content = fs.readFileSync('src/data/mockData.ts', 'utf8');

// Fix DemandRequest missing deliveryDate
content = content.replace(
  /deliveryTimeWindow: 'Morning \(6 AM - 10 AM\)',/g,
  "deliveryTimeWindow: 'Morning (6 AM - 10 AM)',\n    deliveryDate: new Date().toISOString(),"
);
content = content.replace(
  /deliveryTimeWindow: 'Morning',/g,
  "deliveryTimeWindow: 'Morning',\n      deliveryDate: new Date().toISOString(),"
);

// Fix SmartMatchSupplier missing hubProximity
content = content.replace(
  /distanceKm: 250,/g,
  "distanceKm: 250,\n    hubProximity: 'High',"
);

// Fix WorkflowOrder missing qualityGrade and timeline
content = content.replace(
  /fpoName: 'GreenHarvest FPO'/g,
  "fpoName: 'GreenHarvest FPO',\n    qualityGrade: 'Grade A',\n    timeline: [{ status: 'Created', date: new Date().toISOString(), completed: true, actor: 'System' }]"
);

// Remove ProducePassport vehicleId
content = content.replace(/vehicleId: 'TN-45-AT-9080',/g, "");

// Remove SettlementRecord createdAt and updatedAt
content = content.replace(/createdAt: new Date\(\)\.toISOString\(\),/g, "");
content = content.replace(/updatedAt: new Date\(\)\.toISOString\(\)/g, "");

fs.writeFileSync('src/data/mockData.ts', content);
