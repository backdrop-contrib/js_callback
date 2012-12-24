------------------------------------------------------------------------------
  js module Readme
  http://drupal.org/project/js
------------------------------------------------------------------------------

Contents:
=========
1. ABOUT
2. PERFORMANCE
3. TECHNICAL
4. INSTALLATION
5. CREDITS
6. MODULE DEVELOPER API

1. ABOUT
========

JavaScript callback handler improves your server performance by reducing
Drupal's bootstrap logic and bypassing as much as possible of the
very complex standard functionality. This is typically desired for tiny
requests like (but not limited to) AJAX, JSON, XML which often do not
expect much more response than a few bytes.

This module does not provide any additional functionality to site builders
or site users but is intended as an API for module developers who want
to speed up their modules as much as possible - and this is what this
module is all about.

Thus, only install this module if another module leverages its functionality
and instructs you to do so.

2. PERFORMANCE
==============

Some example Apache benchmarks speak for theirselves:

Using index.php as usual:
  ab -n20 -c1 http://example.com/index.php?q=js/mymodule/callback
  Requests per second: 2.24 [#/sec] (mean)
  Time per request:    446.846 [ms] (mean)

Using js.php:
  ab -n20 -c1 http://example.com/js.php?q=js/mymodule/callback
  Requests per second: 16.84 [#/sec] (mean)
  Time per request:    59.371 [ms] (mean)

For a full description visit the project page:
  http://drupal.org/project/js
Bug reports, feature suggestions and latest developments:
  http://drupal.org/project/issues/js

3. TECHNICAL
============

The included js.php partially takes over control from Drupal's index.php,
this is why it needs to be placed in the same directory, the Drupal root,
that is. It will still not work unless you set up clean URLs and modify
the default Drupal .htaccess file.

With all these changes made, the callback handler will catch all paths
starting with "js/" or "jsx/" and pass them to a reduced loader instead of the
default index.php file. As it invokes only the explicitely defined
dependencies instead of a complete Drupal load, it saves lots of processing
time and thus speeds up especially small Ajax requests.


4. INSTALLATION
===============

1. Install the module as usual.
2. Visit the configuration page, then go to "JS callback handler" in the
   system configuration list.
3. You can now either download and manually save the js.php file
   to your Drupal root or let the module try to put it there directly.
   (Existing files will not be overwritten unless they are marked
   as "auto-generated", so no custom changes would be lost at any time.)
4. Check the ".htaccess" section on the configuration page to find out
   how you need to modify the .htaccess file in your Drupal root.
5. Enable the "clean url" feature, unless you have already done so.


5. CREDITS
==========

Project page: http://drupal.org/project/js

- Drupal 7 -

Authors:
* David Herminghaus (doitDave) - http://drupal.org/user/833794
* Michiel Nugter (michielnugter) - http://drupal.org/user/1023784

The Drupal 7 update has been sponsored by SYNETIC
Full service Drupal specialist. From custom made webapplications to content
management systems, intranet and e-commerce shops. Visit http://www.synetic.nl
for more information.

- Drupal 6 -

Authors:
* Daniel F. Kudwien (sun) - http://drupal.org/user/54136
* Stefan M. Kudwien (smk-ka) - http://drupal.org/user/48898

The Drupal 6 version has been sponsored by UNLEASHED MIND
Specialized in consulting and development of Drupal powered sites, our services
include installation, development, theming, customization, and hosting to
get you started.


6. MODULE DEVELOPER API
=======================

A. BASIC WORKFLOW
The additional code in .htaccess an js.php catches page requests before Drupal
can handle them the default way. By that, these requests do not reach the
standard menu system anymore. To determine which callbacks should be
catched and to process them properly, their paths need to follow a certain
pattern.

While http://site/somecallback/1234/someparameter (Drupal internal path
equivalents "site/somecallback/1234/someparameter") would bypass the callback
handler and reach the standard menu systems. On a site without JS callback
enabled, the following paths would also reach the menu system like usual:

http://site/js/yourmodule/somecallback
http://site/jsx/yourmodule/somecallback/1234/someparameter/%/somemoreparam

As soon as you enable the callback handler, the two latter ones would match
the regex pattern '^jsx?/' (starting with "js/" or "jsx/") defined in .htaccess
and would be passed to js.php for special treatment.

B. CALLBACK VARIANTS
As you have noticed, the basic pattern allows for two initial path arguments,
"js" and "jsx".

The difference between these two is that "js/" only
performs very basic functions and checks and is not only 100% compatible to
older hook_js implementations but also is the one with the highest performance
potential and thus is ideal for very basic tasks like "pings" etc. which do not
require many access checks or complicated menu logic. It will be referred to
as the "performance callback".

The second one, "jsx/" allows for a lot of additional features like wildcard
paths, callback names including slashes etc. (see below for details). We will
refer to it as the "extended callback".

C. CALLBACK PATH PATTERNS
The way you design your callback paths determines their individual workflows.

aa) Performance callback
    The performance callback path must at least consist of the following
    parts (example 1):

      http://site/js/easypicture/list
                        ^           ^
           module name -|           |
                     callback name -|

    This very simple request would load the fictional module "easypicture"
    and call the callback function that is assigned to the callback "list".
    (You will soon learn how to define callback functions.)
    If you defined it in hook_menu(), which is always highly recommended
    as a fallback function if the JS callback is not active, it would match
    the menu path 'js/easypicture/list'.

    It may, however, also look like this (example 2):

      http://site/js/easypicture/rename/oldname/newname
                        ^           ^      ^       ^
           module name -|           |      |       |
                     callback name -|      |       |
                               argument 1 -|       |
                                       argument 2 -|

    The hook_menu equivalent for this example would, again, be
    'js/easypicture/delete'. The request would call the defined callback
    function, but also pass it the two arguments.

bb) Extended callback
    The extended callback in its least version may look identical to
    example 1, but would unnecessarily waste performance so in simple
    cases, always use the performance callback.
    As soon as you need additional functionality like access checks
    (similar to the way the Drupal menu system works), the extended callback
    will unfold his powers (example 3):

      http://site/jsx/easypicture/paint/1234567/forms/circle/red/solid
                       ^          ===================  ^      ^    ^
                       |                  ^            |      |    |
          module name -|                  |            |      |    |
             callback name with wildcard -|            |      |    |
                                           argument 1 -|      |    |
                                                  argument 2 -|    |
                                                       argument 3 -|

    This request would match the menu path 'jsx/easypicture/paint/%/forms'
    and pass either array('circle', 'red', 'solid') or, if you define
    'page arguments' (see below), probably just array('circle').

D. CALLBACK DEFINITIONS
As the callback handler cannot know how you want to deal with a request
that matches a certain js(x)/module/callback pattern, you need to inform
it about that. This is done by implementing hook_js() which is defined
by this module (see js.api.php for an example and descriptions).

Your module's hook_js() implementation should return a keyed array. These
keys represent the callback names (see above), and their values offer you
a lot of configuration options.

Sticking to our three examples, your hook_js() implementation would
look like this:

  /**
   * Implements hook_js().
   */
  function easypicture_js() {
    return array(
      'list' => array(
        // Settings for list callback.
      ),
      'rename' => array(
        // Settings for rename callback.
      ),
      'paint/%/forms' => array(
        // Settings for the "paint forms on some canvas" callback.
      ),
    );
  }

E. CALLBACK SETTINGS
Now that you got the big picture, you can easily add the settings for each
of your callbacks. There is only one required setting, that is 'callback'
and determines the function to be called by a matching request.

For example 1 and 2, this could look like:

  /**
   * Implements hook_js().
   */
  function easypicture_js() {
    return array(
      'list' => array(
        'callback' => 'easypicture_list',
      ),
      'rename' => array(
        'callback' => 'easypicture_rename',
        'bootstrap' => DRUPAL_BOOTSTRAP_SESSION,
        'includes' => array('path'),
        'dependencies' => array('node'),
      ),
    );
  }

So the request to http://site/js/easypicture/list would result in loading
the easypicture module and executing the easypicture_list(); function.
Requesting http://site/js/easypicture/rename/oldname/newname would execute
easypicture_rename('oldname', 'newname');.

Example 3 uses the extended callback and needs some more information:

  /**
   * Implements hook_js().
   */
  function easypicture_js() {
    return array(
      'paint/%/forms' => array(
        'callback' => 'easypicture_paint_forms',
        'bootstrap' => DRUPAL_BOOTSTRAP_SESSION,
        'page arguments' => array(1),
        'access callback' => 'easypicture_access',
        'access arguments' => array('paint forms'),
        'file' => 'easypicture.paint.inc',
        'dependencies' => array('node', 'imagetools'),
      ),
    );
  }

With this declaration, calling
http://site/jsx/easypicture/paint/1234567/forms/circle/red/solid would result
in executing easypicture_paint_forms('circle');, but only if the user has
permissions to 'paint forms'.

The possible callback settins in detail:

aa) Both "performance" and "extended" callback:
    'callback'
      (Required) The name of the function that will be executed.
    'bootstrap'
      (Optional) The required Drupal bootstrap level. Note that
      DRUPAL_BOOTSTRAP_DATABASE is the default bootstrap level which
      will be executed anyway.
      See http://api.drupal.org/api/drupal/includes!bootstrap.inc/function/drupal_bootstrap/7
      for more information.
    'includes'
      (Optional) Loads include files which are not part of the defined
      bootstrap level. Recommended if DRUPAL_BOOTSTRAP_FULL is much too much
      but e.g. DRUPAL_BOOTSTRAP_SESSION misses a certain include who's
      functions are needed for your callback, directly or indirectly.
    'dependencies'
      (Optional) If your module depends on other modules to work,
      you need to declare that here.

bb) Extended callback only:
    'file'
      (Optional) The file that holds the callback function; not necessary if
      the function is in the module file.
    'access arguments'
      (Optional) Permission keys that will be checked by the access callback.
      You can use the same keys as you would e.g. in hook_menu().
    'access callback'
      (Optional) Permission callback. If not defined, the standard callback
      (user_access) will be used.
    'page arguments'
      (Optional) If defined, only selected arguments will be passed to
      the callback function. In example 3, this would result in only
      passing the 'circle' argument to the callback function, instead
      of 'circle', 'red' and 'solid' if 'page arguments' is not defined.

!IMPORTANT!
As you see, there is no acess check in the performance callback.
Thus, if you need to restrict access, you either need to implement an access
check in your callback function, or you should use the extended callback.

F. FALLBACK
You will never know if a site builder is willing or able to follow your
recommendation to install the JS callback handler. So you want to make sure
that he can use your module as well in a standard Drupal environment.

To achieve this, you still should also declare your callbacks the official
way, that is using hook_menu(). Don't worry about interfering callback paths:
Your callback functions will never be called twice if you follow this advice,
because your .htaccess settings will not let the request reach the menu system.

G. FULL EXAMPLE
To help you understanding our API, here is once again all you need to do to
make the three example callbacks from above work properly:

aa) Implement hook_menu()

    /**
     * Implements hook_menu().
     */
    function easypicture_menu() {
      $items['js/easypicture/list'] = array(
      	'page callback' => 'easypicture_list',
      	'access callback' => TRUE,
      	'type' => MENU_CALLBACK,
      );
      $items['js/easypicture/rename/%/%'] = array(
      	'page callback' => 'easypicture_rename',
      	'page arguments' => array(3, 4),
      	'access callback' => TRUE,
      	'type' => MENU_CALLBACK,
      );
      $items['jsx/easypicture/paint/%/forms/%'] = array(
      	'page callback' => 'easypicture_paint_forms',
      	'file' => 'easypicture.paint.inc',
      	'page arguments' => array(5),
      	'access callback' => 'easypicture_access',
      	'access arguments' => array('paint forms'),
      	'type' => MENU_CALLBACK,
      );
      return $items;
    }

bb) Implement hook_js()
    /**
     * Implements hook_js().
     */
    function easypicture_js() {
      return array(
        'list' => array(
          'callback' => 'easypicture_list',
        ),
        'rename' => array(
          'callback' => 'easypicture_rename',
          'bootstrap' => DRUPAL_BOOTSTRAP_SESSION,
          'includes' => array('path'),
          'dependencies' => array('node'),
        ),
        'paint/%/forms' => array(
          'callback' => 'easypicture_paint_forms',
          'bootstrap' => DRUPAL_BOOTSTRAP_SESSION,
          'page arguments' => array(1),
          'access callback' => 'easypicture_access',
          'access arguments' => array('paint forms'),
          'file' => 'easypicture.paint.inc',
          'dependencies' => array('node', 'imagetools'),
        ),
      );
    }

cc) Declare your callback functions

    /**
     * List all picture.
     */
    function easypicture_list() {
      // Your code.
    }
    /**
     * Rename pictures.
     */
    function easypicture_rename($old, $new) {
      if (user_access('rename pictures')) {
        // Your code.
      }
    }
    /**
     * Paint forms.
     */
    function easypicture_paint_forms($type) {
      // Your code.
    }

dd) Remember to use the right callback path in your Javascript etc.
    /**
     * Retrieve a list of all pictures.
     */
    retrieveList: function() {
      $.ajax({
        url: Drupal.settings.basePath + 'js/easypicture/list',
        // Your parameters etc.
      });
    },
    /**
     * Rename a picture.
     */
    retrieveList: function() {
      $.ajax({
        url: Drupal.settings.basePath + 'js/easypicture/rename/' + oldName + '/' + 'newName',
        // Your parameters etc.
      });
    }
    /**
     * Paint a circle.
     */
    paintCircle: function() {
      $.ajax({
        url: Drupal.settings.basePath + 'jsx/easypicture/paint/' + paintId + '/forms/circle',
        // Your parameters etc.
      });
    }

H. HANDLING HINTS
As stated above, js.php bootstraps Drupal to DRUPAL_BOOTSTRAP_DATABASE and
includes the following inc files: bootstrap.inc, common.inc, locale.inc,
module.inc, path.inc, unicode.inc, this means that url(), l(), and t() functions
are available (t() lacks translation though, since that would require
locale.module to be loaded. This can be easily "fixed" by adding locale to the
dependencies array). Theme functions and potentially required functions of
other modules, however, are not available by default, which is the main reason
for the speed gain of js.php.

aa) Includes and dependencies
    The js handler loads the least amount of code to function. This has the
    effect that not all modules are loaded that might be required to make your
    callback work. For example, when the overlay module is enabled the user
    module needs to be enabled because it uses the user_access method.
    This can be fixed using the option dependencies or includes. If your
    callback throws an error indicating it's missing a function, include
    the module or include file in these options and do this untill all
    errors are resolved.

bb) Access checks
    By default the js module doesn't peform any kind of access check.
    Limited access checks are supported by using the extended callback
    and defining the access arguments and (optionally) the access callback.

    The access arguments are passed to the access callback. The access
    arguments implementation is very basic and does not support dynamic
    arguments. The variables here are passed through as provided. The
    access callback is the function that will be called to verify if the
    user has access to the callback. The access callback is optional
    and defaults to user_access.

F. PERFORMANCE NOTES
The js module automatically bootstraps to DRUPAL_BOOTSTRAP_SESSION
when an access callback or access arguments are provided. This has a negative
impact on the performance. If you don't need access checks, don't provide the
options in the callback or use the "performance callback" ("js/").

aa) Output
    js.php outputs the return value of the callback function using
    drupal_json_output(). To use a custom output format, output the data
    on your own and exit() afterwards, or simply return nothing.
