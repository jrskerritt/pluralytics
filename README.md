niche-rt
========

Niche's real-time traffic monitor


Installation
------------

Install node.js http://nodejs.org/

In the root of the repository, run:

```bash
npm install
```


Run the app
-----------

```bash
node app
```


Create and run the bookmarklet
------------------------------

In your browser, create a bookmark that contains the content of `bookmarklet.txt`. Open the realtime page on Google Analytics for any site and run the bookmarklet. This should begin polling traffic numbers to `http://localhost:9132`. If you want to poll to a different url, change it in the bookmark, reload the realtime page, and re-run the bookmarklet.
