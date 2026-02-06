<?php

require_once(__DIR__.'/vendor/autoload.php');


class EhriDataPlugin extends Omeka_Plugin_AbstractPlugin
{

    protected $_hooks = array('public_head');
    const DEFAULT_API_BASE = 'https://portal.ehri-project.eu';

    public function hookPublicHead($args)
    {
		queue_js_file('ehri-web-components');
    }

    public function setUp()
    {
        add_shortcode('ehri_item_data', array($this, 'ehri_item_data'));
        add_plugin_hook('config_form', array($this, 'ehri_shortcode_config_form'));
        add_plugin_hook('config', array($this, 'ehri_shortcode_config'));

        parent::setUp();
    }

    public function ehri_shortcode_config_form()
    {
        include(dirname(__FILE__) . '/views/admin/config_form.php');
    }

    public function ehri_shortcode_config()
    {
        set_option('ehri_shortcode_uri_configuration', trim($_POST['ehri_shortcode_uri_configuration']));
    }

    /**
     * @param $args
     * @param $view
     * @return string
     */
    public function ehri_item_data($args, $view)
    {
        $id = $args["id"];
        $base = get_option('ehri_shortcode_uri_configuration', self::DEFAULT_API_BASE);

		return sprintf('<ehri-item item-id="%s" base-url="%s"></ehri-item>', $id, $base);
    }
}