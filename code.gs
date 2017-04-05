// 1. replace the BOT-TOKEN
// 2. replace EVENT_NAME with the event name
// 3. if you want to, replace channel name below
var EVENT_NAME = 'Cliffmiddagen'

function Initialize() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i in triggers) {
    ScriptApp.deleteTrigger(triggers[i]);
  }

  //Set a trigger when the form updates the spreadsheet to call our Slack notification function
  ScriptApp.newTrigger("CreateMessage")
    .forSpreadsheet(SpreadsheetApp.getActiveSpreadsheet())
    .onFormSubmit()
    .create();
}

function CreateMessage(e) {
  try {
    var spreadsheet, columns;
    var my_message = '';
    var fields = [];
    //fetch the column names
    spreadsheet = SpreadsheetApp.getActiveSheet();
    columns = spreadsheet.getRange(1, 1, 1, spreadsheet.getLastColumn()).getValues()[0];

    // Only include form values that are not blank
    for (var keys in columns) {
      var key = columns[keys];
      if (allowedKey(key)) {
        var val = e.namedValues[key] ? e.namedValues[key].toString() : "";
        if (val !== "") {
          fields.push({
            "title": key,
            "value": val,
            "short": true
          });
        }
      }
    }
    SendSlackMessage(fields);
  } catch (e) {
    Logger.log(e.toString());
  }
}

function allowedKey(key) {
  // var allowed = false;
  // if (key == "Namn" || key == "Mästeri" || key == "Personnummer" || key == "Email" || key == "Dryckespreferens" || key.contains) {
  return (key != 'Timestamp')

}

function TestSlack() {
  var testFields = [
    { "title": "Namn", "value": "Aron" , "short": true },
    { "title": "Personnummer", "value": "940722-1515" , "short": true },
    { "title": "Email", "value": "aronst@kth.se" , "short": true },
    { "title": "Dryckespreferens", "value": "Öl", "short": true  }
  ]
  SendSlackMessage(testFields);
}

function SendSlackMessage(fields) {
  var url = "https://slack.com/api/chat.postMessage";

  var payload = {
    "token" : "<BOT-TOKEN>",
    "as_user" :"true",
    "username": "octobot",
    "channel" : "#anmälningar",
    "text": "Ny anmälan till " + EVENT_NAME + "!",
    "attachments": JSON.stringify([
      {
        "fallback": "Ny anmälan till " + EVENT_NAME + "!",
        "color": "#E0115F",
        "fields": fields
      }
    ]),
    "type" : "post"
  };

  var options = {
    "method"  : "POST",
    "payload" : payload,
    "followRedirects" : false,
    "muteHttpExceptions": true
  };

  var result = UrlFetchApp.fetch(url, options);

  if (result.getResponseCode() == 200) {

    var params = JSON.parse(result.getContentText());

    Logger.log(params);
  }
}

