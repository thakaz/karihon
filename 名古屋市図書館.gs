
//クッキーの取得
function GetCookies(response){
  
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
function GetJSessionID(){
  var FIRST_SESSION_URL = "https://www.library.city.nagoya.jp/licsxp-opac/WOpacMnuTopInitAction.do?WebLinkFlag=1&moveToGamenId=usrlend";
  
  var options = {
    method : "get",
    contentType: "text/plain"
  };
  
  var response = UrlFetchApp.fetch(FIRST_SESSION_URL,options);
  var cookies = GetCookies(response)
  
  return cookies;

}


//ユーザ情報の送信

function SendUserInfo(cookies){

  var conf = config(1)//設定情報の読み込み
  
  var SEND_USER_INFO_URL = conf["SEND_USER_INFO_URL"];
　var gamenid = conf["gamenid"];
  var username = conf["username"];
  var j_username = conf["j_username"];
  var j_password = conf["j_password"]; 
  
  // HTTPリクエストのパラメータをobjectで設定
  // POSTで渡すフォームデータはpayloadで指定
  var options = {
    method : "post",
    followRedirects: true,
    contentType: "application/x-www-form-urlencoded",
    headers: {
      Cookie: cookies.join(';'),
      Pragma: "no-cache",
    },
    payload : {
      gamenid: gamenid,
      username: username,
      j_username: j_username,
      j_password : j_password
    }
  };
  
  var response = UrlFetchApp.fetch(SEND_USER_INFO_URL,options)
  
  return response
 
}


function main(){
  
  try{
  
  //ログイン前のセッションIDを取得
  var JSessionID = GetJSessionID();
  //ログイン
  var response = SendUserInfo(JSessionID);

  var cookies = GetCookies(response);
    
  
  var html = response.getContentText();
  
  var itemTable = Parser.data(html).from('<table class="list" cellpadding="0" cellspacing="0" border="0" summary="貸出状況一覧表">').to('</table>').build();
  var itemTb = Parser.data(itemTable).from('<tbody>').to('</tbody>').build();
  var itemTr = Parser.data(itemTb).from('<tr>').to('</tr>').iterate();
  
  var titleArray = []; 
  var libArray = [];
  var dateArray = [];
  
    //先頭は
  itemTr.forEach(function(value,index,array){
    var itemTd = Parser.data(value).from('<td').to('</td>').iterate();

    libArray.push(itemTd[2].match(/>\s*(\S*)/)[1]);
    dateArray.push(itemTd[3].match(/>\s*(\S*)/)[1]);

  })

  var　lastRow = sheet.getLastRow();
  var flatten = sheet.getRange(2, 2, lastRow).getValues();
  
  Array.prototype.concat.apply([],flatten);
  
//  Logger.log(flatten);

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
