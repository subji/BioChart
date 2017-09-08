$(function() {
  $("#birth").datepicker({
    dateFormat: "yy-mm-dd",
    changeYear: true,
    changeMonth: true,
    yearRange: "-100:-10",
    defaultDate: '1970-01-01'
  });

  //https://github.com/mrmarkfrench/country-select-js
  $("#country").countrySelect({
    defaultCountry: 'kr',
    preferredCountries: ['kr', 'us', 'fr', 'gb', 'cn', 'jp']
  });
  // ref: http://stackoverflow.com/questions/18754020/bootstrap-3-with-jquery-validation-plugin
  $.validator.setDefaults({
    highlight: function(element) {
      $(element).closest('.form-group').addClass('has-error');
    },
    unhighlight: function(element) {
      $(element).closest('.form-group').removeClass('has-error');
    },
    errorElement: 'span',
    errorClass: 'help-block',
    errorPlacement: function(error, element) {
      if (element.parent('.input-group').length) {
        error.insertAfter(element.parent());
      } else {
        error.insertAfter(element);
      }
    }
  });
  // ref : http://www.sitepoint.com/jquery-validate-date-birth-format-dd-mm-yy/
  $.validator.addMethod("dateFormat",
    function(value, element) {
      // var regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
      // var match = regex.exec(value);
      // if (match === null) return false;
      // if (match[1] > 12) return false;
      // if (match[2] > 31) return false;
      return true;
    }
  );

  $("#registerform").validate({
    debug: true,
    submitHandler: function(form) {
      // console.log(form);
      form.submit();
    },

    rules: {
      fullname: {
        required: true,
        minlength: 3
      },
      password: {
        required: true,
        minlength: 5
      },
      password2: {
        required: true,
        minlength: 5,
        equalTo: "#password"
      },
      birth: {
        required: true,
        dateFormat: true
      },
      mobile: {
        required: true,
        number: true,
        minlength: 10
      }
    },
    messages: {
      username: {
        required: "We need your email address to contact you",
        email: "Your email address must be in the format of name@domain.com"
      },
      fullname: {
        required: "Please specify your name",
        minlength: jQuery.validator.format("At least {0} characters required!")
      },
      password: {
        required: "Please provide a password",
        minlength: "Your password must be at least 5 characters long"
      },
      password2: {
        required: "Please provide a password",
        minlength: "Your password must be at least 5 characters long",
        equalTo: "Please enter the same password as above"
      },
      birth: {
        dateFormat: "Please enter a date in the format mm/dd/yyyy."
      },
      mobile: {
        mobileFormat: "Please enter number only."
      }
    }
  });
});
