$(function() {
    // window.setTimeout(function(){
    //     window.location.href = "/";
    // }, 3000);
    var counter = 4;
    var intervalID = window.setInterval(function() {
        if (counter < 1) {
            window.clearInterval(intervalID);
            window.location.href = "/";
        } else {
            $('#counter').text(counter);
            counter--;
        }
    }, 1000);

});
