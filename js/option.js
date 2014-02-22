//chrome.storage.local.remove("rules");
//chrome.storage.local.set({"rules": [{"domain": "107.167.86.240", "rule": "body { background: #D45454; }"}]});

function loadStoredRulesToSelectBox() {
    chrome.storage.local.get("rules", function(items) {
        //console.log(items);
        if (typeof items["rules"] !== "undefined") {
            $("#si_rulesList").empty();
            items["rules"].forEach(function(item) {
                $("#si_rulesList").append(
                    "<option value='" + item["domain"] + "'>" + item["domain"] + "</option>"
                );
            });
        }
    });
}

function addRuleToBeStored() {
    if (
        $("#si_addUrlBox").val() != 0 &&
        $("#si_cssRulesBox").val() != 0
    ) {
        chrome.storage.local.get("rules", function(items) {
            if (typeof items["rules"] !== "undefined") {
                
                var doAdd = true;
                items["rules"].forEach(function(i) {
                    if (i["domain"] === $("#si_addUrlBox").val().toLowerCase()) {
                        alert("Rule already exists for \"" + i["domain"] + "\"");
                        doAdd = false;
                    }
                });
                
                console.log(doAdd);
                if (doAdd) {
                    items["rules"].push({ 
                        "domain"    : $("#si_addUrlBox").val().toLowerCase(),
                        "rule"      : $("#si_cssRulesBox").val()
                    });
                    console.log(items["rules"]);
                    chrome.storage.local.set({"rules": items["rules"]}, function() {});
                    
                    loadStoredRulesToSelectBox();
                }
            }
        });
    } else {
        alert("You need to enter a domain and rules. These cannot be whitespace.");
    }
}

function removeRuleFromStore() {
    $("#si_rulesList").val().forEach(function(ruleListItem) {
        console.log(ruleListItem);
        chrome.storage.local.get("rules", function(rules) {
            rules["rules"].forEach(function(item) {
                console.log("%s || %s || --> || %s",
                            item["domain"],
                            ruleListItem,
                            item["domain"] === ruleListItem
                           );
                if (item["domain"] === ruleListItem) {
                    rules["rules"].splice(rules["rules"].indexOf(item), 1);
                    chrome.storage.local.set({"rules": rules["rules"]}, function() { });
                    loadStoredRulesToSelectBox();
                }
            });
        });
        
    });
}

$(function() {
    loadStoredRulesToSelectBox();
    
    $("#si_addUrlButton").on("click", addRuleToBeStored);
    $("#si_removeSetRule").on("click", removeRuleFromStore);
});