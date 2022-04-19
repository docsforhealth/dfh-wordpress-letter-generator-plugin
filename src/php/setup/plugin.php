<?php

// see https://jasonyingling.me/enqueueing-scripts-and-styles-for-gutenberg-blocks/
add_action('enqueue_block_editor_assets', 'dlg_register_editor_assets');
function dlg_register_editor_assets() {
    // Register the editor-specific stylesheet.
    wp_enqueue_style(
        'dlg-editor-styles', // label
        plugins_url('/build/editor.css', DLG_PLUGIN_ROOT), // URL to CSS file
        array('wp-edit-blocks'), // dependencies
        filemtime(DLG_PLUGIN_DIR . '/build/editor.css') // is a file path, set version as file last modified time
    );
    // Register the block editor script.
    wp_enqueue_script(
        'dlg-editor-script', // label
        plugins_url('/build/editor.js', DLG_PLUGIN_ROOT), // URL to script file
        array('wp-blocks', 'wp-i18n', 'wp-element', 'wp-block-editor', 'wp-data', 'wp-hooks', 'wp-api-fetch'), // dependencies
        filemtime(DLG_PLUGIN_DIR . '/build/editor.js') // is a file path, set version as file last modified time
    );
}
