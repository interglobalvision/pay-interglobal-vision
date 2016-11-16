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
  init: function() {
    var _this = this;

    _this.$form = $('#payment-form');

    Stripe.setPublishableKey(Keys.Test.publish);

    _this.createToken();
  },

  createToken: function() {
    var _this = this;

    _this.$form.submit(function(event) {
      
      // Disable the submit button to prevent repeated clicks:
      _this.$form.find('.submit').prop('disabled', true);

      // Request a token from Stripe:
      Stripe.card.createToken(_this.$form, _this.stripeResponseHandler);

      // Prevent the form from being submitted:
      return false;
    });
  },

  stripeResponseHandler: function(status, response) {
    var _this = this;

    if (response.error) { // Problem!

      // Show the errors on the form:
      _this.$form.find('.payment-errors').text(response.error.message);
      _this.$form.find('.submit').prop('disabled', false); // Re-enable submission

    } else { // Token was created!

      // Get the token ID:
      var token = response.id;

      // Insert the token ID into the form so it gets submitted to the server:
      _this.$form.append($('<input type="hidden" name="stripeToken">').val(token));

      // Submit the form:
      _this.$form.get(0).submit();
    }
  },
};

jQuery(document).ready(function () {
  'use strict';

  Site.init();

});