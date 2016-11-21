/* jshint browser: true, devel: true, indent: 2, curly: true, eqeqeq: true, futurehostile: true, latedef: true, undef: true, unused: true */
/* global jQuery, $, document, Site, Modernizr */

Site = {
  mobileThreshold: 601,
  init: function() {
    var _this = this;

    _this.Stripe.init();

    $(window).resize(function(){
      _this.onResize();
    });

  },

  onResize: function() {
    var _this = this;

  },

  fixWidows: function() {
    // utility class mainly for use on headines to avoid widows [single words on a new line]
    $('.js-fix-widows').each(function(){
      var string = $(this).html();
      string = string.replace(/ ([^ ]*)$/,'&nbsp;$1');
      $(this).html(string);
    });
  },
};

Site.Stripe = {
  $form: $('#payment-form'),
  init: function() {
    var _this = this;

    // Stripe public keys
    //
    // Test:
    // pk_test_QJv0NVjinlteY6ji0HOrah9n
    //
    // Live: 
    // pk_live_1iLay9wxJyeywHOFX4Q9kMtl

    Stripe.setPublishableKey('pk_test_QJv0NVjinlteY6ji0HOrah9n');

    _this.createToken();
  },

  createToken: function() {
    var _this = this;

    _this.$form.submit(function(event) {

      // Clear response
      $('#payment-response').attr('class', '').html('&nbsp;');
      
      // Disable the submit button to prevent repeated clicks:
      _this.$form.find('.submit').prop('disabled', true);

      // Request a token from Stripe:
      Stripe.card.createToken(_this.$form, _this.stripeResponseHandler.bind(_this));

      // Prevent the form from being submitted:
      return false;
    });
  },

  stripeResponseHandler: function(status, response) {
    var _this = this;

    if (response.error) { // Problem!

      // Show the errors on the form:
      $('#payment-response').attr('class', 'show declined').html(response.error.message);
      _this.$form.find('.submit').prop('disabled', false); // Re-enable submission

    } else { // Token was created!

      // Get the token ID:
      var token = response.id;

      // Insert the token ID into the form so it gets submitted to the server:
      _this.$form.append($('<input type="hidden" name="stripeToken">').val(token));

      var values = JSON.stringify(_this.$form.serializeArray());

      var request = $.ajax({
        url: "charge.php",
        method: "POST",
        data: {form: values}
      });
       
      request.done(function( msg ) {
        _this.$form.find('input[type=text], textarea').val(''); // Clear form values
        _this.$form.find('.submit').prop('disabled', false); // Re-enable submission

        if (msg == 'authorized') {
          $('#payment-response').attr('class', 'show authorized').html('Your payment has been authorized. Thank you.');
        }
      });
       
      request.fail(function( jqXHR, textStatus ) {
        _this.$form.find('.submit').prop('disabled', false);
        $('#payment-response').attr('class', 'show declined').html(textStatus + '. Please try again.');
      });
    }
  },
};

jQuery(document).ready(function () {
  'use strict';

  Site.init();

});