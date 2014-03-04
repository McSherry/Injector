function createDefaultRuleStore() {
    chrome.storage.local.get("rules", function(items) {
        if (typeof items["rules"] === "undefined") {
            chrome.storage.local.set({"rules":[]}, function() {});
        }
    });
    
    chrome.storage.local.get("disabled_rules", function(items) {
        if (typeof items["disabled_rules"] === "undefined") {
            chrome.storage.local.set({"disabled_rules":[]});
        }
    });
}

function loadStoredRulesToSelectBox() {
    createDefaultRuleStore();
    
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
    createDefaultRuleStore();
    
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
                    resetInputFields();
                }
            }
        });
    } else {
        alert("You need to enter a domain and rules. These cannot be whitespace.");
    }
}

function removeRuleFromStore() {
    createDefaultRuleStore();
    
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

function resetInputFields() {
    $("#si_addRuleInputsCtnr *").val("");
}

function editRuleFromStore() {
    var editItem = $("#si_rulesList").val();
    
    if (typeof editItem !== "undefined") {
        $("#si_editSetRule").prop("disabled", true);
        $("#si_removeSetRule").prop("disabled", true);
        $("#si_addUrlBox").prop("disabled", true);
        $("#si_rulesList").prop("disabled", true);
        
        editItem = editItem[0];
    
        $("#si_addUrlButton").val("Save Edit");
        $("#si_resetUrlButton").val("Cancel Edit");
        
        $("#si_resetUrlButton").off("click").on("click", cancelEditFromStore);
        $("#si_addUrlButton").off("click").on("click", performEditOnStoredRule);
        
        $("#si_addUrlBox").val(editItem);
        chrome.storage.local.get("rules", function(ret) {
            ret["rules"].forEach(function(i) {
                if (i["domain"] === editItem) {
                    $("#si_cssRulesBox").val(i["rule"]);
                }
            });
        });
    }
}
function cancelEditFromStore() {
    $("#si_editSetRule").prop("disabled", false);
    $("#si_removeSetRule").prop("disabled", false);
    $("#si_addUrlBox").prop("disabled", false);
    $("#si_rulesList").prop("disabled", false);
    
    $("#si_addUrlButton").val("Add");
    $("#si_resetUrlButton").val("Reset");
    
    $("#si_addUrlButton").off("click").on("click", addRuleToBeStored);
    $("#si_resetUrlButton").off("click").on("click", resetInputFields);
    resetInputFields();
}
function performEditOnStoredRule() {
    var ruleDomain = $("#si_addUrlBox").val();
    
    if ($("#si_cssRulesBox").val() != 0) {
        chrome.storage.local.get("rules", function(ret) {
            var ctr = 0;
            console.log(ret["rules"]);
            ret["rules"].forEach(function(i) {
                if (ret["rules"][ctr]["domain"] === ruleDomain) {
                    console.log(ctr);
                    ret["rules"][ctr]["rule"] = $("#si_cssRulesBox").val();
                    
                    chrome.storage.local.set({"rules": ret["rules"]});
                    
                    cancelEditFromStore();
                }
                ++ctr;
            });
        });
    } else {
        alert("Your rule cannot be whitespace.\n\nIf you'd like to delete this rule, use the \"Remove\" button.");
    }
}

function disableRuleFromStore() {
    createDefaultRuleStore();
}

$(function() {
    createDefaultRuleStore();
    loadStoredRulesToSelectBox();
    
    $("#si_addUrlButton").on("click", addRuleToBeStored);
    $("#si_removeSetRule").on("click", removeRuleFromStore);
    $("#si_resetUrlButton").on("click", resetInputFields);
    $("#si_editSetRule").on("click", editRuleFromStore);
        
    $("#si_rulesList").on("change", function() {
        var list = $(this);
        
        list.val().forEach(function(item) {
            
        });
    });
    
    $("#si_cssRulesBox").keydown(function (key) {
        if (key.keyCode == 9) {
            $(this).val(
                $(this).val().substring(0, this.selectionStart) +
                "    " +
                $(this).val().substring(this.selectionEnd)
            );
            
            this.selectionStart = this.selectionEnd = this.selectionStart + 1;
            
            key.preventDefault();
        }
    });
});