<?php
/*
Plugin Name: API Grid Viewer
Description: A plugin designed for testing complex JSON APIs in WordPress. View your API in a table grid format. For custom plugin requests, feel free to reach out to me at <a href="mailto:geegeetech.com@gmail.com">geegeetech.com@gmail.com</a>. If you appreciate my work, please consider supporting me by <a href="https://www.buymeacoffee.com/gladwingt">buying me a coffee</a>!
Version: 1.0
Author: Gladwin GT
Author URI: https://geegeetech.site
License: GPLv2 or later
Visit Site: https://geegeetech.site
*/




add_action('admin_menu', 'apigridviewer_plugin_menu');
add_action('admin_enqueue_scripts', 'apigridviewer_enqueue_scripts');
add_action('wp_ajax_proxy_request', 'apigridviewer_proxy_request');
add_action('wp_ajax_nopriv_proxy_request', 'apigridviewer_proxy_request');

function apigridviewer_plugin_menu() {
    add_menu_page('API Grid Viewer', 'API Grid Viewer', 'manage_options', 'apigridviewer', 'apigridviewer_render_page', 'dashicons-rest-api', 6);
	add_submenu_page('apigridviewer','About WP API Grid Viewer','About','manage_options','apigridviewer-about','apigridviewer_about_page');

}

function apigridviewer_enqueue_scripts($hook) {

if ($hook === 'toplevel_page_apigridviewer') {
    wp_enqueue_style('api-grid-viewer-style', plugins_url('css/api-grid-viewer-style.css', __FILE__), [], '1.0');
    wp_enqueue_script('api-grid-viewer-script', plugins_url('js/api-grid-viewer-script.js', __FILE__), ['jquery'], '1.0', true);
    
    wp_localize_script('api-grid-viewer-script', 'apiGridViewer', [
        'ajaxurl' => admin_url('admin-ajax.php'),
        'nonce'   => wp_create_nonce('api_grid_viewer_nonce'),
    ]);}
}

function apigridviewer_proxy_request() {
    check_ajax_referer('api_grid_viewer_nonce', 'security');
    if (!isset($_POST['url']) || empty($_POST['url'])) {
        wp_send_json_error('URL is required.');
        wp_die();
    }
       $url = esc_url_raw(wp_unslash($_POST['url']));
$headers = isset($_POST['headers']) ? sanitize_text_field(wp_unslash($_POST['headers'])) : [];
    if (is_string($headers)) {
        $headers = json_decode($headers, true);
    }
    if (is_array($headers)) {
        $headers = array_map('sanitize_text_field', $headers);
    } else {
        $headers = [];
    }

$params = isset($_POST['params']) ? array_map('sanitize_text_field', wp_unslash($_POST['params'])) : [];
    if (is_array($params)) {
        // Sanitize each param value
        $params = array_map('sanitize_text_field', $params);
    } else {
        $params = [];
    }
    
    $args = [
        'headers' => $headers,
        'body'    => $params,
    ];
    $response = wp_remote_get($url, $args);
        if (is_wp_error($response)) {
        wp_send_json_error(['message' => $response->get_error_message()]);
    } else {
        $body = wp_remote_retrieve_body($response);
                wp_send_json($body);
    }
    wp_die();
}

function apigridviewer_render_page() {
    ?>
    <div class="wrap">
        <div id="apigridviewer-app">
			        <h1>Api Grid Viewer</h1>

            <div class="url-input ">
                <input type="text" id="url" placeholder="Enter API URL" class="mac-input full-width" />
                <button id="send-request" class="mac-button">Send</button>
            </div>
			
            <div class="auth-section ">
                <select id="auth-type" class="dropdown mac-dropdown">
                    <option value="none">None</option>
                    <option value="key">Key</option>
                    <option value="bearer">Bearer Code</option>
                    <option value="basic">Basic (User/Password)</option>
                </select>
                <div id="auth-fields"></div>
            </div>
            <div id="params">
                <button id="add-param" class="mac-button">Add Parameter</button>
            </div>
            <input type="text" id="search-bar" placeholder="Search Table" class="mac-input" style="display: none;" />
            <div id="response"></div>
			<div id="download-buttons" style="display:none;">
    <button id="download-json" class="mac-button">Download JSON</button>
</div>
        </div>
    </div>
<a href="https://www.buymeacoffee.com/gladwingt" target="_blank" style="position: fixed; right: 18px; bottom: 18px; z-index: 1000; background-color: #FFDD00; border-radius: 50%; padding: 10px;">
  <img src="<?php echo esc_url(plugins_url('img/coffee-cup.svg', __FILE__)); ?>" alt="Buy Me a Coffee" style="height: 30px; width: 30px;">
</a>
    <?php
}
function apigridviewer_about_page() {
    ?>
    <div class="wrap">
        <div class="api-grid-about-card">
            <h2>About API Grid Viewer</h2>
            <p>Plugin Author: <strong>Gladwin GT</strong></p>
            <p>Website: <a href="https://geegeetech.site" target="_blank">geegeetech.site</a></p>
            <p>Email: <a href="mailto:geegeetech.com@gmail.com">geegeetech.com@gmail.com</a></p>
            <p>This plugin lets you test JSON APIs from the WordPress Admin. It supports various authentication methods (None, Key, Bearer, Basic), allows you to dynamically manage API parameters, and displays responses as formatted tables. Search functionality is also included, and no external libraries are used, ensuring data safety.</p>
            <p>Need custom plugins or help with complex API integrations? Contact me at <a href="mailto:geegeetech.com@gmail.com">geegeetech.com@gmail.com</a>.</p>
            <p>If you appreciate my work, consider buying me a coffee:</p>
            <a href="https://www.buymeacoffee.com/gladwingt" target="_blank">
                <img src="<?php echo esc_url(plugins_url('img/default-yellow.png', __FILE__)); ?>" alt="Buy Me a Coffee" style="height: 60px; width: 217px;">
            </a>
        </div>
    </div>
    <?php
}


?>
