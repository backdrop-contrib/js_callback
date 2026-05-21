<?php

/**
 * @file
 * An optimized page execution used to serve JavaScript AJAX requests using a
 * minimally bootstrapped Backdrop installation.
 */

/**
 * Root directory of Backdrop installation.
 */
define('BACKDROP_ROOT', getcwd());

/**
 * Required core files needed to run any AJAX request.
 */
require_once BACKDROP_ROOT . '/core/includes/bootstrap.inc';
require_once BACKDROP_ROOT . '/core/includes/common.inc';
require_once BACKDROP_ROOT . '/core/includes/module.inc';
require_once BACKDROP_ROOT . '/core/includes/unicode.inc';
require_once BACKDROP_ROOT . '/core/includes/file.inc';

// Bootstrap Backdrop to at least the database level so it can be accessed.
backdrop_bootstrap(BACKDROP_BOOTSTRAP_DATABASE);

// Load the JS module and execute request.
backdrop_load('module', 'js');
js_execute_request();
