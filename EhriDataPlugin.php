<?php

require_once(__DIR__.'/vendor/autoload.php');


class EhriDataPlugin extends Omeka_Plugin_AbstractPlugin
{

    protected $_hooks = array('public_head');

    private $twig;

    private $TEMPLATES = array(
        'Repository' => 'institution.twig',
        'HistoricalAgent' => 'authority.twig',
        'DocumentaryUnit' => 'unit.twig',
        'VirtualUnit' => 'virtual.twig',
        'Country' => 'country.twig'
    );

    const API_MIMETYPE = 'application/vnd.api+json';
    const DEFAULT_API_BASE = 'https://portal.ehri-project.eu/api/v1/';

    const DEBUG = true;

    public function __construct()
    {
        Requests::register_autoloader();
        $loader = new Twig_Loader_Filesystem(array(
            dirname(__FILE__) . '/views/public/templates'
        ));

        $this->twig = new Twig_Environment($loader, array(
            'debug' => self::DEBUG,
            'cache' => self::DEBUG ? false : dirname(__FILE__) . '/cache',
        ));
        $this->twig->addExtension(new Twig_Extensions_Extension_Text());
        $this->twig->addExtension(new Twig_Extensions_Extension_Date());
    }


    public function hookPublicHead($args)
    {
        queue_css_file('ehri-shortcode');
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
     * @throws Twig_Error_Loader
     * @throws Twig_Error_Runtime
     * @throws Twig_Error_Syntax
     */
    public function ehri_item_data($args, $view)
    {
        $id = $args["id"];

        $headers = ['Accept' => self::API_MIMETYPE];

        $base = get_option('ehri_shortcode_uri_configuration', self::DEFAULT_API_BASE);
        try {
            $response = Requests::get($base . $id, $headers);
        } catch (Exception $e) {
            error_log($e->getTraceAsString());
            return '<pre>Error requesting EHRI API data.</pre>';
        }

        if (!$response->success) {
            return '<pre>Error requesting EHRI API data: [' . $response->status_code . ']: ' . $response->body . '</pre>';
        }

        $json = json_decode($response->body, true);
        $type = $json['data']['type'];
        $data = $json['data'];

        // If there is 'included' data at the top level, move it
        // into the main data array...
        if (array_key_exists("included", $json)) {
            $data["included"] = $json["included"];
        }

        return array_key_exists($type, $this->TEMPLATES)
            ? $this->twig->render($this->TEMPLATES[$type], $data)
            : "";
    }
}