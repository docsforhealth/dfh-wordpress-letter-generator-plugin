<?php
/**
 * Plugin Name: Docs for Health Letter Generator (Preview)
 * Author: Eric Bai
 * Author URI: https://github.com/ericbai
 * Plugin URI: https://github.com/docsforhealth/dfh-wordpress-letter-generator-plugin
 * GitHub Plugin URI: https://github.com/docsforhealth/dfh-wordpress-letter-generator-plugin
 * Release Asset: true
 * Description: Preview of the upcoming letter generator for the Docs for Health website
 * Version: 0.0.1
 * License: Apache-2.0
 * License URI: https://www.apache.org/licenses/LICENSE-2.0.txt
 * Text Domain: dlg
 */

// TODO factor out to new shared base OR use Yarn Workspaces (https://yarnpkg.com/features/workspaces)

defined('ABSPATH') || exit;

if (!defined('DLG_PLUGIN_ROOT')) {
    define('DLG_PLUGIN_ROOT', __FILE__);
}
if (!defined('DLG_PLUGIN_DIR')) {
    define('DLG_PLUGIN_DIR', untrailingslashit(dirname(DLG_PLUGIN_ROOT)));
}
if (!defined('DLG_TEXT_DOMAIN')) {
    define('DLG_TEXT_DOMAIN', 'dlg');
}
// Define the plugins that our plugin requires to function.
// Array format: 'Plugin Name' => 'REGEX PATTERN to main plugin file'
if (!defined('DLG_REQUIRED_PLUGINS')) {
    define('DLG_REQUIRED_PLUGINS', array(
        'Docs for Health' => "/dfh-wordpress-plugin.php/",
    ));
}

// Check required dependencies
require_once DLG_PLUGIN_DIR . '/src/php/check-required-dependencies.php';

// Plugin setup files
require_once DLG_PLUGIN_DIR . '/src/php/setup/blocks.php';
require_once DLG_PLUGIN_DIR . '/src/php/setup/block_categories.php';
require_once DLG_PLUGIN_DIR . '/src/php/setup/custom_content_types.php';
