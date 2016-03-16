var _ = require('lodash')
var leasot = require('leasot')
var async = require('async')
var path = require('path')
var fs = require('fs')

module.exports = analyzeFiles

function analyzeFiles (filepaths, cb) {
  async.mapLimit(filepaths, 100, analyzeFile, function (err, results) {
    if (err) return cb(err)
    cb(null, _.flatten(results))
  })
}

function analyzeFile (filepath, cb) {
  fs.readFile(filepath, 'utf8', function (err, fileContent) {
    if (err) return cb(err)

    var ext = path.extname(filepath)
    var todos = leasot.parse({
      content: fileContent,
      ext: ext,
      fileName: filepath
    })

    todos.forEach(function (todo) {
      todo.ext = ext.replace(/^./, '')
      todo.context = getContext(fileContent.split('\n'), todo)
    })

    cb(null, todos)
  })
}

function getContext (lines, todo) {
  var begin = Math.max(todo.line - 10, 0)
  var end = Math.min(todo.line + 10, lines.length - 1)
  return {
    content: lines,
    begin: begin,
    partial: lines.slice(begin, end),
    line: todo.line - 1 - begin,
    end: end
  }
}
