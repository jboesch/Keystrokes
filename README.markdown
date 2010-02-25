# Keystrokes for jQuery

A jQuery event for capturing key strokes and combo keys

http://boedesign.com/blog/2009/12/30/keystrokes-for-jquery/

## Change Log

### Changes in 2.0 (February 25, 2010)

* Made it compatible with jQuery 1.4.2 (now it does not work with versions lower than 1.4.2... sorry!)
* Automatically does not detect keyup/keydown events on inputs/textarea (unless you bind it directly to the input and are focused on it)
* Removed global.captureInputFields as a result ^

### Changes in 1.3 (February 12, 2010)

* Added "teardown" method to clean up data on the bound element.
* Using jQuery 1.4.1 from Google CDN in the example.

### Changes in 1.2 (January 25, 2010)

* Added default global setting to ignore key capturing when you're on an input/textarea element.  
* Added a new method to the data stack called 'customValidation'.

### Changes in 1.1 (January 24, 2010)

* Fixed bug: when you typed 'n' it matched 'enter', 'arrow down' and other reserved keywords.

### Changes in 1.0 (December 30, 2009)

* Launched!
