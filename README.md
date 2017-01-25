# taiwango-parser
---
台灣棋院（http://taiwango.org.tw/）的資料parser
目前能抓取
圍棋新聞(taiwango.org.tw/news.asp)
院生天地(http://taiwango.org.tw/space.asp)
賽事公告(http://taiwango.org.tw/board.asp)
棋譜(http://taiwango.org.tw/chess.asp)

## Install

透過NPM安裝套件

```sh
$ npm install
```

##  Use
各function使用方式
```sh

var taiwangoParser = require('taiwango-parser');

var url = 'http://taiwango.org.tw/news.asp'

taiwangoParser.getAllPages(url, function(err, page){
	console.log(err)
	console.log('getAllPages 取得此內容類別共有幾頁')
	console.log(page)
})

url = 'http://taiwango.org.tw/news.asp?Page=2'

taiwangoParser.getTitleList(url, false, function(err, page){
	console.log(err)
	console.log('getTitleList 取得此頁所有的內容連結清單')
	console.log(page)
})

url = 'shownews.asp?id=3034'

taiwangoParser.getPageContent(url, function(err, contentObj){
	console.log(err)
	console.log('getPageContent 取得單一頁面內容的物件')
	console.log(contentObj)
})

url = 'our.asp?id=6580'

taiwangoParser.getPageChess(url, function(err, contentObj){
	console.log(err)
	console.log('getPageChess 取得單一棋譜頁面的棋譜物件')
	console.log(contentObj)
})
```
