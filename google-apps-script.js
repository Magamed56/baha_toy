/**
 * Google Apps Script — коноктордун жоопторун Google Таблицага сактоо.
 * Приём ответов гостей (RSVP) в Google Таблицу.
 *
 * Орнотуу / Установка:
 *  1. Создайте новую Google Таблицу.
 *  2. Расширения → Apps Script. Удалите всё и вставьте этот файл. Сохраните.
 *  3. Развернуть → Новое развёртывание → Тип: «Веб-приложение».
 *     Выполнять от имени: «Я». Доступ: «Все». Нажмите «Развернуть».
 *  4. Скопируйте URL веб-приложения и вставьте в config.js → googleScriptUrl.
 */
const SHEET_NAME = "Жооптор";

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = getOrCreateSheet();
    sheet.appendRow([
      new Date(data.timestamp || Date.now()),
      data.name || "",
      data.rsvpLabel || getLabel(data.rsvp),
      data.rsvp || "",
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
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    const headers = ["Убакыт", "Аты-жөнү", "Жооп", "Код", "Түзмөк"];
    sheet.appendRow(headers);
    const h = sheet.getRange(1, 1, 1, headers.length);
    h.setFontWeight("bold").setBackground("#4C463F").setFontColor("#FAF9F7");
    sheet.setColumnWidths(1, 1, 170); sheet.setColumnWidth(2, 260); sheet.setColumnWidth(3, 220);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function getLabel(code) {
  return { yes: "Келемин", both: "Жубайым менен келемин", no: "Келе албаймын" }[code] || code || "";
}

/** Статистика — запустить вручную в редакторе Apps Script. */
function getStats() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) return Logger.log("Жооптор жок");
  const rows = sheet.getDataRange().getValues().slice(1);
  const c = { yes: 0, both: 0, no: 0 };
  rows.forEach((r) => { if (c[r[3]] !== undefined) c[r[3]]++; });
  Logger.log(`Келет: ${c.yes}, Жубайы менен: ${c.both}, Келбейт: ${c.no}, Болжолдуу конок: ${c.yes + c.both * 2}`);
}
