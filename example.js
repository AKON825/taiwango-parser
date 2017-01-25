var goParser = require('./index')

var url = 'http://taiwango.org.tw/news.asp'

goParser.getAllPages(url, function(err, page){
	console.log(err)
	console.log('getAllPages 取得此內容類別共有幾頁')
	console.log(page)
})

url = 'http://taiwango.org.tw/news.asp?Page=2'

goParser.getTitleList(url, false, function(err, page){
	console.log(err)
	console.log('getTitleList 取得此頁所有的內容連結清單')
	console.log(page)
})

url = 'shownews.asp?id=3034'

goParser.getPageContent(url, function(err, contentObj){
	console.log(err)
	console.log('getPageContent 取得單一頁面內容的物件')
	console.log(contentObj)
})

url = 'our.asp?id=6580'

goParser.getPageChess(url, function(err, contentObj){
	console.log(err)
	console.log('getPageChess 取得單一棋譜頁面的棋譜物件')
	console.log(contentObj)
})
