'use strict'

const async = require('async')
const fs = require('fs')
const request = require('request')
const path = require('path')
const ObjectID = require('mongodb').ObjectID

const applicationStorage = require('core/application-storage')

module.exports.start = function (callback) {
  const config = applicationStorage.config
  const logger = applicationStorage.logger
  const collection = applicationStorage.mongo.collection('programs')

  async.waterfall([
    function (callback) {
      collection.find({url: {$regex: '^http.*mp3$'}}, {url: 1}).toArray(function (error, programs) {
        callback(error, programs)
      })
    },
    function (programs, callback) {
      async.eachSeries(programs, function (program, callback) {
        async.series([
          function (callback) {
            logger.info('Start download of %s to %s', program.url, program._id + '.mp3')
            download(program.url, path.join(config.folder_path, program._id + '.mp3'), function (error) {
              callback(error)
            })
          },
          function (callback) {
            collection.updateOne({_id: ObjectID(program._id)}, {
              $set: {
                url: program._id + '.mp3',
                url_cdn: program.url
              }
            }, function (error) {
              callback(error)
            })
          }
        ], function (error) {
          if (error) { logger.error(error.message) }
          callback()
        }
        )
      }, function () {
        callback()
      })
    }
  ], function (error) {
    callback(error)
  }
  )
}

const download = function (url, dest, callback) {
  request
    .get(url)
    .on('error', function (error) {
      callback(error)
    })
    .on('response', function (response) {
      if (response.statusCode === 200) {
        response.pipe(fs.createWriteStream(dest).on('finish', function (error) {
          callback(error)
        }))
      } else {
        callback(new Error('Error HTTP ' + response.statusCode + ' on fetching ' + url))
      }
    })
}
