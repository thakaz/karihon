//対象のシート
var spreadsheet = SpreadsheetApp.openById(config(0)["spreadsheet"]);
var sheet = spreadsheet.getSheetByName(config(0)["sheet"]);


var tmpRange = sheet.getRange(2,1,sheet.getLastRow()-1,5)

function Daily(){　
    main2(); //愛知県図書館の呼び出し
  main(); //名古屋市図書館の呼び出し


}
