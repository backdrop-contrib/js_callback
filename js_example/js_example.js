(function ($) {

  Drupal.behaviors.jsExample = {
    attach: function (context, settings) {

      // Stop form execution.
      var $form = $(context).find('#js-example-form');
      $form.once('example', function () {
        $(this).bind('submit', function (e) {
          e.preventDefault();
        });
      });
      // Make pressing "enter" trigger a click on the nearest submit button.
      $form.find('input[type=text]').bind('keypress', function (e) {
        if (e.keyCode == 13) {
          $(this).closest(':submit').trigger('click');
        }
      });

      /**
       * POST data as callback parameters.
       * js_example_post_callback_parameters() in js_example.module.
       */
      $(context).find('#edit-post-callback-parameters').once('example', function () {
        var $button = $(this).find(':submit');
        var $text = $(this).find('input[type=text]');
        var $code = $(this).find('code');
        // Trigger AJAX call via JS module.
        $button.bind('click', function () {
          var data = {};
          data[$text.attr('name')] = $text.val();
          JS.ajax('js_example', 'post_callback_parameters', {
            data: data,
            element: $text,
            success: function (json) {
              $code.html(json.content);
            }
          });
        });
      });

    }
  };

})(jQuery);
