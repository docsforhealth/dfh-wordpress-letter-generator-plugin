<?php

// Need to flush URL rewrite rules when plugin is re-activated in order to get custom post type
// URL rewriting rules to work as intended
// see https://developer.wordpress.org/reference/functions/register_post_type/#flushing-rewrite-on-activation
register_activation_hook(DLG_PLUGIN_ROOT, 'dlg_register_shared_data_element_on_activation');
function dlg_register_shared_data_element_on_activation() {
    // First, we "add" the custom post type via the above written function.
    // Note: "add" is written with quotes, as CPTs don't get added to the DB,
    // They are only referenced in the post_type column with a post entry,
    // when you add a post of this CPT.
    dlg_register_content_type_shared_data_element();
    // ATTENTION: This is *only* done during plugin activation hook
    // You should *NEVER EVER* do this on every page load!
    flush_rewrite_rules();
}

add_action('init', 'dlg_register_content_type_shared_data_element');
function dlg_register_content_type_shared_data_element() {
  // see https://developer.wordpress.org/plugins/post-types/registering-custom-post-types/
    register_post_type('dlg_data_element', array(
        'description'         => 'Shared Data Element',
        'hierarchical'        => false,
        'supports'            => array('title', 'editor'),
        'public'              => true,
        // One-liner to nest data elements within letter template menu instead of `add_submenu_page`
        // see https://wordpress.stackexchange.com/a/110565
        // see https://developer.wordpress.org/reference/functions/register_post_type/#show_in_menu
        'show_in_menu'        => 'edit.php?post_type=dlg_letter_template',
        'show_ui'             => true,
        'show_in_rest'        => true,
        'publicly_queryable'  => true,
        'exclude_from_search' => true,
        'has_archive'         => false,
        'query_var'           => true,
        'can_export'          => true,
        'rewrite'             => array('slug' => 'dlg-data-element', 'with_front' => false),
        'menu_icon'           => 'dashicons-forms',
        'template'            => array(array('dlg/shared-data-element')),
        'template_lock'       => 'insert',
        'labels'              => array(
            'add_new'                  => __('Add New', DLG_TEXT_DOMAIN),
            'add_new_item'             => __('Add New Shared Data Element', DLG_TEXT_DOMAIN),
            'all_items'                => __('Shared Data Elements', DLG_TEXT_DOMAIN),
            'archives'                 => __('Shared Data Elements', DLG_TEXT_DOMAIN),
            'attributes'               => __('Shared Data Element Attributes', DLG_TEXT_DOMAIN),
            'edit_item'                => __('Edit Shared Data Element', DLG_TEXT_DOMAIN),
            'featured_image'           => __('Featured image', DLG_TEXT_DOMAIN),
            'filter_by_date'           => __('Filter by date', DLG_TEXT_DOMAIN),
            'filter_items_list'        => __('Filter shared data elements list', DLG_TEXT_DOMAIN),
            'insert_into_item'         => __('Insert into shared data element', DLG_TEXT_DOMAIN),
            'item_link'                => __('Shared Data Element Link', DLG_TEXT_DOMAIN),
            'item_link_description'    => __('A link to a shared data element.', DLG_TEXT_DOMAIN),
            'item_published'           => __('Shared Data Element published.', DLG_TEXT_DOMAIN),
            'item_published_privately' => __('Shared Data Element published privately.', DLG_TEXT_DOMAIN),
            'item_reverted_to_draft'   => __('Shared Data Element reverted to draft.', DLG_TEXT_DOMAIN),
            'item_scheduled'           => __('Shared Data Element scheduled.', DLG_TEXT_DOMAIN),
            'item_updated'             => __('Shared Data Element updated.', DLG_TEXT_DOMAIN),
            'items_list'               => __('Shared Data Elements list', DLG_TEXT_DOMAIN),
            'items_list_navigation'    => __('Shared Data Elements list navigation', DLG_TEXT_DOMAIN),
            'menu_name'                => __('Shared Data Elements', DLG_TEXT_DOMAIN),
            'name'                     => __('Shared Data Elements', DLG_TEXT_DOMAIN),
            'name_admin_bar'           => __('Shared Data Element', DLG_TEXT_DOMAIN),
            'new_item'                 => __('New Shared Data Element', DLG_TEXT_DOMAIN),
            'not_found'                => __('No Shared Data Elements found', DLG_TEXT_DOMAIN),
            'not_found_in_trash'       => __('No Shared Data Elements found in Trash', DLG_TEXT_DOMAIN),
            'parent_item_colon'        => __('Parent Shared Data Element:', DLG_TEXT_DOMAIN),
            'remove_featured_image'    => __('Remove featured image', DLG_TEXT_DOMAIN),
            'search_items'             => __('Search for a shared data element...', DLG_TEXT_DOMAIN),
            'set_featured_image'       => __('Set featured image', DLG_TEXT_DOMAIN),
            'singular_name'            => __('Shared Data Element', DLG_TEXT_DOMAIN),
            'uploaded_to_this_item'    => __('Uploaded to this shared data element', DLG_TEXT_DOMAIN),
            'use_featured_image'       => __('Use as featured image', DLG_TEXT_DOMAIN),
            'view_item'                => __('View Shared Data Element', DLG_TEXT_DOMAIN),
            'view_items'               => __('View Shared Data Elements', DLG_TEXT_DOMAIN),
        ),
    ));
}

// Enqueue a custom JS setup script each custom content type
// see https://wordpress.stackexchange.com/a/310229
add_action('enqueue_block_editor_assets', 'dlg_register_custom_content_type_scripts');
function dlg_register_custom_content_type_scripts() {
    if (get_post_type() == 'dlg_data_element') {
        wp_enqueue_script(
            'dlg-shared-data-element-editor-script', // label
            plugins_url('/build/shared-data-element.js', DLG_PLUGIN_ROOT), // URL to script file
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
            filemtime(DLG_PLUGIN_DIR . '/build/shared-data-element.js') // is a file path, set version as file last modified time
        );
    }
}

// Add structured block data to the REST API endpoint for shared data elements
// see https://wpscholar.com/blog/add-gutenberg-blocks-to-wp-rest-api/
add_action('rest_api_init', function() {
    // NOTE: for some reason, checking `use_block_editor_for_post_type` here results in a critical error
    // see https://developer.wordpress.org/reference/functions/register_rest_field/
    register_rest_field('dlg_data_element', 'block_data', [
        'get_callback' => function($post) {
            return array_filter(parse_blocks($post['content']['raw']), function($block) {
                return !empty($block['blockName']);
            });
        },
    ]);
});
