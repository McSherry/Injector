var cm;
var ver = 400;

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
    
    chrome.storage.local.get("disabled_rules", function(items) {
        //console.log(items);
        if (typeof items["disabled_rules"] !== "undefined") {
            items["disabled_rules"].forEach(function(item) {
                $("#si_rulesList").append(
                    "<option class='disabled' value='" + item["domain"] + "'>" + item["domain"] + "</option>"
                );
            });
        }
    });
}

function addRuleToBeStored() {
    createDefaultRuleStore();
    
    if (
        $("#si_addUrlBox").val() != 0 &&
        cm.getValue() != 0
    ) {
        chrome.storage.local.get("rules", function(items) {
            if (typeof items["rules"] !== "undefined") {
                
                var doAdd = true;
                items["rules"].forEach(function(i) {
                    if (i["domain"] === $("#si_addUrlBox").val().toLowerCase()) {
                        //showNotice({
                        //    content: "Rule already exists for &quot;" + i["domain"] + ".&quot;",
                        //    type: "warning"
                        //});
                        //alert("Rule already exists for \"" + i["domain"] + "\"");
                        doAdd = false;
                    }
                });
                
                console.log(doAdd);
                if (doAdd) {
                    items["rules"].push({ 
                        "domain"    : $("#si_addUrlBox").val().toLowerCase(),
                        "rule"      : $("#si_cssMinify").prop("checked")
                                        ?   jsmin(cm.getValue())
                                        :   cm.getValue()
                    });
                    console.log(items["rules"]);
                    chrome.storage.local.set({"rules": items["rules"]}, function() {});
                    
                    loadStoredRulesToSelectBox();
                    resetInputFields();
                }
            }
        });
    } else {
        showNotice({
            content: "You must enter a domain and rules. These cannot be whitespace.",
            type: "warning"
        });
    }
}

function removeRuleFromStore() {
    createDefaultRuleStore();
    
    $("#si_rulesList").val().forEach(function(ruleListItem) {
        console.log(ruleListItem);
        chrome.storage.local.get("rules", function(rules) {
            var has = false;
            rules["rules"].forEach(function(item) {
                console.log("%s || %s || --> || %s",
                            item["domain"],
                            ruleListItem,
                            item["domain"] === ruleListItem
                           );
                if (item["domain"] === ruleListItem) {
                    has = true;
                    rules["rules"].splice(rules["rules"].indexOf(item), 1);
                    chrome.storage.local.set({"rules": rules["rules"]}, function() { });
                    loadStoredRulesToSelectBox();
                }
            });
            
            if (!has) {
                chrome.storage.local.get("disabled_rules", function(dr) {
                    dr["disabled_rules"].forEach(function(i) {
                        if (i["domain"] === ruleListItem) {
                            dr["disabled_rules"].splice(dr["disabled_rules"].indexOf(item), 1);
                            chrome.storage.local.set({"disabled_rules": dr["disabled_rules"]});
                            loadStoredRulesToSelectBox();
                        }
                    });
                });
            }
        });
        
    });
}

function resetInputFields() {
    $("#si_addRuleInputsCtnr *").val("");
    cm.setValue("");
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
                    cm.setValue(i["rule"]);
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
    
    if (cm.getValue() != 0) {
        chrome.storage.local.get("rules", function(ret) {
            var ctr = 0;
            console.log(ret["rules"]);
            ret["rules"].forEach(function(i) {
                if (ret["rules"][ctr]["domain"] === ruleDomain) {
                    console.log(ctr);
                    ret["rules"][ctr]["rule"] = cm.getValue();
                    
                    chrome.storage.local.set({"rules": ret["rules"]});
                    
                    cancelEditFromStore();
                }
                ++ctr;
            });
        });
    } else {
        showNotice({
            content: "Rule cannot be whitespace. Use the &quot;Remove&quot; button to delete rules.",
            type: "warning"
        });
        //alert("Your rule cannot be whitespace.\n\nIf you'd like to delete this rule, use the \"Remove\" button.");
    }
}

function disableRuleFromStore(ruleName) {
    createDefaultRuleStore();
    
    chrome.storage.local.get("rules", function(r) {
        var disRule;
        
        r["rules"].forEach(function(i) {
            if (i["domain"] === ruleName) disRule = i;
        });
        
        r["rules"].splice(r["rules"].indexOf(disRule, 1));
        
        chrome.storage.local.set({"rules": r["rules"]});
        chrome.storage.local.get("disabled_rules", function(dr) {
            var drules = dr["disabled_rules"];
            
            drules.push({"domain": disRule["domain"], "rule": disRule["rule"]});
            
            chrome.storage.local.set({"disabled_rules": drules});
            
            $("#si_rulesList option:contains(" + disRule["domain"] + ")").addClass("disabled");
        });
    });
}
function enableRuleFromStore(ruleName) {
    createDefaultRuleStore();
    
    chrome.storage.local.get("disabled_rules", function(dr) {
        var enRule;
        
        dr["disabled_rules"].forEach(function(i) {
            if (i["domain"] === ruleName) enRule = i;
        });
        
        dr["disabled_rules"].splice(dr["disabled_rules"].indexOf(enRule, 1));
        
        chrome.storage.local.set({"disabled_rules": dr["disabled_rules"]});
        chrome.storage.local.get("rules", function(r) {
            var rules = r["rules"];
            
            rules.push({"domain": enRule["domain"], "rule": enRule["rule"]});
            chrome.storage.local.set({"rules": rules});
            
            $("#si_rulesList option:contains(" + enRule["domain"] + ")").removeClass("disabled");
        });
    });
}

function clearNotice() {
    $(".noticeCtnr").animate({height: "0px"}, 400, function() {
        $(this).html("");
    });
}
function showNotice(args) {
    $(".noticeCtnr").animate({height: "0px"}, 400, function() {
        $(this).html(
            '<div class="notice ' + (typeof args.type === "undefined" ? '' : args.type) +
                '">' +
            '<div class="close"></div>' +
            args.content +
            '</div>'
        );
        $(this).delay(100);
        $(this).animate({height: "48px"}, 600);
    });
}

$(function() {
    cm = CodeMirror(document.getElementById("si_addRuleInputsCtnr"), { mode: "text/css" });
    
    createDefaultRuleStore();
    loadStoredRulesToSelectBox();
    
    $(".noticeCtnr").on("click", ".notice .close", clearNotice);
    
    $("#si_addUrlButton").on("click", addRuleToBeStored);
    $("#si_removeSetRule").on("click", removeRuleFromStore);
    $("#si_resetUrlButton").on("click", resetInputFields);
    $("#si_editSetRule").on("click", editRuleFromStore);
        
    $("#si_rulesList").on("change", function() {
        var list = $(this);
        var leng = list.val().length;
        
        if (leng === 0) {
            $("#si_disableSetRule").prop("disabled", true);
        } else if (leng === 1) {
            chrome.storage.local.get("rules", function(rules) {
                var matches = 0;
                rules["rules"].forEach(function(i) {
                    console.log("%s || %s", i["domain"], list.val()[0]);
                    if (i["domain"] === list.val()[0]) ++matches;
                });
                if (matches > 0) {
                    $("#si_disableSetRule")
                        .addClass("warn")
                        .val("Disable")
                        .off("click")
                        .on("click", function() {
                            disableRuleFromStore($("#si_rulesList").val()[0]);
                            loadStoredRulesToSelectBox();
                            $("#si_rulesList").prop("selected", false);
                        })
                        .prop("disabled", false)
                } else {
                    $("#si_disableSetRule")
                        .removeClass("warn")
                        .val("Enable")
                        .prop("disabled", false)
                        .off("click")
                        .on("click", function() {
                            enableRuleFromStore($("#si_rulesList").val()[0]);
                            loadStoredRulesToSelectBox();
                            $("#si_rulesList").prop("selected", false);
                        });
                }
            });
        } else {
            $("#si_disableSetRule")
                .removeClass("warn")
                .val("Disable")
                .prop("disabled", true);
        }
    });
    $("#si_disableSetRule").on("click", function() {
        disableRuleFromStore($("#si_rulesList").val()[0]);
        loadStoredRulesToSelectBox();
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