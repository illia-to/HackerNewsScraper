'use strict'

/**
 * Package dependencies
 */
var Horseman = require('node-horseman')

var fs = require('fs')
var program = require('commander')

program
  .version('1.0.0')
  .option('-x --scrape-posts [string]', 'The type of action to perform.')
  .option('-p --posts  <n>', '', parseInt)
  .parse(process.argv)

/**
 * Stores an array of actions support by this utility framework.
 * Populated on script load based on files present in the 'actions' directory
 */
var supportedActions = []

/**
 * Loads a Horseman instance to facilitate interaction with PhantomJS
 */
var loadPhantomInstance = function () {
  var options = {
    loadImages: true,
    injectJquery: true,
    webSecurity: true
  }

  var phantomInstance = new Horseman(options)

  phantomInstance.on('consoleMessage', function (msg) {
    // console.log('Phantom page log: ', msg);
  })

  phantomInstance.on('error', function (msg) {
    // console.log('Phantom page error: ', msg);
  })

  return phantomInstance
}

/**
 * Triggers execution of the appropriate action
 */
var main = function () {
  var performAction = require('./actions/' + program.scrapePosts)
  var phantomInstance = loadPhantomInstance()

  switch (program.scrapePosts) {
    case 'hackernews':
      var amountOfPosts = program.posts
      // TODO: is it necessary to hardcode the number of results per page?
      var postsOnPage = 30
      var iterationAmount = amountOfPosts / postsOnPage
      var pageAmount = Math.ceil(iterationAmount)
      var postList = []
      if (amountOfPosts > 0 && amountOfPosts <= 100) {
        performAction(phantomInstance, pageAmount)
          .then(function (posts) {
            postList = posts.splice(0, amountOfPosts)
            console.log(JSON.stringify(postList))
            phantomInstance.close()
          })
      } else {
        console.error('Amout of posts is incorrect')
        phantomInstance.close()
      }

      break

    default:
      phantomInstance.close()
      throw 'Invalid action specified. Supported actions include: ', supportedActions.join(', ')
  }
};

/**
 * Run immediately on script load to determine available actions and attempt to run the specified action
 */
(function () {
  // Generate an array of supported actions based on the files present in the 'actions' directory
  fs.readdir('./actions', function (err, files) {
    if (err) {
      console.error(err)
    } else {
      files.forEach(function (filename) {
        supportedActions.push(filename.split('.')[0])
      })
    }

    main()
  })
})()

