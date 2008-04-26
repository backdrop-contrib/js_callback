<?php
// $Id$

/**
 * @file
 * Callback page that serves custom JavaScript requests on a Drupal installation.
 */

/**
 * @name JavaScript callback status codes.
 * @{
 * Status codes for JavaScript callbacks.
 */

define('JS_FOUND', 1);
define('JS_NOT_FOUND', 2);
define('JS_ACCESS_DENIED', 3);
define('JS_SITE_OFFLINE', 4);

/**
 * @} End of "Menu status codes".
 */

require_once './includes/bootstrap.inc';
drupal_bootstrap(DRUPAL_BOOTSTRAP_PATH);
require_once './includes/common.inc';
require_once './includes/locale.inc';

// Rewrite query path from 'js/module/...' to 'module/js/...'.
$args = explode('/', $_GET['q']);
array_shift($args);
$module = array_shift($args);
$callback = $module .'_js_'. implode('_', $args);

// @todo Use a variable to cache alle modules that implement /js/* menu paths.
//   Alternatively, cache all hook_js() implementations in a variable.
drupal_load('module', $module);

// Determine the callback function.
while ($callback && !function_exists($callback)) {
  $callback = substr($callback, 0, strrpos($callback, '_'));
}

// Determine callback arguments.
$arguments = array();
$arg = substr($_GET['q'], strlen($callback) + 1);
if (strlen($arg)) {
  $arguments = array_merge($arguments, explode('/', $arg));
}

if ($path !== '' && function_exists($callback)) {
  $return = call_user_func_array($callback, $arguments);
}
else {
  $return = JS_NOT_FOUND;
}

// Menu status constants are integers; page content is a string.
if (is_int($return)) {
  drupal_bootstrap(DRUPAL_BOOTSTRAP_FULL);
  switch ($return) {
    case JS_NOT_FOUND:
      drupal_not_found();
      break;
    case JS_ACCESS_DENIED:
      drupal_access_denied();
      break;
    case JS_SITE_OFFLINE:
      drupal_site_offline();
      break;
  }
}
elseif (isset($return)) {
  // Print any value (including an empty string) except NULL or undefined:
  print drupal_to_js($return);
}

/**
 * l() calls check_url(), which needs to check for XSS attacks.
 */
function filter_xss_bad_protocol($string, $decode = TRUE) {
  static $allowed_protocols;
  if (!isset($allowed_protocols)) {
    $allowed_protocols = array_flip(variable_get('filter_allowed_protocols', array('http', 'https', 'ftp', 'news', 'nntp', 'telnet', 'mailto', 'irc', 'ssh', 'sftp', 'webcal')));
  }

  // Get the plain text representation of the attribute value (i.e. its meaning).
  if ($decode) {
    $string = decode_entities($string);
  }

  // Iteratively remove any invalid protocol found.

  do {
    $before = $string;
    $colonpos = strpos($string, ':');
    if ($colonpos > 0) {
      // We found a colon, possibly a protocol. Verify.
      $protocol = substr($string, 0, $colonpos);
      // If a colon is preceded by a slash, question mark or hash, it cannot
      // possibly be part of the URL scheme. This must be a relative URL,
      // which inherits the (safe) protocol of the base document.
      if (preg_match('![/?#]!', $protocol)) {
        break;
      }
      // Per RFC2616, section 3.2.3 (URI Comparison) scheme comparison must be case-insensitive.
      // Check if this is a disallowed protocol.
      if (!isset($allowed_protocols[strtolower($protocol)])) {
        $string = substr($string, $colonpos + 1);
      }
    }
  } while ($before != $string);
  return check_plain($string);
}

