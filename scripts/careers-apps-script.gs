/**
 * QuantHive careers: files each application from the website's Careers page
 * (api/careers.ts) into Google Drive and the applicants' sheet.
 *
 *   - The CV is saved to the careers folder, named after the applicant.
 *   - A row is added to the "Applicants" tab: Name, Email, Attachment (the
 *     CV's Drive link), Phone, Date applied, Role.
 *
 * It runs as the account that deploys it, with that account's Drive and Sheets
 * access: the CVs stay private to the folder's owner and whoever it's shared with.
 *
 * Set up (once):
 *   1. Open the sheet → Extensions → Apps Script; paste this file in place of
 *      Code.gs; save.
 *   2. Project Settings → Script Properties → add CAREERS_SECRET = a long random
 *      string (the same value goes in the site's CAREERS_SHEET_SECRET).
 *   3. Run `setupSheet` once (Run ▸ setupSheet) and allow access when asked:
 *      it makes the tab, its header row and its formats.
 *   4. Deploy → New deployment → Web app: Execute as "Me", Who has access
 *      "Anyone". Copy the web app URL into the site's CAREERS_SHEET_URL.
 *   After editing this file: Deploy → Manage deployments → edit → New version.
 */

const SHEET_ID = "16sJiKW9fcTnlIKfhIg926rZzc7FOnUHaep6k8SfE5lk";
const FOLDER_ID = "1LX3uFVScaKWofjK6k1WpUZLrQAV89SgR";
const TAB = "Applicants";
const HEADERS = ["Name", "Email", "Attachment", "Ph. No", "Date Applied", "Role"];
const WIDTHS = [200, 260, 300, 150, 170, 220];
const TIME_ZONE = "Asia/Kolkata";

/** The website posts each application here (JSON). */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const secret = PropertiesService.getScriptProperties().getProperty("CAREERS_SECRET");
    if (!secret || data.secret !== secret) return reply({ ok: false, error: "unauthorised" });
    if (!data.name || !data.email || !data.file || !data.file.base64) return reply({ ok: false, error: "missing fields" });

    const fileUrl = saveCv(data);
    const lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try {
      addRow(data, fileUrl);
    } finally {
      lock.releaseLock();
    }
    return reply({ ok: true, fileUrl: fileUrl });
  } catch (error) {
    console.error(error);
    return reply({ ok: false, error: String(error) });
  }
}

/** A check that the deployment answers (open the web app URL in a browser). */
function doGet() {
  return reply({ ok: true, service: "QuantHive careers" });
}

/** The CV into the careers folder: "Name — Role — original.pdf". Its link back. */
function saveCv(data) {
  const bytes = Utilities.base64Decode(data.file.base64);
  const safe = (s) => String(s || "").replace(/[\\/:*?"<>|\r\n]+/g, " ").trim();
  const name = [safe(data.name), safe(data.role), safe(data.file.name)].filter(String).join(" — ");
  const blob = Utilities.newBlob(bytes, data.file.type || "application/octet-stream", name);
  const file = DriveApp.getFolderById(FOLDER_ID).createFile(blob);
  file.setDescription("Applied " + (data.appliedAt || new Date().toISOString()) + " via quanthive.in/careers · " + data.email);
  return file.getUrl();
}

/** The applicant as a row: text kept as text (no formulas), the CV a link. */
function addRow(data, fileUrl) {
  const sheet = sheetWithHeader();
  const asText = (s) => String(s || "").replace(/^[=+\-@]/, "'$&"); // never read as a formula
  const applied = data.appliedAt ? new Date(data.appliedAt) : new Date();
  const row = sheet.getLastRow() + 1;
  sheet.getRange(row, 1, 1, HEADERS.length).setValues([[
    asText(data.name),
    asText(data.email),
    "",
    data.phone ? String(data.phone) : "—", // its column is formatted as text: "+91 …" stays as typed
    applied,
    asText(data.role),
  ]]);
  const label = "CV — " + String(data.file.name || "attachment");
  sheet.getRange(row, 3).setRichTextValue(SpreadsheetApp.newRichTextValue().setText(label).setLinkUrl(fileUrl).build());
}

/** The tab, its header and its formats, made if missing. */
function sheetWithHeader() {
  const book = SpreadsheetApp.openById(SHEET_ID);
  let sheet = book.getSheetByName(TAB);
  if (!sheet) sheet = book.insertSheet(TAB, 0);
  if (sheet.getRange(1, 1).getValue() !== HEADERS[0]) formatSheet(sheet);
  return sheet;
}

/** Run once from the editor (Run ▸ setupSheet): grants access and lays out the tab. */
function setupSheet() {
  formatSheet(sheetWithHeader());
}

function formatSheet(sheet) {
  const header = sheet.getRange(1, 1, 1, HEADERS.length);
  header
    .setValues([HEADERS])
    .setFontWeight("bold")
    .setFontColor("#ffffff")
    .setBackground("#1e3a6d")
    .setFontFamily("Inter")
    .setVerticalAlignment("middle");
  sheet.setRowHeight(1, 34);
  sheet.setFrozenRows(1);
  WIDTHS.forEach((w, i) => sheet.setColumnWidth(i + 1, w));
  const body = sheet.getRange(2, 1, sheet.getMaxRows() - 1, HEADERS.length);
  body.setFontFamily("Inter").setVerticalAlignment("middle");
  sheet.getRange(2, 4, sheet.getMaxRows() - 1, 1).setNumberFormat("@"); // phone numbers stay text
  sheet.getRange(2, 5, sheet.getMaxRows() - 1, 1).setNumberFormat("dd mmm yyyy, hh:mm am/pm");
  sheet.getBandings().forEach((b) => b.remove());
  sheet
    .getRange(1, 1, sheet.getMaxRows(), HEADERS.length)
    .applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY, true, false)
    .setHeaderRowColor("#1e3a6d")
    .setFirstRowColor("#ffffff")
    .setSecondRowColor("#f6f7f9");
  sheet.getParent().setSpreadsheetTimeZone(TIME_ZONE);
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
