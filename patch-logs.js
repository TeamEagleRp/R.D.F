// Patch: add logAction to delete routes for sector/vehicle/wanted
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'server.js');
let src = fs.readFileSync(file, 'utf8');
let count = 0;

function addLogAfterDelete(routeMarker, actionText) {
  const startIdx = src.indexOf(routeMarker);
  if (startIdx === -1) {
    console.log('NOT FOUND:', routeMarker);
    return false;
  }
  // Find the res.json({ success: true }); after the failure return
  const resJsonIdx = src.indexOf('res.json({ success: true });', startIdx);
  if (resJsonIdx === -1) {
    console.log('res.json not found after', routeMarker);
    return false;
  }
  src = src.slice(0, resJsonIdx) + '    ' + actionText + '\n' + src.slice(resJsonIdx);
  count++;
  return true;
}

addLogAfterDelete("app.delete('/api/sector/:id'", "logAction(req, 'حذف بيانات قطاع 🗑️', '', req.params.id, 'حذف سجل من بيانات القطاع');");
addLogAfterDelete("app.delete('/api/vehicles/:id'", "logAction(req, 'حذف مركبة 🗑️', '', req.params.id, 'حذف سجل مركبة');");
addLogAfterDelete("app.delete('/api/wanted/:id'", "logAction(req, 'حذف مطلوب 🗑️', '', req.params.id, 'حذف سجل مطلوب');");

fs.writeFileSync(file, src, 'utf8');
console.log('Done. Applied', count, 'delete patches.');
