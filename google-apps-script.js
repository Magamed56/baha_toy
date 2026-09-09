/**
 * Google Apps Script — коноктордун жоопторун Google Таблицага сактоо.
 * Приём ответов гостей (RSVP) в Google Таблицу.
 *
 * Орнотуу / Установка:
 *  1. Создайте новую Google Таблицу.
 *  2. Расширения → Apps Script. Удалите всё и вставьте этот файл. Сохраните (иконка дискеты).
 *  3. Развернуть → Новое развёртывание → Тип: «Веб-приложение».
 *     Выполнять от имени: «Я». У кого есть доступ: «Все». Нажмите «Развернуть», разрешите доступ.
 *  4. Скопируйте URL веб-приложения (…/exec) и вставьте в config.js → googleScriptUrl.
 */
var SHEET_NAME = "Жооптор";

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = getOrCreateSheet();
    sheet.appendRow([
      new Date(data.timestamp || Date.now()),
      data.name || "",
      data.rsvpLabel || getLabel(data.rsvp),
      Number(data.guests || 0),
      data.wish || "",
      data.rsvp || "",
      data.lang || "",
      data.userAgent || "",
    ]);
    return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, message: String(err) })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService.createTextOutput("RSVP backend иштеп жатат ✔").setMimeType(ContentService.MimeType.TEXT);
}

function getOrCreateSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    var headers = ["Убакыт", "Аты-жөнү", "Жооп", "Адам саны", "Каалоо", "Код", "Тил", "Түзмөк"];
    sheet.appendRow(headers);
    var h = sheet.getRange(1, 1, 1, headers.length);
    h.setFontWeight("bold").setBackground("#4C463F").setFontColor("#FAF9F7");
    sheet.setColumnWidth(1, 170); sheet.setColumnWidth(2, 240); sheet.setColumnWidth(3, 200); sheet.setColumnWidth(5, 320);
    sheet.setFrozenRows(1);
    // Жыйынтык / Итоги справа
    sheet.getRange("J1").setValue("Келет (жооп)"); sheet.getRange("K1").setFormula('=COUNTIF(F:F;"yes")+COUNTIF(F:F;"both")');
    sheet.getRange("J2").setValue("Келбейт"); sheet.getRange("K2").setFormula('=COUNTIF(F:F;"no")');
    sheet.getRange("J3").setValue("Адам саны"); sheet.getRange("K3").setFormula('=SUM(D:D)');
    sheet.getRange("J1:J3").setFontWeight("bold");
  }
  return sheet;
}

function getLabel(code) {
  return { yes: "Келемин", both: "Жубайым менен келемин", no: "Келе албаймын" }[code] || code || "";
}
