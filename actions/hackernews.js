'use strict'
function getNextPage (phantomInstance, activePage) {
  return new Promise(function (resolve) {
      phantomInstance
        .open('https://news.ycombinator.com/best?p=' + activePage)

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
          //TODO: this function is too long. Can you split it to make it more readable?
          // Post output array
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
            return num > 0 ? num : 'Not valid: ' + num
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
            // TODO: Can you use element.next() and avoid checking for odd / even rows?
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
          resolve({posts, activePage: activePage, date: new Date()})
        })
  })
}

module.exports = function (phantomInstance, count) {
  return new Promise(function (resolve) {
    var allPages = []
    var checkIsResolved = function (result) {
      if (result.activePage < count) {
        allPages = allPages.concat(result.posts)
        getNextPage(phantomInstance, result.activePage + 1)
          .then(checkIsResolved)
      } else {
        allPages = allPages.concat(result.posts)
        resolve(allPages)
      }
    }

    getNextPage(phantomInstance, 1)
      .then(checkIsResolved)
  })
}

