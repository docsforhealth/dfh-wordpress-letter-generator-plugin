<?php

dlg_check_required_plugins();

// inspired by https://waclawjacek.com/check-wordpress-plugin-dependencies/
function dlg_check_required_plugins() {
    try {
        $active_plugins = apply_filters('active_plugins', get_option('active_plugins'));
        $missing_plugins = array();
        foreach (DLG_REQUIRED_PLUGINS as $plugin_name => $main_file_pattern) {
            if (!dlg_is_plugin_active($main_file_pattern, $active_plugins)) {
                $missing_plugins[] = $plugin_name;
            }
        }
        if (!empty($missing_plugins)) {
            throw new RuntimeException("Missing required plugins");
        }
    }
    catch (RuntimeException $e) {
        add_action('admin_notices', function() use($missing_plugins) {
            // If the user does not have the "activate_plugins" capability, do nothing.
            if (!current_user_can('activate_plugins')) {
                return;
            }
            ?>
                <div class="error notice">
                    <p>
                        <strong>Error:</strong>
                        The <em>Docs for Health Letter Generator</em> plugin won't execute
                        because the following required plugin(s) are not active:
                        <strong>
                            <?php echo esc_html(implode(', ', $missing_plugins)); ?>.
                        </strong>
                        Please activate these plugin(s).
                    </p>
                </div>
            <?php
        });
    }
}

function dlg_is_plugin_active($main_file_pattern, $active_plugins) {
    return !empty(preg_grep($main_file_pattern, $active_plugins));
}
