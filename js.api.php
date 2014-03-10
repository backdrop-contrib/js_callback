<?php
/**
 * @file
 *
 * This file contains no working PHP code; it exists to provide additional
 * documentation for doxygen as well as to document hooks in the standard Drupal 
 * manner.
 */

/**
 * Register JS callbacks. Read the documentation for a detailed explanation.
 *
 * @return array
 *   An associative array of callbacks where the key indicates name of the path
 *   callback that the info should be loaded. The value of each path callback
 *   is also an associative array containing the following possible keys:
 *   - callback: (required) The function to call to display the results when an
 *     ajax call occurs on this path.
 *   - callback arguments: (optional) Select which arguments from the URL to
 *     pass to the callback. Starting with 0 with the js/[module] stripped from
 *     the path. Please note that 0 will contain the used callback.
 *   - access callback: (optional) The function to invoke for determining
 *     access to the callback. If set, the minimum bootstrap level must be
 *     DRUPAL_BOOTSTRAP_SESSION to ensure proper access validation against the
 *     current user. WARNING: If not set, no access checks are performed at all.
 *     Defaults to "user_access" if the below option (access arguments) has
 *     a value.
 *   - access arguments: (optional) Arguments for the access callback.
 *   - delivery callback: (optional) The function to call to package the results
 *     of the callback function and send it to the browser. Defaults to
 *     js_deliver_json(). Note that this function is called even if the
 *     access checks fail, so any custom delivery callback function should take
 *     that into account. See js_deliver_json() for an example.
 *   - bootstrap: (optional) The bootstrap level Drupal should boot to,
 *     defaults to DRUPAL_BOOTSTRAP_DATABASE. If an access argument/callback or
 *     tokens are used, defaults to DRUPAL_BOOTSTRAP_SESSION.
 *   - includes: (optional) Load additional files from the /includes directory,
 *     without the extension.
 *   - dependencies: (optional) Load additional modules for this callback.
 *   - file: (optional) The file where the callback function is defined.
 *   - path: (optional) The path where the callback function is defined.
 *   - skip_hook_init: (optional) Set to TRUE to skip the init hooks. Warning:
 *     This might cause unwanted behavior and should only be disabled with care.
 *   - i18n: (optional) Boolean to enable or forcefully disable i18n. JS auto-
 *     detects the language string in the path but not in any other form. Set
 *     this option to TRUE to enable translations.
 *   - process post: (optional) Process $_POST data and provide them as matched
 *     arguments against the callback's parameter names (or as a single $data
 *     parameter). Defaults to TRUE. If unsure what this does, it's best to
 *     just leave this enabled. See js_process_post_data() for more information.
 *   - token: (optional) Use tokens to prevent CSRF attacks. When enabled, the
 *     minimum bootstrap level must be DRUPAL_BOOTSTRAP_SESSION to ensure
 *     proper token validation against the current user. It is strongly
 *     recommended that this is not disabled, otherwise your site will be
 *     susceptible to CSRF attacks and be considered "insecure".
 */
function hook_js() {
  return array(
    'path_callback' => array(
      'callback' => '',
      'callback arguments' => array(),
      'access callback'  => '',
      'access arguments' => array(),
      'delivery callback' => 'js_deliver_json',
      'bootstrap' => DRUPAL_BOOTSTRAP_DATABASE,
      'includes' => array(),
      'dependencies' => array(),
      //'skip_hook_init' => TRUE,
      //'i18n' => TRUE,
    ),
  );
}
