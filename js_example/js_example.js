(function ($) {

  Drupal.behaviors.jsExample = {
    attach: function (context, settings) {

      // Stop form execution.
      var $form = $(context).find('#js-example-form');
      $form.once('example', function () {
        $form.bind('submit', function (e) {
          e.preventDefault();
        });
        // Make pressing "enter" trigger a click on the nearest callback.
        // @todo Make this attachable somehow?
        $form.find('input[type=text]').bind('keypress', function (e) {
          if (e.keyCode == 13) {
            $(this).closest('[data-js-callback]').trigger('click');
          }
        });
      });

      /**
       * Using #js_callback and $.jsCallback().
       * js_example_js_callback_using_js_callback() in js_example.module.
       */
      $(context).find('#edit-using-js-callback').once('example', function () {
        var $button = $(this).find(':submit');
        var $text = $(this).find('input[type=text]');
        var $results = $(this).find('.results pre code');

        // Trigger a callback using the $.jsCallback() method via JS module.
        $button.bind('click', function () {
          $button.jsCallback({
            // Send the text data.
            data: JS.processFormValues($text),
            beforeSend: function () {
              $results.html('');
            },
            success: function (json) {
              $results.html(json.content);
            },
            complete: function () {
              // Move message right before $text container element.
              // @todo Make this attachable somehow?
              $text.parent().prepend(JS.messages);
            }
          });
        });
      });

      /**
       * Using $.jsGet().
       */
      $(context).find('#edit-using-js-get').once('example', function () {
        var $results = $(this).find('.results pre code');
        var $links = $(this).find('a');

        $links.bind('click', function (e) {
          e.preventDefault();
          $(this).jsGet({
            beforeSend: function () {
              $results.html('');
            },
            success: function (json) {
              $results.html(json.content);
            },
            complete: function () {
              // Move message right before $text container element.
              // @todo Make this attachable somehow?
              $links.parent().parent().prepend(JS.messages);
            }
          });
        });
      });

    }
  };

})(jQuery);
