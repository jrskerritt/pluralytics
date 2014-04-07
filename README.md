pluralytics
========

Pluralytics is an Express.js application that allows you to feed live traffic numbers from multiple Google Analytics realtime pages into a single page. It displays the current traffic for each website along with an aggregated total and a graph of the total traffic over time.


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
node pluralytics
```


Create and run the bookmarklet
------------------------------

In your browser, create a bookmark that contains the content of `bookmarklet.txt`. Open the realtime page on Google Analytics for any site and run the bookmarklet. This should begin polling traffic numbers to `http://localhost:9132`. If you want to poll to a different url, change it in the bookmark, reload the realtime page, and re-run the bookmarklet.
