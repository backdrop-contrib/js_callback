<?php

/**
 * @file
 *
 * This file contains no working PHP code; it exists to provide additional
 * documentation for doxygen as well as to document hooks
 * in the standard Drupal manner.
 */

/**
 * Register JS callbacks.
 *
 * @return array
 *   An array of callbacks with configuration keys.
 *
 * @see readme.txt
 */
function hook_js() {
  return array(
    'somefunction' => array(
      'callback' => 'example_somefunction',
      'includes' => array('includefile1', 'includefile2'),
      'dependencies' => array('module1', 'module2'),
      'bootstrap'    => DRUPAL_BOOTSTRAP_CONSTANT,
      // The following items only apply to the extended callback
      'file'         => 'includes/example.inc',
      'access arguments' => array('e.g. permission'),
      'access callback'  => 'callback function'
    ),
  );
}
