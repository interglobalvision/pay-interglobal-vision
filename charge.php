<?php
require_once('vendor/autoload.php');
require_once('secret-keys.php');

// Get the credit card details submitted by the form
$form = $_POST['form'];
$form_decode = json_decode($form);

$name = $form_decode[0]->value;
$amount = $form_decode[1]->value;
$currency = $form_decode[2]->value;
$description = $form_decode[3]->value;
$token = $form_decode[4]->value;

// Set your secret key: remember to change this to your live secret key in production
// See your keys here: https://dashboard.stripe.com/account/apikeys
\Stripe\Stripe::setApiKey($test_key);

// Create a charge: this will charge the user's card
try {
  $charge = \Stripe\Charge::create(array(
    "amount" => $amount * 100, // Amount in cents
    "currency" => $currency,
    "source" => $token,
    "description" => $description,
    "metadata" => array("customer" => $name),
    ));

  echo $charge['outcome']['type'];
} catch(\Stripe\Error\Card $e) {
  // The card has been declined
  echo $e;
}
?>