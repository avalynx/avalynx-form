<?php

$json = [];
foreach ($_POST as $key => $value) {
    $json['valid'][$key] = '';
}

// Name of the autocomplete fields (or their keys)
// AvalynxAutocomplete sends the key under [name]_key or the name specified in data-key-name by default.
// If no name is specified, 'avalynx_autocomplete_key' is used.
// In our example, the fields are named 'customer_autocomplete' and 'customer_tags'.
// AvalynxAutocomplete creates 'customer_autocomplete_key' and 'customer_tags_key' for this (as data-key-name is not set).

$autocomplete_key = isset($_POST['customer_autocomplete_key']) ? $_POST['customer_autocomplete_key'] : '';
$tags_key = isset($_POST['customer_tags_key']) ? $_POST['customer_tags_key'] : '[]';
$decoded_tags = json_decode($tags_key, true);
$tags_count = is_array($decoded_tags) ? count($decoded_tags) : 0;

if (empty($autocomplete_key)) {
    $json['invalid']['customer_autocomplete'] = 'Please select a product.';
}

$customer_firstname = isset($_POST['customer_firstname']) ? $_POST['customer_firstname'] : '';
if (strlen($customer_firstname) < 2) {
    $json['invalid']['customer_firstname'] = 'First name must be at least 2 characters long.';
}

$customer_lastname = isset($_POST['customer_lastname']) ? $_POST['customer_lastname'] : '';
if (strlen($customer_lastname) < 2) {
    $json['invalid']['customer_lastname'] = 'Last name must be at least 2 characters long.';
}

if ($tags_count < 2) {
    $json['invalid']['customer_tags'] = 'Please select at least 2 tags.';
}

if ((!isset($json['invalid'])) || ($json['invalid'] === [])) {
    $json['success'] = true;
    $json['redirect'] = 'form-avalynx-autocomplete-validation.html?success=1';
} else {
    $json['success'] = false;
    foreach ($json['invalid'] as $key => $value) {
        if (isset($json['valid'][$key])) {
            unset($json['valid'][$key]);
        }
        if (isset($json['valid'][$key . '_key'])) {
            unset($json['valid'][$key . '_key']);
        }
    }
}

header('Content-Type: application/json');
echo json_encode($json);
exit;

?>
