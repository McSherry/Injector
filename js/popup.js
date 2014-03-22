$(function() {
    $("#options").on("click", function() {
        chrome.tabs.create({"url": "options.html"});
    });
    
    $(".website").on("click", function() {
        chrome.tabs.create({"url": "http://injector.io"});
    });
});