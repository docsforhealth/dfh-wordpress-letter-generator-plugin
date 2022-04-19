<?php

// Need to flush URL rewrite rules when plugin is re-activated in order to get custom post type
// URL rewriting rules to work as intended
// see https://developer.wordpress.org/reference/functions/register_post_type/#flushing-rewrite-on-activation
register_activation_hook(DLG_PLUGIN_ROOT, 'dlg_activation_rewrite_flush');
function dlg_activation_rewrite_flush() {
    // First, we "add" the custom post type via the above written function.
    // Note: "add" is written with quotes, as CPTs don't get added to the DB,
    // They are only referenced in the post_type column with a post entry,
    // when you add a post of this CPT.
    dlg_register_content_type_letter_template();
    dlg_register_content_type_global_data_element();
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
        // 'template'            => array(array('')), // TODO
        // 'template_lock'       => 'insert', // TODO
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

add_action('init', 'dlg_register_content_type_global_data_element');
function dlg_register_content_type_global_data_element() {
  // see https://developer.wordpress.org/plugins/post-types/registering-custom-post-types/
    register_post_type('dlg_data_element', array(
        'description'         => 'Data Element',
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
        'menu_icon'           => 'dashicons-database',
        // 'template'            => array(array('')), // TODO
        // 'template_lock'       => 'insert', // TODO
        'labels'              => array(
            'add_new'                  => __('Add New', DLG_TEXT_DOMAIN),
            'add_new_item'             => __('Add New Data Element', DLG_TEXT_DOMAIN),
            'all_items'                => __('Data Elements', DLG_TEXT_DOMAIN),
            'archives'                 => __('Data Elements', DLG_TEXT_DOMAIN),
            'attributes'               => __('Data Element Attributes', DLG_TEXT_DOMAIN),
            'edit_item'                => __('Edit Data Element', DLG_TEXT_DOMAIN),
            'featured_image'           => __('Featured image', DLG_TEXT_DOMAIN),
            'filter_by_date'           => __('Filter by date', DLG_TEXT_DOMAIN),
            'filter_items_list'        => __('Filter data elements list', DLG_TEXT_DOMAIN),
            'insert_into_item'         => __('Insert into data element', DLG_TEXT_DOMAIN),
            'item_link'                => __('Data Element Link', DLG_TEXT_DOMAIN),
            'item_link_description'    => __('A link to a data element.', DLG_TEXT_DOMAIN),
            'item_published'           => __('Data Element published.', DLG_TEXT_DOMAIN),
            'item_published_privately' => __('Data Element published privately.', DLG_TEXT_DOMAIN),
            'item_reverted_to_draft'   => __('Data Element reverted to draft.', DLG_TEXT_DOMAIN),
            'item_scheduled'           => __('Data Element scheduled.', DLG_TEXT_DOMAIN),
            'item_updated'             => __('Data Element updated.', DLG_TEXT_DOMAIN),
            'items_list'               => __('Data Elements list', DLG_TEXT_DOMAIN),
            'items_list_navigation'    => __('Data Elements list navigation', DLG_TEXT_DOMAIN),
            'menu_name'                => __('Data Elements', DLG_TEXT_DOMAIN),
            'name'                     => __('Data Elements', DLG_TEXT_DOMAIN),
            'name_admin_bar'           => __('Data Element', DLG_TEXT_DOMAIN),
            'new_item'                 => __('New Data Element', DLG_TEXT_DOMAIN),
            'not_found'                => __('No Data Elements found', DLG_TEXT_DOMAIN),
            'not_found_in_trash'       => __('No Data Elements found in Trash', DLG_TEXT_DOMAIN),
            'parent_item_colon'        => __('Parent Data Element:', DLG_TEXT_DOMAIN),
            'remove_featured_image'    => __('Remove featured image', DLG_TEXT_DOMAIN),
            'search_items'             => __('Search for a data element...', DLG_TEXT_DOMAIN),
            'set_featured_image'       => __('Set featured image', DLG_TEXT_DOMAIN),
            'singular_name'            => __('Data Element', DLG_TEXT_DOMAIN),
            'uploaded_to_this_item'    => __('Uploaded to this data element', DLG_TEXT_DOMAIN),
            'use_featured_image'       => __('Use as featured image', DLG_TEXT_DOMAIN),
            'view_item'                => __('View Data Element', DLG_TEXT_DOMAIN),
            'view_items'               => __('View Data Elements', DLG_TEXT_DOMAIN),
        ),
    ));
}
