// ===== CONFIG =====
const SHEET_NAMES = {
  KNOWLEDGE: 'Knowledge',
  TAGS: 'Tags',
  WEEKLY_SUMMARY: 'WeeklySummary',
  MONTHLY_SUMMARY: 'MonthlySummary',
};

const SHEET_HEADERS = {
  Knowledge: ['id', 'date', 'title', 'descHtml', 'tagIds', 'createdAt', 'updatedAt'],
  Tags: ['id', 'name', 'color', 'createdAt'],
  WeeklySummary: ['weekKey', 'summaryHtml', 'updatedAt'],
  MonthlySummary: ['monthKey', 'summaryHtml', 'updatedAt'],
};

// ===== SETUP (jalankan SEKALI secara manual dari editor Apps Script) =====
function setupSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  Object.entries(SHEET_HEADERS).forEach(([sheetName, headers]) => {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.setFrozenRows(1);
    }
  });

  const defaultSheet = ss.getSheetByName('Sheet1');
  if (defaultSheet && defaultSheet.getLastRow() === 0) {
    ss.deleteSheet(defaultSheet);
  }

  Logger.log('Setup selesai. Sheet yang ada: ' + ss.getSheets().map((s) => s.getName()).join(', '));
}

// ===== GENERIC HELPERS =====
function getSharedSecret_() {
  return PropertiesService.getScriptProperties().getProperty('SHARED_SECRET');
}

function getSheet_(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(name);
  if (!sheet) throw new Error('Sheet not found: ' + name);
  return sheet;
}

function jsonResponse_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

function uuid_() {
  return Utilities.getUuid();
}

function nowIso_() {
  return new Date().toISOString();
}

function safeParseJson_(str, fallback) {
  try {
    if (!str) return fallback;
    return JSON.parse(str);
  } catch (e) {
    return fallback;
  }
}

function readSheetAsObjects_(sheetName) {
  const sheet = getSheet_(sheetName);
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1);

  return rows
    .map((row, idx) => {
      const obj = {};
      headers.forEach((h, i) => {
        obj[h] = row[i];
      });
      obj.__rowNumber = idx + 2;
      return obj;
    })
    .filter((obj) => obj[headers[0]] !== '' && obj[headers[0]] !== undefined);
}

function findRowNumberByKey_(sheetName, keyValue) {
  const sheet = getSheet_(sheetName);
  const values = sheet.getRange(1, 1, sheet.getLastRow(), 1).getValues();
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] === keyValue) return i + 1;
  }
  return -1;
}

function isoWeekKey_(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const target = new Date(d.valueOf());
  const dayNr = (d.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = new Date(target.getFullYear(), 0, 4);
  const diff = target - firstThursday;
  const week = 1 + Math.round(diff / (7 * 24 * 60 * 60 * 1000));
  return target.getFullYear() + '-W' + String(week).padStart(2, '0');
}

// ===== TAGS =====
function listTags_() {
  return readSheetAsObjects_(SHEET_NAMES.TAGS).map((t) => ({
    id: t.id,
    name: t.name,
    color: t.color,
    createdAt: t.createdAt,
  }));
}

function createTag_(payload) {
  const sheet = getSheet_(SHEET_NAMES.TAGS);
  const tag = {
    id: uuid_(),
    name: payload.name,
    color: payload.color,
    createdAt: nowIso_(),
  };
  sheet.appendRow([tag.id, tag.name, tag.color, tag.createdAt]);
  return tag;
}

function updateTag_(payload) {
  const rowNumber = findRowNumberByKey_(SHEET_NAMES.TAGS, payload.id);
  if (rowNumber === -1) throw new Error('Tag not found: ' + payload.id);
  const sheet = getSheet_(SHEET_NAMES.TAGS);
  sheet.getRange(rowNumber, 2, 1, 2).setValues([[payload.name, payload.color]]);
  return { id: payload.id, name: payload.name, color: payload.color };
}

function deleteTag_(payload) {
  const rowNumber = findRowNumberByKey_(SHEET_NAMES.TAGS, payload.id);
  if (rowNumber === -1) throw new Error('Tag not found: ' + payload.id);
  getSheet_(SHEET_NAMES.TAGS).deleteRow(rowNumber);

  const knowledgeSheet = getSheet_(SHEET_NAMES.KNOWLEDGE);
  const items = readSheetAsObjects_(SHEET_NAMES.KNOWLEDGE);
  items.forEach((item) => {
    const tagIds = safeParseJson_(item.tagIds, []);
    if (tagIds.indexOf(payload.id) !== -1) {
      const newTagIds = tagIds.filter((t) => t !== payload.id);
      knowledgeSheet.getRange(item.__rowNumber, 5, 1, 1).setValue(JSON.stringify(newTagIds));
    }
  });

  return { id: payload.id };
}

// ===== KNOWLEDGE =====
function listKnowledge_(payload) {
  let items = readSheetAsObjects_(SHEET_NAMES.KNOWLEDGE).map((item) => ({
    id: item.id,
    date: item.date,
    title: item.title,
    descHtml: item.descHtml,
    tagIds: safeParseJson_(item.tagIds, []),
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }));

  if (payload.date) {
    items = items.filter((i) => i.date === payload.date);
  }
  if (payload.weekKey) {
    items = items.filter((i) => isoWeekKey_(i.date) === payload.weekKey);
  }
  if (payload.monthKey) {
    items = items.filter((i) => String(i.date).slice(0, 7) === payload.monthKey);
  }
  if (payload.tagId) {
    items = items.filter((i) => i.tagIds.indexOf(payload.tagId) !== -1);
  }

  items.sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1;
    return a.createdAt < b.createdAt ? 1 : -1;
  });

  return items;
}

function createKnowledgeItem_(payload) {
  const sheet = getSheet_(SHEET_NAMES.KNOWLEDGE);
  const now = nowIso_();
  const item = {
    id: uuid_(),
    date: payload.date,
    title: payload.title,
    descHtml: payload.descHtml || '',
    tagIds: payload.tagIds || [],
    createdAt: now,
    updatedAt: now,
  };
  sheet.appendRow([
    item.id,
    item.date,
    item.title,
    item.descHtml,
    JSON.stringify(item.tagIds),
    item.createdAt,
    item.updatedAt,
  ]);
  return item;
}

function updateKnowledgeItem_(payload) {
  const rowNumber = findRowNumberByKey_(SHEET_NAMES.KNOWLEDGE, payload.id);
  if (rowNumber === -1) throw new Error('Knowledge item not found: ' + payload.id);
  const sheet = getSheet_(SHEET_NAMES.KNOWLEDGE);
  const updatedAt = nowIso_();
  const createdAt = sheet.getRange(rowNumber, 6).getValue();
  sheet
    .getRange(rowNumber, 2, 1, 6)
    .setValues([[payload.date, payload.title, payload.descHtml || '', JSON.stringify(payload.tagIds || []), createdAt, updatedAt]]);
  return {
    id: payload.id,
    date: payload.date,
    title: payload.title,
    descHtml: payload.descHtml,
    tagIds: payload.tagIds || [],
    updatedAt,
  };
}

function deleteKnowledgeItem_(payload) {
  const rowNumber = findRowNumberByKey_(SHEET_NAMES.KNOWLEDGE, payload.id);
  if (rowNumber === -1) throw new Error('Knowledge item not found: ' + payload.id);
  getSheet_(SHEET_NAMES.KNOWLEDGE).deleteRow(rowNumber);
  return { id: payload.id };
}

// ===== SUMMARY =====
function getWeeklySummary_(payload) {
  const rowNumber = findRowNumberByKey_(SHEET_NAMES.WEEKLY_SUMMARY, payload.weekKey);
  if (rowNumber === -1) return { weekKey: payload.weekKey, summaryHtml: '', updatedAt: null };
  const sheet = getSheet_(SHEET_NAMES.WEEKLY_SUMMARY);
  const row = sheet.getRange(rowNumber, 1, 1, 3).getValues()[0];
  return { weekKey: row[0], summaryHtml: row[1], updatedAt: row[2] };
}

function saveWeeklySummary_(payload) {
  const sheet = getSheet_(SHEET_NAMES.WEEKLY_SUMMARY);
  const rowNumber = findRowNumberByKey_(SHEET_NAMES.WEEKLY_SUMMARY, payload.weekKey);
  const updatedAt = nowIso_();
  if (rowNumber === -1) {
    sheet.appendRow([payload.weekKey, payload.summaryHtml, updatedAt]);
  } else {
    sheet.getRange(rowNumber, 2, 1, 2).setValues([[payload.summaryHtml, updatedAt]]);
  }
  return { weekKey: payload.weekKey, summaryHtml: payload.summaryHtml, updatedAt };
}

function getMonthlySummary_(payload) {
  const rowNumber = findRowNumberByKey_(SHEET_NAMES.MONTHLY_SUMMARY, payload.monthKey);
  if (rowNumber === -1) return { monthKey: payload.monthKey, summaryHtml: '', updatedAt: null };
  const sheet = getSheet_(SHEET_NAMES.MONTHLY_SUMMARY);
  const row = sheet.getRange(rowNumber, 1, 1, 3).getValues()[0];
  return { monthKey: row[0], summaryHtml: row[1], updatedAt: row[2] };
}

function saveMonthlySummary_(payload) {
  const sheet = getSheet_(SHEET_NAMES.MONTHLY_SUMMARY);
  const rowNumber = findRowNumberByKey_(SHEET_NAMES.MONTHLY_SUMMARY, payload.monthKey);
  const updatedAt = nowIso_();
  if (rowNumber === -1) {
    sheet.appendRow([payload.monthKey, payload.summaryHtml, updatedAt]);
  } else {
    sheet.getRange(rowNumber, 2, 1, 2).setValues([[payload.summaryHtml, updatedAt]]);
  }
  return { monthKey: payload.monthKey, summaryHtml: payload.summaryHtml, updatedAt };
}

// ===== ENTRY POINT =====
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);

    if (body.secret !== getSharedSecret_()) {
      return jsonResponse_({ ok: false, error: 'Unauthorized' });
    }

    const action = body.action;
    const payload = body.payload || {};

    switch (action) {
      case 'ping':
        return jsonResponse_({ ok: true, result: { message: 'pong' } });

      case 'listTags':
        return jsonResponse_({ ok: true, result: listTags_() });
      case 'createTag':
        return jsonResponse_({ ok: true, result: createTag_(payload) });
      case 'updateTag':
        return jsonResponse_({ ok: true, result: updateTag_(payload) });
      case 'deleteTag':
        return jsonResponse_({ ok: true, result: deleteTag_(payload) });

      case 'listKnowledge':
        return jsonResponse_({ ok: true, result: listKnowledge_(payload) });
      case 'createKnowledgeItem':
        return jsonResponse_({ ok: true, result: createKnowledgeItem_(payload) });
      case 'updateKnowledgeItem':
        return jsonResponse_({ ok: true, result: updateKnowledgeItem_(payload) });
      case 'deleteKnowledgeItem':
        return jsonResponse_({ ok: true, result: deleteKnowledgeItem_(payload) });

      case 'getWeeklySummary':
        return jsonResponse_({ ok: true, result: getWeeklySummary_(payload) });
      case 'saveWeeklySummary':
        return jsonResponse_({ ok: true, result: saveWeeklySummary_(payload) });
      case 'getMonthlySummary':
        return jsonResponse_({ ok: true, result: getMonthlySummary_(payload) });
      case 'saveMonthlySummary':
        return jsonResponse_({ ok: true, result: saveMonthlySummary_(payload) });

      default:
        return jsonResponse_({ ok: false, error: 'Unknown action: ' + action });
    }
  } catch (err) {
    return jsonResponse_({ ok: false, error: err.message });
  }
}

function doGet(e) {
  return jsonResponse_({ ok: true, message: 'Knowledge Journal API is alive' });
}
