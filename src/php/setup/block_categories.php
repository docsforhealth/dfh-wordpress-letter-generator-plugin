<?php

add_filter('dfh_block_categories', 'dlg_block_categories');
function dlg_block_categories($categories) {
    // Note that the order specified here is the order the categories will display
    return array_merge(
        array(
            array(
                'slug'  => 'dlg-letter-template',
                'title' => __('Letter Generator', DLG_TEXT_DOMAIN),
            ),
        ),
        $categories
    );
}
