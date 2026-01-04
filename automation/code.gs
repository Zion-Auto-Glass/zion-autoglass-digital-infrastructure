// --- ZION AUTO GLASS: AUTOMATION CENTER ---
// Handles form data and sends 4PM Parts Orders

const EMAIL_RECIPIENT = "zionautoglass@gmail.com"; // UPDATE THIS
const SHEET_NAME = "Daily Orders";

// 1. RECEIVE FORM SUBMISSION (Connects to index.html)
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) return ContentService.createTextOutput(JSON.stringify({ 'result': 'error', 'error': 'Sheet not found' })).setMimeType(ContentService.MimeType.JSON);

    const p = e.parameter;
    const timestamp = new Date();
    
    // Parse the data
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
      p.quoted_price || "Pending", // Captured from The Brain
      p.req_date + " (" + p.req_time + ")",
      "New" // Status
    ];

    sheet.appendRow(rowData);

    return ContentService.createTextOutput(JSON.stringify({ 'result': 'success' })).setMimeType(ContentService.MimeType.JSON);
  } catch (e) {
    return ContentService.createTextOutput(JSON.stringify({ 'result': 'error', 'error': e })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

// 2. THE 4 PM TRIGGER SETUP (Run this function once manually)
function setupTrigger() {
  // Delete existing triggers to avoid duplicates
  const triggers = ScriptApp.getProjectTriggers();
  for (let i = 0; i < triggers.length; i++) {
    ScriptApp.deleteTrigger(triggers[i]);
  }
  
  // Create new 4 PM Trigger
  ScriptApp.newTrigger('sendDailyReport')
      .timeBased()
      .atHour(16) // 4:00 PM
      .everyDays(1)
      .inTimezone(Session.getScriptTimeZone())
      .create();
}

// 3. DAILY REPORT GENERATOR (Runs automatically)
function sendDailyReport() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  let emailBody = "<h2>Zion Auto Glass - Daily Parts Order</h2><hr>";
  let count = 0;
  
  // Skip header row
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const status = row[13]; // Column N
    
    // Only process "New" orders
    if (status === "New") {
      count++;
      emailBody += `
        <p><strong>Customer:</strong> ${row[1]} (${row[2]})<br>
        <strong>Vehicle:</strong> ${row[5]}<br>
        <strong>Part:</strong> ${row[6]}<br>
        <strong>VIN:</strong> ${row[7]}<br>
        <strong>Quote:</strong> ${row[11]}<br>
        <strong>Payment:</strong> ${row[8]} ${row[10] !== "N/A" ? "(Disp: " + row[10] + ")" : ""}<br>
        <a href="https://afterpay.com">Create Invoice</a>
        </p><hr>`;
        
      // Mark as Processed
      sheet.getRange(i + 1, 14).setValue("Processed");
    }
  }
  
  if (count > 0) {
    MailApp.sendEmail({
      to: EMAIL_RECIPIENT,
      subject: `Daily Order Sheet: ${count} New Orders`,
      htmlBody: emailBody
    });
  }
