<?php

$json = [];
foreach ($_POST as $key => $value) {
    $json['valid'][$key] = '';
}
foreach (['customer_accept_terms', 'customer_newsletter', 'customer_hear_about'] as $key) {
    if (!isset($_POST[$key])) {
        $json['valid'][$key] = '';
    }
}

$data['customer_form'] = (isset($_POST['customer_form']))?$_POST['customer_form']:'';
$data['customer_title'] = (isset($_POST['customer_title']))?$_POST['customer_title']:'';
$data['customer_firstname'] = (isset($_POST['customer_firstname']))?$_POST['customer_firstname']:'';
$data['customer_lastname'] = (isset($_POST['customer_lastname']))?$_POST['customer_lastname']:'';
$data['customer_accept_terms'] = (isset($_POST['customer_accept_terms']))?$_POST['customer_accept_terms']:'';
$data['customer_newsletter'] = (isset($_POST['customer_newsletter']))?$_POST['customer_newsletter']:'';
$data['customer_hear_about'] = (isset($_POST['customer_hear_about']))?$_POST['customer_hear_about']:[];

if (mb_strlen($data['customer_form']) === 0) {
    $json['invalid']['customer_form'] = 'Please select your form.';
} elseif (in_array($data['customer_form'], ['mr', 'mrs'])) {
    $json['invalid']['customer_form'] = 'Please select a valid form.';
}

if (mb_strlen($data['customer_title']) === 0) {
    $json['invalid']['customer_title'] = 'Please enter your title.';
} elseif (mb_strlen($data['customer_title']) < 3) {
    $json['invalid']['customer_title'] = 'Title is too short.';
} elseif (mb_strlen($data['customer_title']) > 50) {
    $json['invalid']['customer_title'] = 'Title is too long.';
}

if (mb_strlen($data['customer_firstname']) === 0) {
    $json['invalid']['customer_firstname'] = 'Please enter your first name.';
} elseif (mb_strlen($data['customer_firstname']) < 3) {
    $json['invalid']['customer_firstname'] = 'First name is too short.';
} elseif (mb_strlen($data['customer_firstname']) > 50) {
    $json['invalid']['customer_firstname'] = 'First name is too long.';
}

if (mb_strlen($data['customer_lastname']) === 0) {
    $json['invalid']['customer_lastname'] = 'Please enter your last name.';
} elseif (mb_strlen($data['customer_lastname']) < 3) {
    $json['invalid']['customer_lastname'] = 'Last name is too short.';
} elseif (mb_strlen($data['customer_lastname']) > 50) {
    $json['invalid']['customer_lastname'] = 'Last name is too long.';
}

if ($data['customer_accept_terms'] !== '1') {
    $json['invalid']['customer_accept_terms'] = 'Please accept the terms.';
}

if (($data['customer_newsletter'] !== '0') && ($data['customer_newsletter'] !== '1')) {
    $json['invalid']['customer_newsletter'] = 'Please select newsletter.';
}

if (count($data['customer_hear_about']) === 0) {
    $json['invalid']['customer_hear_about'] = 'Please select how you heard about us.';
}

$json['invalid']['customer_newsletter_themes'] = 'Please select your themes.';

if ((!isset($json['invalid'])) || ($json['invalid'] === [])) {
    $json['success'] = true;
    $json['redirect'] = 'index.html';
} else {
    $json['success'] = false;
    foreach ($json['invalid'] as $key => $value) {
        if (isset($json['valid'][$key])) {
            unset($json['valid'][$key]);
        }
    }
}

header('Content-Type: application/json');
echo json_encode($json);
exit;

?>
