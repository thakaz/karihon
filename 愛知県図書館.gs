

//クッキーの取得
function GetCookies2(response){
  
  var headers = response.getAllHeaders();
  var cookies = [];
  
  if ( typeof headers['Set-Cookie'] !== 'undefined' ) {
    // Set-Cookieヘッダーが2つ以上の場合はheaders['Set-Cookie']の中身は配列
    var cookies = typeof headers['Set-Cookie'] == 'string' ? [ headers['Set-Cookie'] ] : headers['Set-Cookie'];
    for (var i = 0; i < cookies.length; i++) {
      // Set-Cookieヘッダーからname=valueだけ取り出し、セミコロン以降の属性は除外する
      cookies[i] = cookies[i].split( ';' )[0];
    };
  }
  return cookies;
}


//初期セッションID取得
function GetPreJSessionID(){
  var FIRST_SESSION_URL = "https://websv.aichi-pref-library.jp/winj//opac/login.do?lang=ja&dispatch=/opac/mylibrary.do";
  
  var options = {
    method : "get",
    contentType: "text/plain"
  };
  
  var response = UrlFetchApp.fetch(FIRST_SESSION_URL,options);
  var cookies = GetCookies2(response)
  
  return cookies;

}


//ユーザ情報の送信

function SendUserInfo2(cookies){
  
  var conf = config(2);

  var SEND_USER_INFO_URL = conf["SEND_USER_INFO_URL"];
  var txt_usercd = conf["txt_usercd"];
  var txt_password = conf["txt_password"];
  var submit_btn_login = "ログイン"; 
  var cookie = cookies.join(';');
  // HTTPリクエストのパラメータをobjectで設定
  // POSTで渡すフォームデータはpayloadで指定
  var options = {
    method : "post",
    followRedirects: false,
    contentType: "application/x-www-form-urlencoded",
    headers: {
      Cookie: cookies.join(';'),
      Pragma: "no-cache",
    },
    payload : {
      txt_usercd: txt_usercd,
      txt_password: txt_password,
      submit_btn_login : submit_btn_login
    }
  };
  
  var response = UrlFetchApp.fetch(SEND_USER_INFO_URL,options)
  
  var cookies = GetCookies2(response)
  
  return cookies;
 
}


//貸し出し状況の取得
function GetLendList(cookies){
  var FIRST_SESSION_URL = "https://websv.aichi-pref-library.jp/winj/opac/lend-list.do";
  
  var options = {
    method : "get",
    contentType: "text/plain",
    headers: {
      Cookie: cookies.join(';'),
      Pragma: "no-cache",
    }
  };
  
  var response = UrlFetchApp.fetch(FIRST_SESSION_URL,options);
  return response;
}




function main2(){
  try{
  //ログイン前のセッションIDを取得
  var PreJSessionID = GetPreJSessionID();
  //ログインして本セッションIDを取得
  var JSessionID = SendUserInfo2(PreJSessionID);
  //貸し出し状況の取得
  var response = GetLendList(JSessionID);
  
  
  var html = response.getContentText();

  var itemTable = Parser.data(html).from('<ol class="list-book result hook-check-all">').to('</ol>').build();
  var itemTitle = Parser.data(itemTable).from('<span class="title">').to('</span>').iterate();
  var itemInfo  = Parser.data(itemTable).from('<div class="column info">').to('</div>').iterate();
  
  var titleArray = []; 
  var libArray = [];
  var dateArray = [];
  
  //タイトルの抽出
  itemTitle.forEach(function(value,index,array){
    if (String(value).indexOf("DOCTYPE") == -1){
      titleArray.push(value.match(/\s*(\S*)\s*/)[1]);
      libArray.push("県図書館");
    }
  })
  var x;
  x = 3;
  //貸出日の抽出
  itemInfo.forEach(function(value,index,array){
    if (String(value).indexOf("貸") !== -1){
      dateArray.push(value.match(/貸出日:(\d{4}\/\d{2}\/\d{2})/)[1]);
    }
  })
  
  
   
  var　lastRow = sheet.getLastRow();
  var flatten = sheet.getRange(2, 2, lastRow).getValues();
  
  Array.prototype.concat.apply([],flatten);
  
  Logger.log(flatten);

  flatten.filter
  
  titleArray.forEach(function(value,index,array){
    lastRow = sheet.getLastRow(); 
    sheet.getRange(lastRow+1, 1).setValue(dateArray[index]);
    sheet.getRange(lastRow+1, 2).setValue(titleArray[index]);
    sheet.getRange(lastRow+1, 3).setValue(libArray[index]);
  
  })
  
  }catch(e){
    result = "エラー内容:" + e;
    Logger.log(result);
  }
}
