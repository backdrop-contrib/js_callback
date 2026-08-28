# High-performance JavaScript Callback Handler

JavaScript callback handler is an interim solution for high-performance server
requests including (but not limited to) AHAH, AJAX, JSON, XML, etc.

Note: this module does nothing by itself. It requires other modules to leverage
its functionality and APIs.

### Namespace

This module's namespace is simply `js`, as inherited from the Drupal 7 project,
but the main folder has been renamed to `js_callback` because Backdrop skips
`js` as a folder name when looking for modules.

### Performance

Apache benchmarks speak for itself:

Using `index.php` as usual:

```bash
  ab -n20 -c1 http://example.com/index.php?q=js/mymodule/callback
  Requests per second: 2.24 [#/sec] (mean)
  Time per request:    446.846 [ms] (mean)
```

Using `js.php`:

```bash
  ab -n20 -c1 http://example.com/js.php?q=js/mymodule/callback
  Requests per second: 16.84 [#/sec] (mean)
  Time per request:    59.371 [ms] (mean)
```

### Technical

This module is mainly a conditional replacement for Backdrop's `index.php` based
on the default supported Apache `.htaccess` rewrite directives.

With `mod_rewrite` enabled (for "clean urls"), it catches all calls to callback
paths starting with `js/` and passes them to a reduced loader instead of
the default `index.php` file.

Invoking only the explicitly defined dependencies instead of a completely
bootstrapped Backdrop instance. It saves lots of processing time and thus speeds
up small Ajax requests.

## Installation

- Install this module using the [official Backdrop CMS instructions](https://backdropcms.org/guide/modules)

## Usage

* Enabling the module should have automatically copied the `js.php` file bundled
  with this module to the root directory of your Backdrop installation (the
  directory where your Backdrop `.htaccess` and `index.php` is located). If it
  did not, you will need to copy it manually.
* Go to the configuration page: `admin/config/system/js`.
* Choose the type of server rewrite rules to use.
* Copy the rewrite rules and then follow the instructions on where to paste
  them. If your server is not listed or you have a complex infrastructure setup,
  you will need to ensure that any request starting with `/js` is forwarded to
  the `js.php` file.

More detailed usage instructions can be
[viewed or edited in the Wiki](https://github.com/backdrop-contrib/js/wiki).

### Module Integration/API

Please read the `js.api.php` file and look at the `js_callback_examples`
sub-module for more information.

### Settings

There are a few settings that can be set in an appropriate `settings.php` (or
`settings.local.php`) file:

- `js_endpoint`: Configures the expected URL endpoint:
  ```php
  $settings['js_endpoint'] = 'js';
  ```
- `js_silence_php_errors`: Prevents custom JS module PHP error and exception
  handlers from being invoked. By default, this variable is not set and the
  JS module will automatically handle any PHP error or exception and display
  them (respecting the site's PHP error display configuration) as an error
  type status message via `backdrop_set_message()`. To disable this, use:
  ```php
  $settings['js_silence_php_errors'] = TRUE;
  ```
- `js_excluded_cache_classes`: This allows to configure a list of cache backend
  classes that should not trigger a full bootstrap on cache misses. By default
  it only includes the `BackdropFakeCache` class. To change this:
  ```php
  $settings['js_excluded_cache_classes'] = array('MyCustomCache');
  ```

## Issues

 - Bugs and Feature requests should be reported in the [Issue Queue](https://github.com/backdrop-contrib/js/issues).

## Current Maintainers

 - [Laryn Kragt Bakker](https://github.com/laryn).
 - Collaboration and co-maintainers welcome!

## Credits

 - Ported to Backdrop CMS by [Laryn Kragt Bakker](https://github.com/laryn).
 - Maintained for Drupal by [michielnugter](https://www.drupal.org/u/michielnugter),
   and [plach](https://www.drupal.org/u/plach).

 ## License

This project is GPL v2 software. See the LICENSE.txt file in this directory for
complete text.
