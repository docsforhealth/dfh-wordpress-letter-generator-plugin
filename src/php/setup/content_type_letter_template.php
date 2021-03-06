<?php

// Need to flush URL rewrite rules when plugin is re-activated in order to get custom post type
// URL rewriting rules to work as intended
// see https://developer.wordpress.org/reference/functions/register_post_type/#flushing-rewrite-on-activation
register_activation_hook(DLG_PLUGIN_ROOT, 'dlg_register_letter_template_on_activation');
function dlg_register_letter_template_on_activation() {
    // First, we "add" the custom post type via the above written function.
    // Note: "add" is written with quotes, as CPTs don't get added to the DB,
    // They are only referenced in the post_type column with a post entry,
    // when you add a post of this CPT.
    dlg_register_content_type_letter_template();
    // ATTENTION: This is *only* done during plugin activation hook
    // You should *NEVER EVER* do this on every page load!
    flush_rewrite_rules();
}

add_action('init', 'dlg_register_content_type_letter_template');
function dlg_register_content_type_letter_template() {
    // see https://developer.wordpress.org/plugins/post-types/registering-custom-post-types/
    register_post_type('dlg_letter_template', array(
        'description'         => 'Letter Template',
        'hierarchical'        => false,
        'supports'            => array('title', 'editor'),
        'public'              => true,
        'show_ui'             => true,
        'show_in_rest'        => true,
        'publicly_queryable'  => true,
        'exclude_from_search' => true,
        'has_archive'         => false,
        'query_var'           => true,
        'can_export'          => true,
        'rewrite'             => array('slug' => 'dlg-letter-template', 'with_front' => false),
        'menu_icon'           => 'dashicons-welcome-write-blog',
        'template'            => array(array('dlg/letter-template')),
        'template_lock'       => 'insert',
        'labels'              => array(
            'add_new'                  => __('Add New', DLG_TEXT_DOMAIN),
            'add_new_item'             => __('Add New Letter Template', DLG_TEXT_DOMAIN),
            'all_items'                => __('Letter Templates', DLG_TEXT_DOMAIN),
            'archives'                 => __('Letter Templates', DLG_TEXT_DOMAIN),
            'attributes'               => __('Letter Template Attributes', DLG_TEXT_DOMAIN),
            'edit_item'                => __('Edit Letter Template', DLG_TEXT_DOMAIN),
            'featured_image'           => __('Featured image', DLG_TEXT_DOMAIN),
            'filter_by_date'           => __('Filter by date', DLG_TEXT_DOMAIN),
            'filter_items_list'        => __('Filter letter templates list', DLG_TEXT_DOMAIN),
            'insert_into_item'         => __('Insert into letter template', DLG_TEXT_DOMAIN),
            'item_link'                => __('Letter Template Link', DLG_TEXT_DOMAIN),
            'item_link_description'    => __('A link to a letter template.', DLG_TEXT_DOMAIN),
            'item_published'           => __('Letter Template published.', DLG_TEXT_DOMAIN),
            'item_published_privately' => __('Letter Template published privately.', DLG_TEXT_DOMAIN),
            'item_reverted_to_draft'   => __('Letter Template reverted to draft.', DLG_TEXT_DOMAIN),
            'item_scheduled'           => __('Letter Template scheduled.', DLG_TEXT_DOMAIN),
            'item_updated'             => __('Letter Template updated.', DLG_TEXT_DOMAIN),
            'items_list'               => __('Letter Templates list', DLG_TEXT_DOMAIN),
            'items_list_navigation'    => __('Letter Templates list navigation', DLG_TEXT_DOMAIN),
            'menu_name'                => __('Letter Templates', DLG_TEXT_DOMAIN),
            'name'                     => __('Letter Templates', DLG_TEXT_DOMAIN),
            'name_admin_bar'           => __('Letter Template', DLG_TEXT_DOMAIN),
            'new_item'                 => __('New Letter Template', DLG_TEXT_DOMAIN),
            'not_found'                => __('No Letter Templates found', DLG_TEXT_DOMAIN),
            'not_found_in_trash'       => __('No Letter Templates found in Trash', DLG_TEXT_DOMAIN),
            'parent_item_colon'        => __('Parent Letter Template:', DLG_TEXT_DOMAIN),
            'remove_featured_image'    => __('Remove featured image', DLG_TEXT_DOMAIN),
            'search_items'             => __('Search for a letter template...', DLG_TEXT_DOMAIN),
            'set_featured_image'       => __('Set featured image', DLG_TEXT_DOMAIN),
            'singular_name'            => __('Letter Template', DLG_TEXT_DOMAIN),
            'uploaded_to_this_item'    => __('Uploaded to this letter template', DLG_TEXT_DOMAIN),
            'use_featured_image'       => __('Use as featured image', DLG_TEXT_DOMAIN),
            'view_item'                => __('View Letter Template', DLG_TEXT_DOMAIN),
            'view_items'               => __('View Letter Templates', DLG_TEXT_DOMAIN),
        ),
    ));
}

// Enqueue a custom JS setup script each custom content type
// see https://wordpress.stackexchange.com/a/310229
add_action('enqueue_block_editor_assets', 'dlg_register_letter_template_scripts');
function dlg_register_letter_template_scripts() {
    if (get_post_type() == 'dlg_letter_template') {
        wp_enqueue_script(
            'dlg-letter-template-editor-script', // label
            plugins_url('/build/letter-template.js', DLG_PLUGIN_ROOT), // URL to script file
            // WP package dependencies
            array(
                'wp-block-editor',
                'wp-blocks',
                'wp-data',
                'wp-dom-ready',
                'wp-element',
                'wp-hooks',
                'wp-i18n',
            ),
            filemtime(DLG_PLUGIN_DIR . '/build/letter-template.js') // is a file path, set version as file last modified time
        );
    }
}

// Add structured API data to the REST API endpoint
// see https://wpscholar.com/blog/add-gutenberg-blocks-to-wp-rest-api/
add_action('rest_api_init', function() {
    // NOTE: for some reason, checking `use_block_editor_for_post_type` here results in a critical error
    // see https://developer.wordpress.org/reference/functions/register_rest_field/
    register_rest_field('dlg_letter_template', 'data', [
        'get_callback' => function($post) {
            // use `array_filter` to filter the array for the template block. Note that PHP doesn't
            // have a built-in method to search for arrays of objects so we use `array_filter`
            // then simply select the first object in the array as a workaround
            $template_blocks = array_filter(parse_blocks($post['content']['raw']), function($block) {
                return $block['blockName'] == 'dlg/letter-template';
            });
            return !empty($template_blocks) ? reset($template_blocks)['attrs']['_API_CONFIG_API_DATA_'] : array();
        },
    ]);
});
