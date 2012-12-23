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
  $htaccess = '# Rewrite JavaScript callback URLs of the form js.php?q=x.' . PHP_EOL;
  $htaccess .= 'RewriteCond %{REQUEST_URI} ^' . str_replace("/", "\/", base_path()) . 'js\/.*' . PHP_EOL;
  $htaccess .= 'RewriteRule ^(.*)$ js.php?q=$1 [L,QSA]';

  $form['options'] = array(
    '#type'  => 'fieldset',
    '#title' => t('Settings'),
  );
  $form['options']['js_callback_handler_complex_path'] = array(
    '#type'          => 'checkbox',
    '#default_value' => variable_get('js_callback_handler_complex_path', FALSE),
    '#title'         => t('Enable complex path support'),
    '#description'   => t('Complex paths support enables the use of slashes (/) and a wildcard (%, no %function though) in your callback definition.')
  );
  $form['options']['js_callback_handler_page_arguments'] = array(
    '#type'          => 'checkbox',
    '#default_value' => variable_get('js_callback_handler_page_arguments', FALSE),
    '#title'         => t('Enable page arguments support'),
    '#description'   => t('Page arguments enables the support to defined which arguments are passed to the callback. If disabled all parts of the path that are left after the callback are passed as arguments to the callback.')
  );
  $form['options']['js_callback_handler_access_validation'] = array(
    '#type'          => 'checkbox',
    '#default_value' => variable_get('js_callback_handler_access_validation', FALSE),
    '#title'         => t('Enable user access validation support'),
    '#description'   => t('Adds a simple implementation of access arguments and access callback. Access arguments do not support wildcards (yet). NOTE: adding an access argument or callback will force bootstrapping to SESSION instead of only DATABASE.')
  );
  $form['options']['js_callback_handler_other_file'] = array(
    '#type'          => 'checkbox',
    '#default_value' => variable_get('js_callback_handler_other_file', FALSE),
    '#title'         => t('Enable file support'),
    '#description'   => t('Adds the ability to have a callback in another file, configured via the file option.')
  );

  $form['dowload'] = array(
    '#type'        => 'fieldset',
    '#title'       => t('Download'),
    '#description' => t('Submit the form before downloading the js.php file to make the changes take effect.')
  );
  $form['dowload']['js'] = array(
    '#type'        => 'item',
    '#title'  => t('Download the js.php file and place it in the root of your Drupal installation.'),
    '#markup'      => l(t('Download js.php'), 'admin/config/system/js/download')
  );
  $form['dowload']['htaccess'] = array(
    '#type'        => 'textarea',
    '#title'       => t('Add the following lines in front of the existing RewriteRules in your .htaccess.'),
    '#value'       => $htaccess
  );

  return system_settings_form($form);
}

/**
 * Callback for downloading the js.php file
 */
function js_download_handler() {
  // Get js.php contents
  $file = theme('js_callback_handler', array(
    'options' => array(
      'complex_path' => variable_get('js_callback_handler_complex_path', FALSE),
      'page_arguments' => variable_get('js_callback_handler_page_arguments', FALSE),
      'access_validation' => variable_get('js_callback_handler_access_validation', FALSE),
      'other_file' => variable_get('js_callback_handler_other_file', FALSE),
    )
  ));

  // Set download headers
  drupal_add_http_header('Content-type', 'text/plain');
  drupal_add_http_header('Content-disposition', 'attachment; filename=js.php');
  drupal_add_http_header('Content-Length', strlen($file));

  // Echo js.php contents
  echo $file;

  // Force exit
  drupal_exit();
}


