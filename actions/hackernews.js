'use strict'
function getNextPage (phantomInstance, page, count, callback) {
  if (!page || typeof page !== 'number') {
    throw 'You must specify a url to gather data'
  }
  
  phantomInstance
      .open('https://news.ycombinator.com/best?p=' + page)

      // Optionally, determine the status of the response
      .status()
      .then(function (statusCode) {
        // console.log('HTTP status code: ', statusCode)
        if (Number(statusCode) >= 400) {
          throw 'Page failed with status: ' + statusCode
        }
      })
      // Interact with the page. This code is run in the browser.
      .evaluate(function () {
        // Post output arrau
        var result = []
        // Find table container
        var page = document.getElementsByClassName('itemlist')
        // Url validation
        var validURI = function (uri) {
          var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
          return regexp.test(uri) ? uri : 'URI is not valid: ' + uri
        }
        // Points, comments, rank validation
        var isPositiveNumber = function (num) {
          return num > 0 ? num : null
        }
        // Author, title validation
        var validString = function (str) {
          return (typeof str === 'string' && str.length > 0 && str.length < 256) ? str : 'Not valid: ' + str
        }
        // Parsing page elements
        for (var i = 0; i < page.length; i++) {
          var table = page[i].querySelector('tbody')
          var id = table.querySelectorAll('.athing')
          var subtext = table.querySelectorAll('.subtext')
          var titleElemnt = Array.prototype.slice.call(table.querySelectorAll('.title'))
          var titleList = titleElemnt.filter(function (elem, ind) {
            return ind % 2 !== 0
          })
          var rankList = titleElemnt.filter(function (elem, ind) {
            return ind % 2 === 0
          })

          if (table) {
            for (var j = 0; j < id.length; j++) {
              result.push({
                uri: validURI(titleList[j].children[0].href),
                title: validString(titleList[j].children[0].textContent),
                points: isPositiveNumber(parseInt(subtext[j].children[0].textContent)),
                author: validString(subtext[j].children[1].textContent),
                comments: isPositiveNumber(parseInt(subtext[j].children[4].textContent)),
                rank: isPositiveNumber(parseInt(rankList[j].children[0].textContent))
              })
            }
          }
        }
        return result
      })
      .then(function (posts) {
        callback(posts, page)
        if (page < count) {
          getNextPage(phantomInstance, page + 1, count, callback)
        }
      })
}

module.exports = function (phantomInstance, count, callback) {
  var allPosts = []
  return getNextPage(phantomInstance, 1, count, function (posts, page) {
    console.log(page)
    console.log(posts)

    allPosts = allPosts.concat(posts)
    if (page > count) {
      callback(allPosts)
    }
  })
}
