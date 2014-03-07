/*
	Copyright 2014 (c) Liam McSherry
	
	Code to inject user styles into web pages
	with matching hosts + pathnames.
*/

function injectCSS(loc, norecurse) {
	// If we don't receive a value for norecurse,
	// set it to false by default.
	norecurse = typeof norecurse === "undefined"
					? false
					: norecurse
					;
	
	// Retrieve the provided key from storage.
	chrome.storage.local.get(
		"rules",
		function(rules) {
            var CSS = "!";
            console.log(rules);
            if (typeof rules["rules"] !== "undefined") {
                rules["rules"].forEach(function (item) {
                    var regexRule = item["domain"];
                    regexRule = item["domain"]  .replace("\.\*", "(\\\.)?(.+)?(\\\.)?")
                                                .replace("\*\.", "(\\\.)?(.+)?(\\\.)?")
                                                .replace("\*", "(\\\.)?(.+)?(\\\.)?");
                    if (
                        item["domain"] === loc ||
                        loc.match(regexRule) !== null
                            
                    ) {
                        CSS = item["rule"];
                    }
                });
                console.log(CSS);
                // If we got something back, create a <style>
                // element.
                var cssElem = document.createElement("style");
                // Set the "type" attribute of our element to
                // CSS's media type.
                cssElem.type = "text/css";
                // Fill our <style> element with the user-defined
                // CSS rules.
                cssElem.textContent = CSS;
                // Insert our new <style> element with its rules
                // into the page.
                document.head.appendChild(cssElem);
                // Exit.
                return;
            }
            // If the key doesn't exist in storage, we receive an
            // "undefined" back. There are two options we can take
            // from here.
            else if (typeof rules["rules"] === "undefined") {
                // If we are allowed to recurse, injectCSS()
                // again, this time appending a "/" to the
                // end of it.
                if (!norecurse) injectCSS(loc + "/", true);
                // If we're not allowed to recurse, we must
                // conclude that there are no styles for this
                // page, and so we'll exit.
                else return;
            }
        }
	);
}

// Get the current hostname of the page (e.g. "www.google.com")
// Support for per-page styles will probably be implemented in
// a future version. Probably.
var currLoc = window.location.host;
injectCSS(currLoc);
