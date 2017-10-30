module.exports = Object.freeze({
  database: process.env.MONGO_URL ? process.env.MONGO_URL : 'mongodb://localhost/acdh',
  folder_path: process.env.FOLDER_PATH ? process.env.FOLDER_PATH : 'programs'
})
