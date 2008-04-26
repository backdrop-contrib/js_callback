/* $Id$ */

-- SUMMARY --

JavaScript callback handler is an interim solution for high-performance querying of contents via AJAX/JavaScript until the Registry patch [1] has landed (D7?).

By copying the included js.php into the root directory of your Drupal installation, setting up clean URLs, and adding a Apache RewriteRule to your .htaccess file, modules are able to quickly query information from Drupal via JavaScript.
Apache bench example:
<code>
/index.php?q=js/mymodule/callback/arg1: 316 bytes: 2.24 [#/sec]: 446.846 [ms]
/js.php?q=js/mymodule/callback/arg1: 316 bytes: 16.84 [#/sec]: 59.371 [ms]
</code>

As seen above, this module assumes the path /js to be a generic JavaScript callback handler.  The 2nd argument must always be the name of the implementing module.

js.php rewrites the request from 'js/mymodule/callback/arg1' to 'mymodule_js_callback_arg1'.  If this callback function does not exist, the function is shortened by the last '_' argument until a callback function has been found.

Each module implementing a callback, needs also to register a corresponding menu path in hook_menu() to provide fallback functionality when js.php is not available:
<?php
$items[] = array(
  'path' => 'js/mymodule/callback',
  'callback' => 'mymodule_js_callback',
  'type' => MENU_CALLBACK,
);
?>

js.php bootstraps Drupal to DRUPAL_BOOTSTRAP_PATH and includes common.inc as well as locale.inc.  This means that url(), l(), and t() functions are available.  Theme functions and potentially required functions of other modules are, however, not available.  If required, additional modules can be loaded via drupal_load().  Since the session has been initialized, the global $user object is also available (but not fully loaded).

Please note that js.php does NOT perform access checks like Drupal's menu system.  If required, each callback function needs to do this on its own.

js.php outputs the returned result of the callback function through drupal_to_js().  Until a better solution has been found, each callback function should complete with the following lines:
<?php
  if ($_SERVER['PHP_SELF'] == '/index.php') {
    print drupal_to_js(array('data' => $output));
    exit;
  }
  else {
    return array('data' => $output);
  }
?>

[1] http://drupal.org/node/221964

For a full description visit the project page:
  http://drupal.org/project/js
Bug reports, feature suggestions and latest developments:
  http://drupal.org/project/issues/js


-- REQUIREMENTS --

None.


-- INSTALLATION --

* Install as usual, see http://drupal.org/node/70151 for further information.

* Copy js.php to the root directory of your Drupal installation.

* Enable clean URLs.

* Add the following lines *in front of* the existing RewriteRules in your
  .htaccess file:

  # Rewrite JavaScript callback URLs of the form 'js.php?q=x'.
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_URI} ^\/js\/.*
  RewriteRule ^(.*)$ js.php?q=$1 [L,QSA]


-- CONFIGURATION --

None.


-- CONTACT --

Current maintainers:
* Daniel F. Kudwien (sun) - dev@unleashedmind.com

This project has been sponsored by:
* UNLEASHED MIND
  Specialized in consulting and planning of Drupal powered sites, UNLEASHED
  MIND offers installation, development, theming, customization, and hosting
  to get you started. Visit http://www.unleashedmind.com for more information.

