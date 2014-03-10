var JS = JS || {};

(function ($) {

  /**
   * JS messages DOM object.
   */
  JS.messages = $('<div class="js-messages"></div>');

  /**
   * JS jQuery.ajax wrapper.
   *
   * This function helps execute JS module requests easier.
   *
   * @param {string} module
   *   The module name the callback resides in.
   * @param {string} callback
   *   The callback name to invoke.
   * @param {object} defaults
   *   The additional default options to pass to the jQuery.ajax request.
   *   Warning: these will override the default properties set in this method.
   *   Certain methods, like "beforeSend" and "complete", will be automatically
   *   wrapped.
   *
   * @return {jQuery.ajax}
   *   The jQuery.ajax object after it has been executed.
   */
  JS.ajax = function (module, callback, defaults) {
    var ajax = {}, defaults = defaults || {};
    ajax.url = Drupal.settings.basePath + 'js/' + module + '/' + callback + '/' + Drupal.settings.js.token;
    ajax.type = 'POST';
    ajax.data = {};

    // Extend this AJAX instance with the options passed (keeping objects
    // intact so data is passed by reference).
    for (var i in defaults) {
      if (defaults.hasOwnProperty(i)) {
        ajax[i] = defaults[i];
      }
    }

    // Wrap the beforeSend method.
    ajax.beforeSend = function (xmlhttprequest, options) {
      this.ajaxing = true;

      // Clear the current messages.
      JS.messages.html('');

      // If there is an element passed, process necessary classes.
      if (defaults.element) {
        defaults.element.addClass('ajaxing').removeClass('error');
      }

      // Execute the passed beforeSend method if it exists.
      if (defaults.hasOwnProperty('beforeSend')) {
        defaults.beforeSend(xmlhttprequest, options);
      }
    };

    // Wrap the complete method.
    ajax.complete = function (response, status) {
      this.ajaxing = false;

      // Get JSON response.
      var json = response && response.responseJSON || {};

      // Parse and display any Drupal messages set.
      if (json.drupal && json.drupal.messages) {
        JS.messages
          .html(Drupal.theme('jsStatusMessages', json.drupal.messages))
          .trigger('loaded');
        if (json.drupal.messages.error) {
          // Trigger element error class if present.
          if (defaults.element) {
            defaults.element.addClass('error');
          }
        }
      }

      // If there is an element passed, process necessary classes.
      if (defaults.element) {
        defaults.element.removeClass('ajaxing');
      }

      // Execute the passed complete method if it exists.
      if (defaults.hasOwnProperty('complete')) {
        defaults.complete(response, status);
      }
    };

    // Execute the request and return the chainable jQuery.ajax object.
    return $.ajax(ajax);
  };

  Drupal.behaviors.js = {
    attach: function (context, settings) {
      $(context).find('#block-system-main').once('js', function () {
        JS.messages.prependTo(this);
      });
    }
  };

  Drupal.theme.prototype.jsStatusMessages = function (messages) {
    var output = '';
    var status_heading = {
      status: Drupal.t('Status message'),
      error: Drupal.t('Error message'),
      warning: Drupal.t('Warning message')
    };
    for (var type in messages) {
      output += "<div class=\"messages " + type + "\">\n";
      if (typeof(status_heading[type]) !== 'undefined') {
        output += '<h2 class="element-invisible">' + status_heading[type] + "</h2>\n";
      }
      if (messages[type].length > 1) {
        output += " <ul>\n";
        for (var message in messages[type]) {
          output += '  <li>' + message + "</li>\n";
        }
        output += " </ul>\n";
      }
      else {
        output += messages[type][0];
      }
      output += "</div>\n";
    }
    return output;
  };


})(jQuery);



