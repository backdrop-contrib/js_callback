<?php
/**
 * @file
 * get.inc
 */

/**
 * Handler for JS GET requests.
 *
 * @return array|int
 *   The render array for the system_main page contents or an integer if an
 *   error occurred.
 */
function js_get_page() {
  // To avoid having to reinitialize most of Backdrop to return the correct
  // page request, the bootstrap state remains as minimal as possible until
  // we reach this point. At this point we can fully bootstrap Backdrop safely.
  js_bootstrap(BACKDROP_BOOTSTRAP_FULL);

  // Retrieve the results for the active menu handler. This is identical to
  // index.php, expect that we do not deliver the page here. The results must
  // be rendered manually below so we just return the main content for the page.
  $page = menu_execute_active_handler(NULL, FALSE);

  // If the result is an integer (error), return it immediately so JS module can
  // deliver the proper JSON results.
  if (is_int($page)) {
    if ($page === JS_MENU_NOT_FOUND) {
      backdrop_set_message(t('The requested URL "!url" could not be found.', array(
        '!url' => url(current_path()),
      )), 'error', FALSE);
    }
    elseif ($page === JS_MENU_ACCESS_DENIED) {
      backdrop_set_message(t('You are not authorized to access the requested URL "!url".', array(
        '!url' => url(current_path()),
      )), 'error', FALSE);
    }
    return $page;
  }

  // The result was successful. The contents of this request must be rendered
  // here to mimic what Backdrop normally returns. This code is almost identical
  // to backdrop_render_page(), except that it only renders the "system_main"
  // section of the page and nothing else.
  // @see backdrop_render_page()
  // @todo: This must change for Backdrop, where backdrop_render_page() has
  // been refactored and backdrop_set_page_content() no longer exists. See:
  // https://docs.backdropcms.org/change-records/new-layout-module-implements-a-drag-drop-model-for-building-layouts
  // and
  // https://docs.backdropcms.org/api/backdrop/core%21includes%21common.inc/function/backdrop_render_page/1
  $main_content_display = &backdrop_static('system_main_content_added', FALSE);
  if (is_string($page) || (is_array($page) && (!isset($page['#type']) || ($page['#type'] != 'page')))) {
    backdrop_set_page_content($page);
    $page = element_info('page');
  }
  foreach (module_implements('page_build') as $module) {
    $function = $module . '_page_build';
    $function($page);
  }
  backdrop_alter('page', $page);
  if (!$main_content_display) {
    $page['content']['system_main'] = backdrop_set_page_content();
  }
  // Remove the "block" theme wrapper. This prevents a duplicate "system main"
  // block from appearing while still rendering the content inside it.
  if (isset($page['content']['system_main']['#theme_wrappers']) && ($key = array_search('block', $page['content']['system_main']['#theme_wrappers']))) {
    unset($page['content']['system_main']['#theme_wrappers'][$key]);
  }
  return $page['content']['system_main'];
}
