# HackerNewsScraper

### Install

1. Download the Node.js source code or a pre-built installer for your platform [NodeJS](https://nodejs.org/en/download/). Current code is running version 5.7.0;
2. Download and install [phantomJS](http://phantomjs.org/download.html). In corrent code it is installed in ``` /usr/local/bin/phantomjs``` folder. If there is some difference change the path in ``` PATH_TO_PHANTOM = 'your path' ``` the app.js file.
3. Open terminal and navigate to the project folder
4. Run ``` npm i ``` in the project folder
5. To start run ``` node app.js -x hackernews --posts {nuber of posts} ```

### Libraries and packages
1. Node.js
2. Phantom.js (He runs the websites in a real browser, not only shows the user pages, and use scripts in Javascript instead of the user interface. Browser in PhantomJS so full that even a driver for Selenium for him)
3. Horseman.js (Phantom.js wrapper. Good choice for writing modules)
4. Commander (The best way to work with command line arguments)
