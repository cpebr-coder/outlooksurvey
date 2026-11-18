/**
 * Google Apps Script — Kuesioner Risk Outlook PLN 2027
 * Versi 2: Support Direksi + BOD-1 dalam satu form
 * (Bound ke spreadsheet — Extensions > Apps Script)
 *
 * SETUP:
 * 1. Paste kode ini → Save
 * 2. Pilih testSetup → Run (sekali untuk bikin header)
 * 3. Deploy → New deployment → Web app → Anyone → Deploy
 * 4. Copy URL ke HTML
 */

var SHEET_DIREKSI = "Respons Direksi";
var SHEET_BOD1 = "Respons BOD-1";
var SHEET_RISK = "Penilaian Risiko";

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    if (data.role === "direksi") {
      writeDireksiSheet(ss, data);
    } else {
      writeBOD1Sheet(ss, data);
      writeRiskSheet(ss, data);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: "ok", message: "API aktif" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function testSetup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // === Sheet 1: Respons Direksi ===
  var ds = ss.getSheetByName(SHEET_DIREKSI);
  if (!ds) {
    var first = ss.getSheets()[0];
    if (first.getLastRow() === 0) { first.setName(SHEET_DIREKSI); ds = first; }
    else { ds = ss.insertSheet(SHEET_DIREKSI, 0); }
  }
  var dHeaders = [
    "Timestamp", "Nama", "Direktorat", "Tanggal Pengisian",
    "B1 - Tingkat Risiko 2027",
    "B2 - Risiko 1", "B2 - Alasan 1",
    "B2 - Risiko 2", "B2 - Alasan 2",
    "B2 - Risiko 3", "B2 - Alasan 3",
    "B3 - Urgensi Topik 1", "B3 - Urgensi Topik 2", "B3 - Urgensi Topik 3", "B3 - Urgensi Topik 4",
    "B3 - Urgensi Topik 5", "B3 - Urgensi Topik 6", "B3 - Urgensi Topik 7", "B3 - Urgensi Topik 8",
    "Risk Appetite (D2)", "Keputusan Strategis (D5)",
    "Peluang & Masukan Lain (E1)"
  ];
  ds.getRange(1, 1, 1, dHeaders.length).setValues([dHeaders]);
  ds.getRange(1, 1, 1, dHeaders.length).setFontWeight("bold");
  ds.setFrozenRows(1);

  // === Sheet 2: Respons BOD-1 ===
  var bs = ss.getSheetByName(SHEET_BOD1);
  if (!bs) bs = ss.insertSheet(SHEET_BOD1);
  var bHeaders = [
    "Timestamp", "Nama", "Direktorat", "Tanggal Pengisian",
    "B1 - Tingkat Risiko 2027",
    "B2 - Risiko 1", "B2 - Alasan 1",
    "B2 - Risiko 2", "B2 - Alasan 2",
    "B2 - Risiko 3", "B2 - Alasan 3",
    "B3 - Urgensi Topik 1", "B3 - Urgensi Topik 2", "B3 - Urgensi Topik 3", "B3 - Urgensi Topik 4",
    "B3 - Urgensi Topik 5", "B3 - Urgensi Topik 6", "B3 - Urgensi Topik 7", "B3 - Urgensi Topik 8",
    "D1 - Kesiapan Topik 1", "D1 - Kesiapan Topik 2", "D1 - Kesiapan Topik 3", "D1 - Kesiapan Topik 4",
    "D1 - Kesiapan Topik 5", "D1 - Kesiapan Topik 6", "D1 - Kesiapan Topik 7", "D1 - Kesiapan Topik 8",
    "D2 - Eskalasi Mitigasi", "D3 - Koordinasi Lintas Direktorat", "D4 - Dukungan dari Direksi",
    "E1 - Peluang Direktorat", "E2 - Masukan Lain", "Jumlah Risiko Dinilai"
  ];
  bs.getRange(1, 1, 1, bHeaders.length).setValues([bHeaders]);
  bs.getRange(1, 1, 1, bHeaders.length).setFontWeight("bold");
  bs.setFrozenRows(1);

  // === Sheet 3: Penilaian Risiko (BOD-1 only) ===
  var rs = ss.getSheetByName(SHEET_RISK);
  if (!rs) rs = ss.insertSheet(SHEET_RISK);
  var rHeaders = [
    "Timestamp", "Nama", "Direktorat",
    "Kode Risiko", "Kandidat Risiko",
    "Dampak (1-5)", "Kemungkinan (1-5)"
  ];
  rs.getRange(1, 1, 1, rHeaders.length).setValues([rHeaders]);
  rs.getRange(1, 1, 1, rHeaders.length).setFontWeight("bold");
  rs.setFrozenRows(1);

  Logger.log("Setup selesai! 3 sheet dibuat.");
}

// === HELPERS ===
var B1_LABELS = {"1":"Jauh lebih rendah","2":"Lebih rendah","3":"Relatif sama","4":"Lebih tinggi","5":"Jauh lebih tinggi"};
var TOPIC_NAMES = [
  "1. Ketahanan Likuiditas PLN 2027","2. Valas Exposure PLN 2027",
  "3. Deep Dive Kerawanan Sistem PLN 2027","4. Kesinambungan Pasokan Energi Primer 2027",
  "5. Ketepatan Eksekusi RUPTL 2027","6. Peluang Data Center 2027",
  "7. Peluang PLTS + BESS 2027","8. Kesiapan Pelindungan Data Pribadi 2027"
];

function getUrgencyScores(data) {
  var scores = [];
  for (var i = 0; i < 8; i++) {
    scores.push((data.b3_urgency && data.b3_urgency[String(i)]) || "");
  }
  return scores;
}

// === DIREKSI ===
function writeDireksiSheet(ss, data) {
  var sheet = ss.getSheetByName(SHEET_DIREKSI);
  if (!sheet) { testSetup(); sheet = ss.getSheetByName(SHEET_DIREKSI); }
  var urg = getUrgencyScores(data);
  var row = [
    new Date(), data.nama||"", data.direktorat||"", data.tanggal||"",
    B1_LABELS[data.b1]||data.b1||"",
    data.b2_r1||"",data.b2_a1||"",data.b2_r2||"",data.b2_a2||"",data.b2_r3||"",data.b2_a3||""
  ].concat(urg).concat([data.d2||"", data.d5||"", data.e1||""]);
  sheet.appendRow(row);
}

// === BOD-1 ===
function writeBOD1Sheet(ss, data) {
  var sheet = ss.getSheetByName(SHEET_BOD1);
  if (!sheet) { testSetup(); sheet = ss.getSheetByName(SHEET_BOD1); }
  var urg = getUrgencyScores(data);
  var row = [
    new Date(), data.nama||"", data.direktorat||"", data.tanggal||"",
    B1_LABELS[data.b1]||data.b1||"",
    data.b2_r1||"",data.b2_a1||"",data.b2_r2||"",data.b2_a2||"",data.b2_r3||"",data.b2_a3||""
  ].concat(urg).concat([
    data.d1_1||"",data.d1_2||"",data.d1_3||"",data.d1_4||"",
    data.d1_5||"",data.d1_6||"",data.d1_7||"",data.d1_8||"",
    data.d2||"",data.d3||"",data.d5||"",
    data.e1||"",data.e2||"",data.riskCount||0
  ]);
  sheet.appendRow(row);
}

function writeRiskSheet(ss, data) {
  var sheet = ss.getSheetByName(SHEET_RISK);
  if (!sheet) { testSetup(); sheet = ss.getSheetByName(SHEET_RISK); }
  if (!data.risks||data.risks.length===0) return;
  var ts=new Date(), nama=data.nama||"", dir=data.direktorat||"";
  var rows=[];
  for (var i=0;i<data.risks.length;i++) {
    var r=data.risks[i];
    if (r.dampak||r.kemungkinan) {
      rows.push([ts,nama,dir,r.kode||"",r.deskripsi||"",r.dampak||"",r.kemungkinan||""]);
    }
  }
  if (rows.length>0) sheet.getRange(sheet.getLastRow()+1,1,rows.length,rows[0].length).setValues(rows);
}
