module.exports = GoParser

var path = require('path')
var async = require('async')
var request = require('request')
var cheerio = require('cheerio')
var iconv = require('iconv-lite')
var base64Img = require('base64-img')
var moment = require('moment')
var winston = require('winston')

var twGoUrl = 'http://www.taiwango.org.tw/'

function GoParser () {
  if (!(this instanceof GoParser)) {
    return new GoParser()
  }

  function getImgBase64 (url, cb) {
    //var url = 'http://taiwango.org.tw/qiup/uploadfile/2016112766709893.JPG';

    return base64Img.requestBase64(url, function(err, res, body) {
      return cb(err, body)
    });
  }

  /**
   * 抓這個主題頁面總共有幾頁
   *
   * @param {string} pageUrl
   * @param {Function} cb
   * @returns {object}
   */
  this.getAllPages = function (pageUrl, cb) {
    return request({
      url: pageUrl,
      //禁止使用預設編碼
      encoding: null
    }, function (error, response, body) {
      if (error) {
        return cb(error)
      }

      if(response.statusCode != 200) {
        return cb(new Error('頁面失效 200'))
      }

      if (!error && response.statusCode == 200) {
        var body = iconv.decode(body, 'big5');
        var page = 0;
        var $ = cheerio.load(body)
        var paragraph = $("p:contains('頁次：')").text()

        paragraph = paragraph.split('\n')

        for (var key in paragraph) {
          if(paragraph[key].match(/頁次/)) {
            var start = paragraph[key].search(/\//g)
            var end = paragraph[key].search(/[1-9]頁/g)

            page = paragraph[key].substring(start+1, end+1)
          }
        }

        return cb(null, page)
      }
    })
  }

  /**
   * 抓一頁標題清單頁中的標題和連結
   *
   * @param {string} pageUrl
   * @param {Function} cb
   * @returns {object}
   */
  this.getTitleList = function (pageUrl, isChess, cb) {
    return request({
      url: pageUrl,
      //禁止使用預設編碼
      encoding: null
    }, function (error, response, body) {
      if (error) {
        return cb(error.message)
      }

      if (response.statusCode != 200) {
        return cb(new Error('頁面失效 200'))
      }

      if (!isChess) {
        var body = iconv.decode(body, 'big5');
        var $ = cheerio.load(body)
        var titleObjList = []
        var titles = $("td:contains('點擊率')").last().parent().siblings().find("td a")


        for(i = 0;i < titles.length;i++){
          var title = titles.eq(i).text()
          // 列表中的時間
          var date = titles.parent().next().next().eq(i).text()

          date = moment(new Date(date)).format('YYYY-MM-DD')

          if(title != "首頁" && title != "上頁" && title != "下頁" && title != "尾頁") {
            titleObjList.push({title: titles.eq(i).text(), href: titles.eq(i).attr("href"), date: date})
          }
        }

        return cb(null, titleObjList)
      }


      if (isChess) {
        var body = iconv.decode(body, 'big5');
        var $ = cheerio.load(body)
        var titleObjList = []
        var titles = $("td:contains('點擊率')").last().parent().siblings().find("td a")


        for(i = 0;i < titles.length;i++){
          var title = titles.eq(i).text()
          // 列表中的時間
          var date = titles.parent().next().next().next().next().next().eq(i).text()
          var chessResult = titles.parent().next().next().next().eq(i).text()
          var blackNameField = titles.parent().next().eq(i).text().replace(/\s/g,'')
          var whiteNameField = titles.parent().next().next().eq(i).text().replace(/\s/g,'')
          // 再把黑方白方的段位從名字切出來, 並分開指定
          var blackLevel = blackNameField.replace(/.*\((.*)\)/g, '$1')
          var whiteLevel = whiteNameField.replace(/.*\((.*)\)/g, '$1')
          var blackName = blackNameField.replace(/(.*)\(.*\)/g, '$1')
          var whiteName = whiteNameField.replace(/(.*)\(.*\)/g, '$1')

          date = moment(new Date(date)).format('YYYY-MM-DD')

          if(title != "首頁" && title != "上頁" && title != "下頁" && title != "尾頁") {
            // javascript:newwindow('our.asp?id=6497')
            var href = titles.eq(i).attr("onclick").replace(/.*newwindow\(\'(.*)\'\)/g, '$1')
            var titleObj = {
              title: titles.eq(i).text(),
              href: href,
              date: date,
              chess_result: chessResult,
              black_name : blackName,
              white_name: whiteName,
              black_level: blackLevel,
              white_level: whiteLevel
            }

            titleObjList.push(titleObj)
          }
        }

        return cb(null, titleObjList)
      }
    })
  }

  /**
   * 抓一頁的content
   *
   * @param {string} pageUrl
   * @param {Function} cb
   * @returns {object}
   */
  this.getPageContent = function (pageUrl, cb) {
    // pageUrl 如 shownews.asp?id=2948
    return request({
      url: twGoUrl + pageUrl,
      //禁止使用預設編碼
      encoding: null
    }, function (error, response, body) {
      if (error) {
        return cb(error)
      }

      if(response.statusCode != 200) {
        return cb(new Error('頁面失效 200'))
      }

      if (!error && response.statusCode == 200) {
        var body = iconv.decode(body, 'big5');
        var page = 0;
        var $ = cheerio.load(body)

        // 新聞內容的抓法 第三層table的第三個
        // var table3rds = $("table table table").eq(2).text()
        // var table3rds = $("table table table img")
        var table3rds = $("table table table").eq(2)
        var imgsInTable3rds = $("table table table").eq(2).find("img")

        var titlePart = $("table table table").eq(2).find("td")
        var title = titlePart.eq(2).text()
        var descreption = titlePart.eq(3).text()
        //var content = table3rds.html()
        // 這個content的html抓出來是一個div
        var content = table3rds.find("td").eq(5).html()

        var contentObj = {
          title: title,
          des: descreption,
          content: content,
          url: pageUrl
        }

        return cb(null, contentObj)
      }
    })
  }

  /**
   * 抓一頁的棋譜
   *
   * @param {string} pageUrl
   * @param {Function} cb
   * @returns {object}
   */
  this.getPageChess = function (pageUrl, cb) {
    // pageUrl 如 shownews.asp?id=2948
    return request({
      url: twGoUrl + pageUrl,
      //禁止使用預設編碼
      encoding: null
    }, function (error, response, body) {
      if (error) {
        return cb(error)
      }

      if(response.statusCode != 200) {
        return cb(error)
      }

      if (!error && response.statusCode == 200) {
        var body = iconv.decode(body, 'big5');
        var page = 0;
        var $ = cheerio.load(body)

        var src = $('#mainFrame').attr('src')

        // 把show.asp?qpfile=uploadfile/2016-12/20-57582.htm 修正為
        // http://www.taiwango.org.tw/12/uploadfile/2016-12/20-57582.htm
        // 這邊fileUrl會像uploadfile/2016-12/20-57582.htm
        var fileUrl = src.replace(/.*qpfile=(.*)/g, '$1')

        // var chessBaseUrl = 'http://www.taiwango.org.tw/12/'
        // var fixedUrl = chessBaseUrl + fileUrl
        // console.log(fixedUrl)

        return getRealChess(fileUrl)
      }
    })

    function getRealChess(fileUrl){
      var chessBaseUrl = 'http://www.taiwango.org.tw/12/'
      return request({
        url: chessBaseUrl + fileUrl,
        //禁止使用預設編碼
        encoding: null
      }, function (error, response, body) {
        if (error) {
          return cb(error)
        }

        if(response.statusCode != 200) {
          return cb(error)
        }

        var body = iconv.decode(body, 'big5');
        // var page = 0;
        var $ = cheerio.load(body)
        var content = $.html()

        var contentObj = {
          content: content,
          url: pageUrl
        }

        return cb(null, contentObj)
      })
    }
  }

}
