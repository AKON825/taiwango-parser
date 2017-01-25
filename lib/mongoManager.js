module.exports = MongoManager

var path = require('path')
var async = require('async')
var base64Img = require('base64-img');
var moment = require('moment')
var MongoClient = require('mongodb').MongoClient

function MongoManager (mongoUrl) {
  if (!(this instanceof MongoManager)) {
    return new MongoManager(mongoUrl)
  }

  //todolist: 改用mongoose操作, 並導入model

  this.findMongo = function (collName, whereObj, fieldObj, cb) {
    return MongoClient.connect(mongoUrl, function(err, db) {
      if(err) {
        console.log('mongo連線錯誤：', err)

        return cb(err)
      }

      var collection = db.collection(collName);

      return collection.find(
        whereObj,
  　     fieldObj
      ).toArray(function(err, docs) {
        if(err) {
          console.log('搜尋資料庫錯誤')
          return cb(err)
        }

        db.close()

        return cb(null, docs)
      })
    })
  }

  this.findMongoLimit = function (collName, whereObj, fieldObj, limitNum, skipNum, cb) {
    return MongoClient.connect(mongoUrl, function(err, db) {
      if(err) {
        console.log('mongo連線錯誤：', err)

        return cb(err)
      }

      var collection = db.collection(collName)

      limitNum = parseInt(limitNum)
      skipNum = parseInt(skipNum)

      return collection.find(
        whereObj,
  　    fieldObj
      ).limit(limitNum).skip(skipNum).toArray(function(err, docs) {
        if(err) {
          console.log('搜尋資料庫錯誤')
          return cb(err)
        }

        db.close()

        return cb(null, docs)
      })
    })
  }

  this.saveToMongo = function (collName, objAry, cb) {
    // 連線到mongo並存入物件
    return MongoClient.connect(mongoUrl, function(err, db) {
      if(err) {
        console.log('mongo連線錯誤：', err)

        return cb(err)
      }

      // 要設定要存入的collection -
      // Get the documents collection
      var collection = db.collection(collName);
      // Insert some documents
      return collection.insertMany(objAry, function(err, result) {

        if(err) {
          console.log('輸入資料庫錯誤')
          return cb(err)
        }

        console.log(result.insertedCount, "筆資料輸入成功");

        db.close();

        return cb(null, result)

      });

    });
  }

  this.updateMongo = function (collName, whereObj, updateObj, cb) {
    // 連線到mongo並存入物件
    return MongoClient.connect(mongoUrl, function(err, db) {
      if(err) {
        console.log('mongo連線錯誤：', err)

        return cb(err)
      }

      // 要設定要存入的collection -
      var collection = db.collection(collName);

      return collection.updateOne(whereObj, { $set: updateObj }, function(err, result) {
        if(err) {
          console.log('修改資料庫錯誤')
          return cb(err)
        }

        //console.log(result.modifiedCount, "筆資料修改成功");

        db.close();

        return cb(null, result)
      });


    });
  }

  this.deleteMongo = function (collName, whereObj, cb) {
    // 連線到mongo並存入物件
    return MongoClient.connect(mongoUrl, function(err, db) {
      if(err) {
        console.log('mongo連線錯誤：', err)

        return cb(err)
      }

      console.log("Connected correctly to server");

      // 要設定要存入的collection -
      var collection = db.collection(collName);

      return collection.remove(whereObj, function(err, result) {
        if(err) {
          console.log('刪除資料錯誤')
          return cb(err)
        }

        db.close();

        return cb(null, result.result.n)
      });
    });
  }

  this.recordFetchResult = function (recordObj, cb) {
    var that = this
    // var recordObj = {
    //  collection: 'go_news_record',
    //  update: [
    //    {
    //      key: 'pre_exec_time',
    //      value: '20'
    //    },
    //    {
    //      key: 'pre_fetch_data_nums',
    //      value: '30'
    //    },
    //    {
    //      key: 'today_fetch_data_nums',
    //      value: '40'
    //    },
    //  ]
    // }

    // var recordObj = {
    //  collection: 'go_news_record',
    //  pre_exec_time: 0,
    //  pre_fetch_data_nums: 30,
    //  today_fetch_data_nums: 40,
    // }

    // 要補下次執行時間

    var toSaveObj = {}
    var date = moment().format('YYYY-MM-DD')

    toSaveObj.update_day = date

    if(recordObj.pre_exec_time !== null) {
      toSaveObj.pre_exec_time = recordObj.pre_exec_time
    }

    if(recordObj.pre_fetch_data_nums !== null) {
      toSaveObj.pre_fetch_data_nums = recordObj.pre_fetch_data_nums
    }

    if(recordObj.today_fetch_data_nums !== null) {
      toSaveObj.today_fetch_data_nums = recordObj.today_fetch_data_nums
    }

    var collection = recordObj.collection

    // 搜尋是否已建立record
    return that.findMongo(collection, {}, {}, function(err, docs){
      if(err) {
        return cb(err)
      }

      if(docs.length == 0) {
        // 若無執行record, 初始化資料
        if(!recordObj.pre_exec_time) {
          toSaveObj.pre_exec_time = 0
        }
        if(!recordObj.pre_fetch_data_nums) {
          toSaveObj.pre_fetch_data_nums = 0
        }
        if(!recordObj.today_fetch_data_nums) {
          toSaveObj.today_fetch_data_nums = 0
        }

        return that.saveToMongo(collection, [toSaveObj], function(err){
          if(err) {
            // 可能不要直接中斷, 先忽略
            return cb(err)
          }

          console.log(collection, 'record存入完成')
          return cb()
        })
      } else {
        return that.updateMongo(collection, {}, toSaveObj, function(err){
          if(err) {
            // 可能不要直接中斷, 先忽略
            return cb(err)
          }

          console.log(collection, 'record修改完成')
          return cb()
        })
      }
    })

  }

  /**
   * 回傳資料庫中的go content
   *
   * @param {string} pageUrl
   * @param {Function} cb
   * @returns {object}
   */
  this.getGoContent = function (pageUrl, cb) {

  }
}
