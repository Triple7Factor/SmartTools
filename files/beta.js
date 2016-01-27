// ==UserScript==
// @name        	ST Tools Beta
// @namespace   	triple7factor
// @description 	IDE tools
// @include     	https://graph.api.smartthings.com/*
// @include			https://smartthings.zendesk.com/*
// @version     	1.0
// @grant       	none
// ==/UserScript==

// Version 1.2.2

// Determine what page is being viewed and display appropriate options
var currentUrl = window.location.href;

// Adds lightweight time script for formatting
$('<script>',{
    src: "https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.11.1/moment.min.js",
    type: "text/javascript"
}).appendTo("head");

// Loads the addon when the page is ready
$(document).ready(function() {

    // Ticket Page
    if (currentUrl.search("zendesk") != -1) {

        if (window.location.href.search("agent/ticket") != -1) {
            // Create ToolBox
            var menu = getToolBox();

            // Add Menu Links
            menu.addLink("Auto Impersonate", impersonateUser);
            menu.addLink("Manual Impersonate", impersonateFeild);
        }

        // Checks what page is active (to see if it's a ticket)
        setInterval(function() {

            if (window.location.href.search("agent/ticket") != -1) {

                // Add the ToolBox if a ticket page is open and the box wasn't open before
                if(!$("div#smarttools-menu").length){
                    var menu = getToolBox();

                    // Add Menu Links
                    menu.addLink("Auto Impersonate", impersonateUser);
                    menu.addLink("Manual Impersonate", impersonateFeild);
                }

            } else {

                if ($("div#smarttools-menu").length) {
                    $("div#smarttools-menu").fadeOut(500).remove();
                }
            }

        // Check every 5 seconds
        },5000);

    } else if (currentUrl.search("graph.api.smartthings.com") != -1) {
        // IDE

        // IDE Pages
        if (currentUrl.search("location/installedSmartApps/") != -1) {
            // Installed SmartApps

            // Create ToolBox
            var menu = getToolBox();
            // Add Menu Links
            menu.addLink("Update All SmartApps", updateApps);

        } else if (currentUrl.search("/events") != -1) {

            // Create ToolBox
            var menu = getToolBox();

            // Add time conversion link
            menu.addLink("Convert To Local Time", convertTime);

            // Checks for updates
            setInterval(function() {

                if (hasPings()) {
                    if (!menu.hasLink("Toggle Ping Events")) {
                        menu.addLink("Toggle Ping Events", togglePings);
                    }
                } else {
                    menu.removeLink("Toggle Ping Events");
                }

            }, 5000);

            // Check if the event page has any ping events
            if (hasPings()) {

                // Add Remove Ping Events if hub page
                menu.addLink("Toggle Ping Events", togglePings);
            }

            if (currentUrl.search("hub/") != -1) {

                // Increase number of events possible and force refresh on option change
                var select = document.getElementById('batchSizeSelect');
                select.options[select.options.length] = new Option('500', '500');
                select.options[select.options.length] = new Option('1000 (slow!)', '1000');
                select.addEventListener('change',function(){
                    select.dispatchEvent(new Event('change'));
                    loadEvents(action);
                });
            }
        }
    }
});

// Create the ToolBox
function getToolBox() {

    // Remove the element if it already exists
    if($("div#smarttools-menu").length){
        $("div#smarttools-menu").remove();
    }

    // Create ToolBox Container
    var menu = $("<div>",{
        style: 'display: none;position:fixed;top:150px;right:0px;padding:10px; padding-right:40px;z-index:200;background:#e3e3e3;border: solid 1px rgba(0,0,0,0.2); border-right: none;-webkit-border-radius: 0 0 0 7px; border-radius: 0 0 0 7px;',
        id: "smarttools-menu",
    }).appendTo("body");

    // Create the Header bar
    var header = $('<div>', {
        style: 'width: 100%; position: relative; display: block; position: relative; padding-left:5px;',
    }).appendTo(menu);

    // Create the minimize tab
    var tab = $('<div>', {
        id: 'tab',
        text: 'ST',
        style: 'margin: 0; line-height: 14px; font-size: 18px; font-weight: bold; padding: 12px 7px; padding-right:10px; position: absolute; display: inline-block; right: 100%; margin-right: 9px; margin-top: -11px; background: #e3e3e3; border-radius: 7px 0 0 7px; border: solid 1px rgba(0,0,0,0.2); border-right: none;',
    }).appendTo(header);

    // Default the tab to closed
    menu.collapsed = true;
    menu.css({"right": -menu.outerWidth()-1});

    menu.hover(function() {
        // Animate the tab open when mouse enters
        menu.stop().animate({"right":0}, "fast");
        menu.collapsed = false;
    }, function() {
        // Animate the tab closed when the mouse leaves
        menu.stop().animate({"right": -menu.outerWidth()-1}, "fast");
        menu.collapsed = true;
    });

    // Create the header title text
    var title = $('<h3>', {
        text:"SmartTools",
        style: 'display: inline-block; width: 100%; padding: 0; padding-bottom: 3px; margin: 0 auto; border-bottom: 1px solid #BBB; margin-bottom: 7px;',
    }).appendTo(header);

    // Add links to the ToolBox that run functions
    menu.addLink = function(title, func) {

        var link = $('<a>',{
            text: title,
            title: title,
            href: '#',
            click: function(e){ e.preventDefault(); func(link); return false; },
            style: 'display: block; padding: 0 5px',
        }).appendTo(menu);

        if (menu.collapsed) {
            menu.css({"right": -menu.outerWidth()-1});
        }

        if (!menu.is(":visible")) {
            menu.delay(100).fadeIn(500);
        }

    };

    menu.removeLink = function(title) {

        var elem = $(menu).find("a[title$='"+ title +"']");
        if (elem.length) {
            elem.remove();
        }

    }

    menu.hasLink = function(title) {
        var link = $(menu).find("a[title$='"+ title +"']");
        return (link.length ? link:false);
    }

    // Return the finished product
    return menu;
}

// Convert the time to readable timezone
function convertTime() {
    // Loop though the different dates in the table
    $("table td .eventDate").each(function() {
        // Make sure it's not already been converted
        if(!$(this).has(".old").length){

            // Get the original time text
            var old = $(this).contents().get(0).nodeValue;

            // Save the original text as a hidden element
            $("<div>", {
                text: old,
                class: "old",
                style: "display: none;",
            }).appendTo(this);

            //Convert the old date to a Date object
            var dateMillis = Date.parse(old);
            var date = new Date(dateMillis);

            // set the output text
            var out = moment(date).format("MMM Do YYYY, h:mm:ss a");

            // Put the text in the original element
            $(this).contents().get(0).nodeValue = out;
        }
    });
}

var updatesRunning = false;

// Loop through all links and activate each "Update" link
function updateApps() {
    if(!updatesRunning) {
        updatesRunning = true;

        $("a.executeUpdate span").remove();

        var links = [];
        var anyFailed = false;
        var i = 0;

        // Loop through each link
        $("a.executeUpdate").each(function() {

            links.push({
                url: $(this).attr("href"),
                context: this,
                async: true,
                complete: function(data) {

                    if(data.responseText.search("OK") == -1) {
                        // Failed
                        $(this).append(" <span><font color=red><b>Error</b></font></span>");
                        console.log(data);
                        anyFailed = true;

                    } else {
                        // Succeeded
                        $(this).append(" <span><font color=green><b>" + data.responseText + "</b></font></span>");
                    }

                    if (i < links.length) {
                        $.ajax(links[i++]);
                    } else {
                        if (!anyFailed) {
                            flashMessage("SmartApps updated successfully!");
                        } else {
                            flashErrorMessage("Error updating one or more SmartApps!");
                        }
                        updatesRunning = false;
                    }

                }
            });

        });

        if (links.length)
            $.ajax(links[i++]);
    }
}

function processUpdateData(elem, data) {
    console.log(elem);
    console.log(data);
}

// Check if a ping event exists
function hasPings() {
    return ($("table").text().indexOf("ping") != -1);
}

// Loop through all event entries and remove each "Ping" entry
function togglePings() {
    $("tr").each(function() {
        if ($(this).text().indexOf("ping") != -1) {
            $(this).toggle();
        }
    });
}

function impersonateFeild(a) {

    if (!$('#st_imp_form').length) {

        a.hide();

        var form = $('<form>', {
            id: "st_imp_form",
        }).insertAfter(a);

        var ein = $('<input>',{
            type: "email",
            style: '',
            placeholder: 'Customer Email',
        }).prop('required',true).appendTo(form);

        var sec = $('<div>', {
            style: 'display: block; text-align: center;',
        }).appendTo(form);

        $('<a>',{
            text: "cancel",
            href: "#",
            click: function() { a.show(); form.remove(); return false;},
            style: 'padding: 5px; margin: 5px 0;margin-right: 10px;',
        }).appendTo(sec);

        $('<input>',{
            type: "submit",
            style: 'padding: 5px; font-weight: bold; margin: 5px 0;',
        }).appendTo(sec);

        form.submit(function(evt) {
            evt.preventDefault();
            a.show();
            var email = ein.val();
            form.remove();
            impersonateUser(a, email);
        });
    }
}

function impersonateUser(a, email) {
    // Verify that a ticket is upen
    if (window.location.href.search("agent/ticket") != -1) {

        // Grab ticket number from URL
        var ticket = window.location.href.split("/").pop();

        // Set parameters for impersonation request and call impersonation URL
        email = email || $("#wrapper[class$='"+ ticket +"'] > #main_panes > div:visible").find("a.email").html();
        var params = encodeURI("j_username=" + email + "&reason=Support Ticket: " + ticket + "&impersonate=Switch+User");

        // Double check before opening impersonation window
        if (confirm("Do you really want to impersonate " + email + " for \"Support Ticket: " + ticket + "\"?")) {

            var win = window.open("https://graph.api.smartthings.com/login/switchUser?" + params, '_blank');
            win.focus();
        }
    }
}

// Display message at top of page (borrowed from existing page source)
function flashMessage(messageText) {

    var tempSource = $("#message-template").html();
    var template = Handlebars.compile(tempSource);
    $("#flash-message-container").html(template({message:messageText}));
}

// Display error message at top of page (borrowed from existing page source)
function flashErrorMessage(messageText) {

    var tempSource = $("#error-template").html();
    var template = Handlebars.compile(tempSource);
    $("#flash-message-container").html(template({error:messageText}));
}

// Request HTTP and return results
function GetHTTP(url) {

    // Initialize results container
    var xmlHttp = null;

    // Call URL and get results
    xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", url, true );
    xmlHttp.send(null);

    // Return results
    return xmlHttp.responseText;
}
