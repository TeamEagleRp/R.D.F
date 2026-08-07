// Database module using JSON file storage (no native dependencies)
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'data.json');

// Rank ladder (from lowest to highest)
const RANKS = [
  'جندي',
  'عريف',
  'رقيب',
  'مساعد أول',
  'ملازم',
  'نقيب',
  'رائد',
  'مقدم',
  'عقيد',
  'لواء',
];

// Initialize data file if it doesn't exist
function init() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ sector: [], vehicles: [], wanted: [], members: [], warnings: [], duty: [], directed: [], log: [] }, null, 2));
  }
}

function readData() {
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    if (!data.members) data.members = [];
    if (!data.warnings) data.warnings = [];
    if (!data.duty) data.duty = [];
    if (!data.directed) data.directed = [];
    if (!data.log) data.log = [];
    return data;
  } catch (err) {
    return { sector: [], vehicles: [], wanted: [], members: [], warnings: [], duty: [], directed: [], log: [] };
  }
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// ---- Sector ----
function getSector() {
  return readData().sector;
}

function addSector({ name, rank, addedBy, addedById }) {
  const data = readData();
  const record = {
    id: Date.now(),
    name,
    rank,
    added_by: addedBy,
    added_by_id: addedById,
  };
  data.sector.unshift(record);
  writeData(data);
  return record;
}

function deleteSector(id, userId) {
  const data = readData();
  const idx = data.sector.findIndex((r) => String(r.id) === String(id));
  if (idx === -1) return { success: false, error: 'not_found' };
  if (String(data.sector[idx].added_by_id) !== String(userId)) {
    return { success: false, error: 'not_allowed' };
  }
  data.sector.splice(idx, 1);
  writeData(data);
  return { success: true };
}

// ---- Vehicles ----
function getVehicles() {
  return readData().vehicles;
}

function addVehicle({ name, color, photo, addedBy, addedById }) {
  const data = readData();
  const record = {
    id: Date.now(),
    name,
    color,
    photo,
    added_by: addedBy,
    added_by_id: addedById,
  };
  data.vehicles.unshift(record);
  writeData(data);
  return record;
}

function deleteVehicle(id, userId) {
  const data = readData();
  const idx = data.vehicles.findIndex((r) => String(r.id) === String(id));
  if (idx === -1) return { success: false, error: 'not_found' };
  if (String(data.vehicles[idx].added_by_id) !== String(userId)) {
    return { success: false, error: 'not_allowed' };
  }
  data.vehicles.splice(idx, 1);
  writeData(data);
  return { success: true };
}

// ---- Wanted ----
function getWanted() {
  return readData().wanted;
}

function addWanted({ name, charge, danger, photo, addedBy, addedById }) {
  const data = readData();
  const record = {
    id: Date.now(),
    name,
    charge,
    danger,
    photo,
    added_by: addedBy,
    added_by_id: addedById,
  };
  data.wanted.unshift(record);
  writeData(data);
  return record;
}

function deleteWanted(id, userId) {
  const data = readData();
  const idx = data.wanted.findIndex((r) => String(r.id) === String(id));
  if (idx === -1) return { success: false, error: 'not_found' };
  if (String(data.wanted[idx].added_by_id) !== String(userId)) {
    return { success: false, error: 'not_allowed' };
  }
  data.wanted.splice(idx, 1);
  writeData(data);
  return { success: true };
}

// ---- Members (for admin panel) ----
function getMembers() {
  return readData().members;
}

function addMember({ id, name, rank, addedBy }) {
  const data = readData();
  if (data.members.some((m) => String(m.id) === String(id))) {
    return { success: false, error: 'exists' };
  }
  const member = {
    id: String(id),
    name,
    rankIndex: clampRankIndex(RANKS.indexOf(rank)),
    rank: normalizeRank(rank),
    added_by: addedBy,
    createdAt: new Date().toISOString(),
  };
  data.members.push(member);
  writeData(data);
  return { success: true, member };
}

function removeMember(id) {
  const data = readData();
  const idx = data.members.findIndex((m) => String(m.id) === String(id));
  if (idx === -1) return { success: false, error: 'not_found' };
  data.members.splice(idx, 1);
  writeData(data);
  return { success: true };
}

function promoteMember(id) {
  const data = readData();
  const member = data.members.find((m) => String(m.id) === String(id));
  if (!member) return { success: false, error: 'not_found' };
  if (member.rankIndex >= RANKS.length - 1) return { success: false, error: 'max_rank' };
  member.rankIndex += 1;
  member.rank = RANKS[member.rankIndex];
  writeData(data);
  return { success: true, member };
}

function demoteMember(id) {
  const data = readData();
  const member = data.members.find((m) => String(m.id) === String(id));
  if (!member) return { success: false, error: 'not_found' };
  if (member.rankIndex <= 0) return { success: false, error: 'min_rank' };
  member.rankIndex -= 1;
  member.rank = RANKS[member.rankIndex];
  writeData(data);
  return { success: true, member };
}

function setMemberRank(id, rank) {
  const data = readData();
  const member = data.members.find((m) => String(m.id) === String(id));
  if (!member) return { success: false, error: 'not_found' };
  member.rankIndex = clampRankIndex(RANKS.indexOf(rank));
  member.rank = RANKS[member.rankIndex];
  writeData(data);
  return { success: true, member };
}

function clampRankIndex(i) {
  if (i < 0) return 0;
  if (i >= RANKS.length) return RANKS.length - 1;
  return i;
}

function normalizeRank(rank) {
  const idx = RANKS.indexOf(rank);
  return idx >= 0 ? RANKS[idx] : rank;
}

// ---- Warnings ----
const MAX_WARNINGS = 3;

function getWarnings() {
  return readData().warnings;
}

function getWarningsForMember(id) {
  return readData().warnings.filter((w) => String(w.member_id) === String(id));
}

function addWarning({ memberId, reason, addedBy }) {
  const data = readData();
  const warning = {
    id: Date.now(),
    member_id: String(memberId),
    reason,
    added_by: addedBy,
    createdAt: new Date().toISOString(),
  };
  data.warnings.push(warning);
  writeData(data);
  const count = getWarningsForMember(memberId).length;
  // No auto-remove. Flag status based on warning count:
  //   - 2 warnings -> threatened with dismissal (مهدد بالفصل)
  //   - 3 warnings -> ready for dismissal (جاهز للفصل) - admin must click فصل
  const threatened = count >= MAX_WARNINGS - 1;       // reached 2nd
  const removeReady = count >= MAX_WARNINGS;          // reached 3rd
  return { success: true, warning, count, max: MAX_WARNINGS, threatened, removeReady };
}

function removeWarning(id) {
  const data = readData();
  const idx = data.warnings.findIndex((w) => String(w.id) === String(id));
  if (idx === -1) return { success: false, error: 'not_found' };
  data.warnings.splice(idx, 1);
  writeData(data);
  return { success: true };
}

function clearWarnings(memberId) {
  const data = readData();
  data.warnings = data.warnings.filter((w) => String(w.member_id) !== String(memberId));
  writeData(data);
  return { success: true };
}

// ---- Duty (تسجيل دخول للخدمة) ----
function getDuty() {
  return readData().duty;
}

// Check if a member is currently on duty
function isOnDuty(memberId) {
  return readData().duty.some((d) => String(d.member_id) === String(memberId));
}

// Set member on duty (تسجيل دخول للخدمة)
function setOnDuty({ memberId, memberName, addedBy }) {
  const data = readData();
  data.duty = data.duty.filter((d) => String(d.member_id) !== String(memberId));
  const duty = {
    member_id: String(memberId),
    member_name: memberName,
    added_by: addedBy,
    loginTime: new Date().toISOString(),
  };
  data.duty.push(duty);
  writeData(data);
  return { success: true, duty };
}

// Set member off duty (خروج من الخدمة)
function setOffDuty(memberId) {
  const data = readData();
  data.duty = data.duty.filter((d) => String(d.member_id) !== String(memberId));
  writeData(data);
  return { success: true };
}

// Get list of member IDs currently on duty
function getOnDutyIds() {
  return readData().duty.map((d) => String(d.member_id));
}

// ---- Directed voice (دخول موجه) ----
function getDirected() {
  return readData().directed;
}

// Get directed entry for a specific member (or null)
function getDirectedByMember(memberId) {
  return readData().directed.find((d) => String(d.member_id) === String(memberId)) || null;
}

// Get list of members in a specific directed number
function getDirectedByNumber(number) {
  return readData().directed.filter((d) => String(d.number) === String(number));
}

// Set member into a directed voice number
function setDirected({ memberId, memberName, number }) {
  const data = readData();
  data.directed = data.directed.filter((d) => String(d.member_id) !== String(memberId));
  const entry = {
    member_id: String(memberId),
    member_name: memberName,
    number: String(number),
    loginTime: new Date().toISOString(),
  };
  data.directed.push(entry);
  writeData(data);
  return { success: true, entry };
}

// Remove member from directed voice
function clearDirected(memberId) {
  const data = readData();
  data.directed = data.directed.filter((d) => String(d.member_id) !== String(memberId));
  writeData(data);
  return { success: true };
}

// ---- Log (سجل الحركات) ----
function getLogs() {
  return readData().log;
}

function addLog({ action, adminName, adminId, targetName, targetId, details }) {
  const data = readData();
  const entry = {
    id: Date.now(),
    action,
    admin_name: adminName,
    admin_id: adminId ? String(adminId) : '',
    target_name: targetName || '',
    target_id: targetId ? String(targetId) : '',
    details: details || '',
    createdAt: new Date().toISOString(),
  };
  data.log.unshift(entry);
  // Keep only the latest 500 logs
  if (data.log.length > 500) data.log = data.log.slice(0, 500);
  writeData(data);
  return entry;
}

init();

module.exports = {
  RANKS,
  MAX_WARNINGS,
  getSector,
  addSector,
  deleteSector,
  getVehicles,
  addVehicle,
  deleteVehicle,
  getWanted,
  addWanted,
  deleteWanted,
  getMembers,
  addMember,
  removeMember,
  promoteMember,
  demoteMember,
  setMemberRank,
  getWarnings,
  getWarningsForMember,
  addWarning,
  removeWarning,
  clearWarnings,
  getDuty,
  isOnDuty,
  setOnDuty,
setOffDuty,
getOnDutyIds,
  getDirected,
  getDirectedByMember,
  getDirectedByNumber,
  setDirected,
  clearDirected,
  getLogs,
  addLog,
};
