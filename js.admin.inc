<?php 
/**
 * @file
 * JavaScript callback handler module.
 */

/**
 * Form callback for the js configuration form
 * 
 * @param array $form
 * @param array $form_state
 */
function js_configure_form($form, &$form_state) {
  global $base_path;
  $htaccess = '  # Rewrite JavaScript callback URLs of the form js.php?q=x.' . PHP_EOL;
  $htaccess .= '  RewriteCond %{REQUEST_URI} ^' . str_replace("/", "\/", base_path()) . 'js(x)?\/.*' . PHP_EOL;
  $htaccess .= '  RewriteRule ^(.*)$ js.php?q=$1 [L,QSA]' . PHP_EOL . PHP_EOL;
  if ($htaccess_suggestion = file_get_contents($_SERVER['DOCUMENT_ROOT'] . $base_path . '.htaccess')) {
    if (FALSE === strpos($htaccess_suggestion, 'RewriteRule ^(.*)$ js.php?q=$1 [L,QSA]')) {
      if (preg_match(
        '`^  # Pass all requests not referring directly to files in the filesystem to$`m',
        $htaccess_suggestion,
        $found
      )) {
        $htaccess_suggestion = str_replace(
          $found[0],
          $htaccess . $found[0],
          $htaccess_suggestion
        );
      }
    }
  }

  $form['options'] = array(
    '#type' => 'fieldset',
    '#title' => t('Settings'),
  );
  $form['options']['js_callback_handler_complex_path'] = array(
    '#type' => 'checkbox',
    '#default_value' => variable_get('js_callback_handler_complex_path', FALSE),
    '#title' => t('Enable complex path support'),
    '#description' => t('Complex paths support enables the use of slashes (/) and a wildcard (%, no %function though) in your callback definition.'),
  );
  $form['options']['js_callback_handler_page_arguments'] = array(
    '#type' => 'checkbox',
    '#default_value' => variable_get('js_callback_handler_page_arguments', FALSE),
    '#title' => t('Enable page arguments support'),
    '#description' => t('Page arguments enables the support to defined which arguments are passed to the callback. If disabled all parts of the path that are left after the callback are passed as arguments to the callback.'),
  );
  $form['options']['js_callback_handler_access_validation'] = array(
    '#type' => 'checkbox',
    '#default_value' => variable_get('js_callback_handler_access_validation', FALSE),
    '#title' => t('Enable user access validation support'),
    '#description' => t('Adds a simple implementation of access arguments and access callback. Access arguments do not support wildcards (yet). NOTE: adding an access argument or callback will force bootstrapping to SESSION instead of only DATABASE.'),
  );
  $form['options']['js_callback_handler_other_file'] = array(
    '#type' => 'checkbox',
    '#default_value' => variable_get('js_callback_handler_other_file', FALSE),
    '#title' => t('Enable file support'),
    '#description' => t('Adds the ability to have a callback in another file, configured via the file option.')
  );

  $form['dowload'] = array(
    '#type' => 'fieldset',
    '#title' => t('Download'),
    'warning' => array(
      '#type' => 'item',
      '#markup' => t('You need to save your configuration changes before downloading or generating the js.php file to make them take effect.'),
      '#prefix' => '<strong style="color: red">',
      '#suffix' => '</strong>',
    ),
  );
  $form['dowload']['js'] = array(
    '#type' => 'item',
    '#title' => t('Download/generate callback file'),
    '#markup' => t('You can try to <a href="!generate_url">generate</a> the js.php file directly into your Drupal root or <a href="!download_url">download</a> and copy it manually.', array(
      '!generate_url' => url('admin/config/system/js/generate', array('query' => drupal_get_destination())),
      '!download_url' => url('admin/config/system/js/download'),
    )),
  );
  $form['dowload']['htaccess_additions'] = array(
    '#type' => 'textarea',
    '#title' => t('.htaccess'),
    '#description' => t('These lines need to be added in front of the existing RewriteRules in your .htaccess.'),
    '#value' => $htaccess,
    '#rows' => 4,
    '#attributes' => array(
      'readonly' => 'readonly',
    ),
  );
  if ($htaccess_suggestion) {
    $form['dowload']['htaccess_suggestion'] = array(
      '#type' => 'textarea',
      '#title' => t('.htaccess'),
      '#description' => t('This is how your .htaccess should look after adding the changes. Please do not finally rely on this suggestion; severy site errors might be the result.'),
      '#value' => $htaccess_suggestion,
      '#rows' => 20,
      '#attributes' => array(
        'readonly' => 'readonly',
      ),
    );
  }

  return system_settings_form($form);
}

/**
 * Callback for downloading the js.php file
 */
function js_download_handler() {
  // Get js.php contents
  $file = js_generate_php_file();

  // Set download headers
  drupal_add_http_header('Content-type', 'text/plain');
  drupal_add_http_header('Content-disposition', 'attachment; filename=js.php');
  drupal_add_http_header('Content-Length', strlen($file));

  // Echo js.php contents
  echo $file;

  // Force exit
  drupal_exit();
}

/**
 * Callback for the js.php file generation.
 *
 * Creates the php file, tries to place it in the Drupal root, remembers the
 * md5 hash of the file content for conditional deletion on module uninstall.
 */
function js_generation_handler() {
  global $base_path;
  // Create the new file and a hash to compare file with probably existing versions.
  $file_new = js_generate_php_file();
  $hash_new = md5($file_new);
  // Recall the hash of the file that was last auto-generated.
  $hash_last = variable_get('js_autogenerate_hash', '');
  // Define the server-absolute file target.
  $target = $_SERVER['DOCUMENT_ROOT'] . $base_path . 'js.php';
  // Only save the new file, if either no js.php exists or the existing
  // one was auto-generated. The goal of this check is not to overwrite a file
  // that has been manualle put there or modified.
  if (!file_exists($target) || md5(file_get_contents($target)) == $hash_last) {
    if (FALSE !== file_put_contents($target, $file_new)) {
      // Remember the new file hash, if saving succeeded.
      variable_set('js_autogenerate_hash', $hash_new);
      drupal_set_message(t('Successfully created %filename in your Drupal root.', array(
        '%filename' => $target,
      )));
    }
    else {
      drupal_set_message(
        t('The file %filename could not be written to your Drupal root. Please try manually.', array(
          '%filename' => $target,
        )),
        'error'
      );
    }
  }
  else {
    drupal_set_message(
      t('The existing file %filename seems to not have been automatically generated. Please remove it manually before proceeding.', array(
        '%filename' => $target,
      )),
      'error'
    );
  }
  drupal_goto();
}

/**
 * Generate the pure php file.
 *
 * @return string
 *   The js.php content as defined by the theme template.
 *
 * @see js_download_handler()
 * @see js_generation_handler()
 */
function js_generate_php_file() {
  return theme('js_callback_handler', array(
    'options' => array(
      'complex_path' => variable_get('js_callback_handler_complex_path', FALSE),
      'page_arguments' => variable_get('js_callback_handler_page_arguments', FALSE),
      'access_validation' => variable_get('js_callback_handler_access_validation', FALSE),
      'other_file' => variable_get('js_callback_handler_other_file', FALSE),
    )
  ));
}
