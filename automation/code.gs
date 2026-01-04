// --- ZION AUTO GLASS: AUTOMATION CENTER v3.0 ---
const EMAIL_RECIPIENT = "zionautoglass@gmail.com"; 
const SHEET_NAME = "Daily Orders";

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) return ContentService.createTextOutput(JSON.stringify({ 'result': 'error', 'error': 'Sheet not found' })).setMimeType(ContentService.MimeType.JSON);

    const p = e.parameter;
    const timestamp = new Date();
    
    const rowData = [
      timestamp,
      p.firstName + " " + p.lastName,
      p.phone,
      p.email,
      p.zip,
      p.year + " " + p.make + " " + p.model,
      p.glassPart,
      p.vin || "N/A",
      p.pay_type,
      p.insurance_provider || "N/A",
      p.dispatch_num || "N/A",
      p.quoted_price || "Pending",
      p.req_date + " (" + p.req_time + ")",
      "New",
      p.user_ip || "Unknown",        
      p.gclid || "Direct/Organic",   
      p.user_agent || "Unknown"      
    ];

    sheet.appendRow(rowData);
    return ContentService.createTextOutput(JSON.stringify({ 'result': 'success' })).setMimeType(ContentService.MimeType.JSON);
  } catch (e) {
    return ContentService.createTextOutput(JSON.stringify({ 'result': 'error', 'error': e })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function setupTrigger() {
  const triggers = ScriptApp.getProjectTriggers();
  for (let i = 0; i < triggers.length; i++) { ScriptApp.deleteTrigger(triggers[i]); }
  ScriptApp.newTrigger('sendDailyReport').timeBased().atHour(16).everyDays(1).inTimezone(Session.getScriptTimeZone()).create();
}

function sendDailyReport() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  let emailBody = "<h2>Zion Auto Glass - Daily Order Report</h2><hr>";
  let count = 0;
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[13] === "New") { 
      count++;
      emailBody += `<p><strong>Customer:</strong> ${row[1]}<br><strong>Vehicle:</strong> ${row[5]}<br><strong>Price:</strong> ${row[11]}<br><strong>IP:</strong> ${row[14]}</p><hr>`;
      sheet.getRange(i + 1, 14).setValue("Processed");
    }
  }
  if (count > 0) { MailApp.sendEmail({ to: EMAIL_RECIPIENT, subject: `Daily Orders: ${count} New`, htmlBody: emailBody }); }
}
