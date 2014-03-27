var JS = JS || {};

(function ($) {

  /**
   * A placeholder. This is initialized on DOM ready.
   */
  JS.messages = $();

  /**
   * The selector used to identify where messages are placed.
   *
   * The last selector found (in order of the DOM tree) will be used. Themes
   * can override this with a single specific selector if a guaranteed element
   * will be present.
   */
  JS.messagesSelector = 'body, #main, #content, #block-system-main, #messages';

  /**
   * DOM ready.
   */
  $(document).ready(function () {
    JS.messages = $('<div class="js-messages"></div>').prependTo($(JS.messagesSelector).last());
  });

  /**
   * Method for executing JS callback requests; wraps jQuery.ajax().
   *
   * @param {object} defaults
   *   The default option to pass to the jQuery.ajax request. Warning: these
   *   will override the default properties set in this method. The methods:
   *   "beforeSend", "error", "success" and "complete" will automatically be
   *   wrapped.
   */
  JS.ajax = function (defaults) {
    defaults = defaults || {};
    defaults.trigger = (defaults.trigger && $(defaults.trigger)) || $();

    // Don't allow the url to be overridden.
    var url = '';
    if (defaults.url) {
      url = defaults.url.replace(new RegExp('^(' + window.location.origin + ')?(' + Drupal.settings.basePath + ')', 'i'), '') || '';
      delete defaults.url;
    }

    // Redirect page immediately if URL is external.
    if (JS.isExternalLink(url)) {
      window.location = url;
      return;
    }

    // Normalize the URL to match an internal Drupal request.
    var ajax = $.extend({
      url: Drupal.settings.basePath + Drupal.settings.pathPrefix + 'js/' + url,
      type: 'GET',
      dataType: 'json',
      data: $.extend({
        // Send the current theme being used so returned results can be rendered
        // using the correct theme (if needed).
        js_theme: Drupal.settings.ajaxPageState.theme
      }, defaults.trigger.data()),
      defaults: defaults
    }, defaults);

    // Normalize data keys to Drupal variable standards.
    JS.snakeCaseObject(ajax.data);

    // Wrap the beforeSend method.
    ajax.beforeSend = function (xmlhttprequest, options) {
      this.ajaxing = true;
      this.redirecting = false;

      // Clear any current messages previous set from JS requests.
      JS.messages.html('');

      // Modify the trigger to show appropriate state.
      this.trigger
        .removeClass('error')
        .addClass('ajaxing disabled')
        .attr('disabled', 'disabled');

      // Execute passed "beforeSend" callback, if it exists.
      if (typeof(defaults.beforeSend) === 'function') {
        defaults.beforeSend.apply(this, [xmlhttprequest, options]);
      }
    };

    // Wrap the "error" callback.
    ajax.error = function (jqXHR, textStatus, errorThrown) {
      // Process JSON data, if present.
      JS.processJSON.apply(this, [jqXHR]);

      // Execute passed "error" callback, if not redirecting and it exists.
      if (!this.redirecting && typeof(defaults.error) === 'function') {
        defaults.error.apply(this, [jqXHR, textStatus, errorThrown]);
      }
    };

    // Wrap the "success" callback.
    ajax.success = function (data, textStatus, jqXHR) {
      // Process JSON data, if present.
      JS.processJSON.apply(this, [jqXHR]);

      // Execute passed "success" callback, if not redirecting and it exists.
      if (!this.redirecting && typeof(defaults.success) === 'function') {
        defaults.success.apply(this, [data, textStatus, jqXHR]);
      }
    };

    // Wrap the "complete" callback.
    ajax.complete = function (jqXHR, status) {
      this.ajaxing = false;

      // Modify the trigger to show appropriate state.
      this.trigger
        .removeClass('ajaxing disabled')
        .removeAttr('disabled');

      // Execute passed "complete" callback, if not redirecting and it exists.
      if (!this.redirecting && typeof(defaults.complete) === 'function') {
        defaults.complete.apply(this, [jqXHR, status]);
      }
    };

    // Execute the request using jQuery.ajax(). Do not return the chainable
    // jQuery.AjaxEvent methods because it can cause events to not trigger
    // properly when things like redirects happen.
    $.ajax(ajax);
  };

  /**
   * jQuery plugin for a JS Callback.
   *
   * @param module
   *   The module name the callback resides in.
   * @param callback
   *   The specific callback to invoke.
   * @param options
   *   Any additional options to pass to the jQuery.ajax() call.
   *
   * @return {jQuery}
   *   The chainable jQuery object.
   */
  $.fn.jsCallback = function (module, callback, options) {
    var $this = $(this);
    options = (typeof module === 'object' && module) || (typeof callback === 'object' && callback) || (typeof options === 'object' && options) || {};
    module = typeof module === 'string' && module || null;
    callback = typeof callback === 'string' && callback || null;
    // Ensure that our default data does not get overridden.
    var data = $.extend({
      js_module: module,
      js_callback: callback,
      js_token: (module && callback && Drupal.settings.js.tokens[module + '-' + callback]) || null
    }, options.data, $this.data());
    if (options.data) {
      delete options.data;
    }
    JS.ajax($.extend({
      type: 'POST',
      data: data,
      trigger: $this
    }, options));
    return $this;
  };

  /**
   * jQuery plugin for returning the contents of an internal URL.
   *
   * Any URL passed or extracted will be filtered for external sites. It can be
   * relative to the domain's root or absolute. If, however, the URL is
   * considered external the browser will automatically redirect and no AJAX
   * request will be invoked.
   *
   * Below are optional arguments you can pass to this method. If none are
   * passed, then this method will attempt to extract the URL from the element
   * itself. Only "a[href]" elements can be used for URLs. If the element has a
   * "[data-target]" attribute, it will be used to extract the "a[href]" value
   * of that target instead. If the current element is both "a[href]" and
   * "a[data-target]", then the "a[href]" value of the target will be used
   * instead. If no URL can be extracted, then the AJAX call is not invoked.
   *
   * @param {string|object} [url]
   *   If passed argument is a string, this is the internal URL to retrieve.
   *   If passed argument is an object, it will be used as options (see below).
   * @param {object} [options]
   *   Any additional options to pass to the jQuery.ajax() call.
   *
   * @return {jQuery}
   *   The chainable jQuery object.
   */
  $.fn.jsGet = function (url, options) {
    var $this = $(this);
    options = (typeof url === 'object' && url) || (typeof options === 'object' && options) || {};
    url = typeof url === 'string' && url || null;
    var $target = $($this.data('target'));
    if (!url && ($this.is('a[href]') || $target.length)) {
      url = $target.attr('href') || $this.attr('href') || null;
    }
    if (url) {
      JS.ajax($.extend({
        url: url,
        data: $this.data(),
        trigger: $this
      }, options));
    }
    return $this;
  };

  /**
   * jQuery plugin for processing form requests.
   *
   * @param {object} [options]
   *   Any additional options to pass to the jQuery.ajax() call.
   *
   * @return {jQuery}
   *   The chainable jQuery object.
   */
  $.fn.jsForm = function (options) {
    var $form = $(this);
    if (!$form.is('form')) {
      return $form;
    }
    options = typeof options === 'object' && options || {};
    $form.bind('submit', function (e) {
      // Prevent the form submission.
      e.preventDefault();

      // Get form values.
      var data = JS.processFormValues($form);

      // Override the module and callback values so we process this internally.
      data['js_module'] = 'js';
      data['js_callback'] = 'form';

      // Send the request.
      JS.ajax($.extend({
        type: $form.attr('method').toUpperCase(),
        url: $form.attr('action'),
        data: data
      }, options));
    });
    return $form;
  };

  /**
   * Process the JSON reponses from JS requests, if any.
   * @param {jqXHR} jqXHR
   */
  JS.processJSON = function (jqXHR) {
    // Older versions of jQuery do not have jqXHR.responseJSON, we must parse
    // it manually.
    if (this.dataType === 'json' && jqXHR.responseText) {
      var json = $.parseJSON(jqXHR.responseText) || {};

      // Response was redirected, pass this response onto the redirect handler.
      if (json.response && json.response.code && json.response.url && $.inArray(json.response.code, [301, 302, 303, 307]) !== -1) {
        // Only redirect requests internally if the origin matches.
        if (new RegExp('^' + window.location.origin).test(json.response.url)) {
          this.redirecting = true;
          // Redirects do not process any information, change the type back to
          // GET, remove the data and set the new URL.
          this.defaults.type = 'GET';
          this.defaults.data = {};
          this.defaults.url = json.response.url.replace(window.location.origin + Drupal.settings.basePath, '');
          JS.ajax(this.defaults);
        }
        // Otherwise redirect the entire page.
        else {
          window.location = json.response.url;
        }
        // Don't continue processing.
        return;
      }

      // Parse and display any Drupal messages set.
      if (json.messages) {
        JS.messages
          .prepend(Drupal.theme('statusMessages', json.messages))
          .trigger('loaded');
      }
    }
  };

  /**
   * Converts object keys from jsonLowerCamelCase to drupal_php_snake_case.
   *
   * @param {Object} obj
   *   The object to iterate over.
   */
  JS.snakeCaseObject = function (obj) {
    for (var key in obj) {
      obj[key] = Drupal.checkPlain(obj[key]);
      var snakeCaseKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      if (snakeCaseKey !== key) {
        var value = obj[key];
        delete obj[key];
        obj[snakeCaseKey] = value;
      }
    }
  };

  /**
   * Helper method for processing names and values of form elements.
   *
   * @param {Node|jQuery} element
   *   The DOM node or jQuery element. It can can be a single form element or
   *   if a higher element is passes (like a form), then all input elements
   *   found inside it will be added to the data array.
   *
   * @returns {object}
   *   The data to use.
   */
  JS.processFormValues = function (element) {
    var $elements = $(), data = {};
    if ($(element).is(':input')) {
      $elements = $elements.add(element);
    }
    else {
      $elements = $elements.add($(element).find(':input'));
    }
    $elements.each(function () {
      var $input = $(this);
      var name = $input.attr('name') || $input.attr('id') || null;
      var value = $input.is(':checkbox') ? ($input.is(':checked') ? $input.val() : 0) : $input.val();
      if (name) {
        data[name] = value;
      }
    });
    return data;
  };

  /**
   * http://stackoverflow.com/a/6238456
   */
  JS.isExternalLink = function (url) {
    var match = url.match(/^([^:\/?#]+:)?(?:\/\/([^\/?#]*))?([^?#]+)?(\?[^#]*)?(#.*)?/);
    if (typeof match[1] === "string" && match[1].length > 0 && match[1].toLowerCase() !== window.location.protocol) return true;
    return (typeof match[2] === "string" && match[2].length > 0 && match[2].replace(new RegExp(":("+{"http:":80,"https:":443}[window.location.protocol]+")?$"), "") !== window.location.host);
  };

  /**
   * Core template for theming status messages.
   */
  Drupal.theme.prototype.statusMessages = function (messages) {
    var output = '';
    var status_heading = {
      status: Drupal.t('Status message'),
      error: Drupal.t('Error message'),
      warning: Drupal.t('Warning message')
    };
    for (var type in messages) {
      if (messages[type].length > 0) {
        output += "<div class=\"messages " + type + "\">\n";
        if (typeof(status_heading[type]) !== 'undefined') {
          output += '<h2 class="element-invisible">' + status_heading[type] + "</h2>\n";
        }
        if (messages[type].length > 1) {
          output += " <ul>\n";
          for (var i in messages[type]) {
            output += '  <li>' +  messages[type][i] + "</li>\n";
            // Remove the message from the array so it's not processed again.
            delete messages[type][i];
          }
          output += " </ul>\n";
        }
        else {
          output += messages[type][0];
        }
        output += "</div>\n";
      }
    }
    return output;
  };


})(jQuery);



