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
// Cara pakai: buka Code.gs ini di Apps Script editor, pilih fungsi "setupSheets"
// di dropdown run, klik Run. Ini akan membuat 4 sheet + header otomatis
// kalau belum ada. Aman dijalankan berkali-kali (tidak menimpa data yang sudah ada).
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

  // Hapus "Sheet1" default kalau masih ada dan kosong
  const defaultSheet = ss.getSheetByName('Sheet1');
  if (defaultSheet && defaultSheet.getLastRow() === 0) {
    ss.deleteSheet(defaultSheet);
  }

  Logger.log('Setup selesai. Sheet yang ada: ' + ss.getSheets().map((s) => s.getName()).join(', '));
}

// ===== HELPERS =====
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

      // TODO FASE Tags: 'listTags', 'createTag', 'updateTag', 'deleteTag'
      // TODO FASE Knowledge: 'listKnowledge', 'createKnowledgeItem', 'updateKnowledgeItem', 'deleteKnowledgeItem'
      // TODO FASE Summary: 'getWeeklySummary', 'saveWeeklySummary', 'getMonthlySummary', 'saveMonthlySummary'

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
