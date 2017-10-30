'use strict'
const path = require('path')
// Set module root directory and define a custom require function
require('app-module-path').addPath(path.join(__dirname, 'app'))

// Module dependencies
const async = require('async')
const mongo = require('mongodb').MongoClient

const winston = require('winston')
const applicationStorage = require('core/application-storage')
const downloader = require('core/downloader')

// Load config file
applicationStorage.config = require('config/config.js')

async.waterfall([
  function (callback) {
    applicationStorage.logger = new (winston.Logger)({
      level: applicationStorage.config.log_level,
      transports: [new (winston.transports.Console)({handleExceptions: true})]
    })

    applicationStorage.logger.info('Logger initialized')
    callback()
  },
  function (callback) {
    mongo.connect(applicationStorage.config.database, function (error, db) {
      applicationStorage.logger.info('Mongo connected')
      applicationStorage.mongo = db
      callback(error)
    })
  },
  function (callback) {
    downloader.start(function (error) {
      callback(error)
    })
  },
  function (callback) {
    applicationStorage.logger.info('End acdh-mp3-downloader')
    callback()
  }
], function (error) {
  if (error) { console.error(error) }
  process.exit()
})

module.exports.config = applicationStorage.config
