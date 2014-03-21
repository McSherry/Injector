$(function() {
    $("#options").on("click", function() {
        chrome.tabs.create({"url": "options.html"});
    });
});