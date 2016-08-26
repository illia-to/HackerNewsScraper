'use strict'

/**
 * Package dependencies
 */
var Horseman = require('node-horseman')

var fs = require('fs')
var program = require('commander')

program
  .version('1.0.0')
  .option('-x --action-to-perform [string]', 'The type of action to perform.')
  .option('-p --posts  <n>', '', parseInt)
  .parse(process.argv)

/**
 * Path to the PhantomJS binary
 */
var PATH_TO_PHANTOM = '/usr/local/bin/phantomjs'

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
    phantomPath: PATH_TO_PHANTOM,
    loadImages: true,
    injectJquery: true,
    webSecurity: true,
    ignoreSSLErrors: true
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
  var performAction = require('./actions/' + program.actionToPerform)
  var phantomInstance = loadPhantomInstance()

  switch (program.actionToPerform) {
    case 'hackernews':
      var amountOfPosts = program.posts
      var postsOnPage = 30
      var iterationAmount = amountOfPosts / postsOnPage
      var pageAmount = ~~iterationAmount > 0 ? iterationAmount : 1
      var postList = []
      if (amountOfPosts > 0 && amountOfPosts <= 100) {
        performAction(phantomInstance, pageAmount, function (posts) {
          postList = posts.splice(0, amountOfPosts)
          console.log(postList)
          phantomInstance.close()
        })
      } else {
        console.log('Amout of posts is incorrect')
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
      console.log(err)
    } else {
      files.forEach(function (filename) {
        supportedActions.push(filename.split('.')[0])
      })
    }

    main()
  })
})()

