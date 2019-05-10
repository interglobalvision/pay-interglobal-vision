<?php
require_once('vendor/autoload.php');
require_once('secret-keys.php');

// Get the credit card details submitted by the form
$form = $_POST['form'];
$form_decode = json_decode($form);

$name = filter_var($form_decode[0]->value, FILTER_SANITIZE_STRING);
$email = filter_var($form_decode[1]->value, FILTER_VALIDATE_EMAIL);
$amount = filter_var($form_decode[2]->value, FILTER_VALIDATE_FLOAT);
$currency = filter_var($form_decode[3]->value, FILTER_SANITIZE_FULL_SPECIAL_CHARS);
$destination = filter_var($form_decode[4]->value, FILTER_SANITIZE_FULL_SPECIAL_CHARS);
$description = filter_var($form_decode[5]->value, FILTER_SANITIZE_STRING);
$token = filter_var($form_decode[6]->value, FILTER_SANITIZE_SPECIAL_CHARS);

// Set your secret key: remember to change this to your live secret key in production
// See your keys here: https://dashboard.stripe.com/account/apikeys
$api_key = $destination === 'a' ? $test_key_a : $test_key_b;

\Stripe\Stripe::setApiKey($api_key);

// Create a charge: this will charge the user's card
try {
  $charge = \Stripe\Charge::create(array(
    "amount" => $amount * 100, // Amount in cents
    "currency" => $currency,
    "source" => $token,
    "description" => $description,
    "metadata" => array(
      "customer" => $name,
      "email" => $email,
    ),
    "receipt_email" => $email,
  ));

  echo $charge['outcome']['type'];
} catch(\Stripe\Error\Card $e) {
  // Since it's a decline, \Stripe\Error\Card will be caught
  $body = $e->getJsonBody();
  $err  = $body['error'];

  echo json_encode($err);
} catch (\Stripe\Error\RateLimit $e) {
  // Too many requests made to the API too quickly
  echo 'Too many requests were made too quickly! Please wait a moment and then try again. If you continue to receive this error, please contact us at <a href="mailto:globie@interglobal.vision">globie@interglobal.vision</a> with this error message.';
} catch (\Stripe\Error\InvalidRequest $e) {
  // Invalid parameters were supplied to Stripe's API
  echo 'Invalid request. Please try again, or contact us at <a href="mailto:globie@interglobal.vision">globie@interglobal.vision</a> with this error message.';
} catch (\Stripe\Error\Authentication $e) {
  // Authentication with Stripe's API failed
  // (maybe you changed API keys recently)
  echo 'Authentication failed. Please contact us at <a href="mailto:globie@interglobal.vision">globie@interglobal.vision</a> with this error message.';
} catch (\Stripe\Error\ApiConnection $e) {
  // Network communication with Stripe failed
  echo 'Network communication failed. Please try again, or contact us at <a href="mailto:globie@interglobal.vision">globie@interglobal.vision</a> with this error message.';
} catch (\Stripe\Error\Base $e) {
  // Display a very generic error to the user, and maybe send
  // yourself an email
  echo 'An unknown payment error occurred. Please try again, or contact us at <a href="mailto:globie@interglobal.vision">globie@interglobal.vision</a> with this error message.';
} catch (Exception $e) {
  // Something else happened, completely unrelated to Stripe
  echo 'Exception: An unknown error occurred. Please try again, or contact us at <a href="mailto:globie@interglobal.vision">globie@interglobal.vision</a> with this error message.';
}
?>
