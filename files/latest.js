// Version 1.3.0

// Determine what page is being viewed and display appropriate options
var currentUrl = window.location.href;

var showPings = true;
var timeConverted = false;

var keepOpen = false;

var search;
var searching = false;

$.fn.center = function() {
    this.css("position","fixed");
    this.css("top", Math.max(0, ($(window).height() - $(this).outerHeight())/2) + "px");
    this.css("left", Math.max(0, ($(window).width() - $(this).outerWidth())/2) + "px");
    return this;
};

// Adds lightweight time script for formatting
$('<script>',{
    src: "https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.11.1/moment.min.js",
    type: "text/javascript",
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

    } else if (currentUrl.search("api.smartthings.com") != -1) {
        // IDE

        if ($("#show-location").length) {
            $("#show-location > div.table-wrap").css("overflow", "hidden");
        }

        // IDE Pages
        if (currentUrl.search("location/installedSmartApps/") != -1) {
            // Installed SmartApps

            // Create ToolBox
            var menu = getToolBox();
            // Add Menu Links
            menu.addLink("Update All SmartApps", updateApps);

        /*} else if (currentUrl.search("/notifications") != -1) {

            var refreshUrl = currentUrl.split("?")[0];

            $("div.table-wrap > a").remove();

            var batchVal = $.cookie('notifications-batch-size');
            var batchShowing = batchVal;

            var loadingMore = false;

            function loadNotifications(append) {
                if (!append) {
                    batchShowing = batchVal;
                } else {
                    batchShowing += batchVal;
                }

                loadingMore = true;

                $.ajax({
                    url: refreshUrl,
                    data: {
                        type: "location",
                        all: "",
                        source: "",
                        max: batchShowing,
                    },
                    dataType: 'html',
                    success: function(data) {
                        //TODO load only new content
                        loadingMore = false;
                    }
                });
            }

            var options = [10,20,50,100,500];

            var selectMenu = $("<select>", {
                style: "display: block; padding: 5px; margin: 10px; margin-left: 30px;",
            }).insertBefore($("#list-acl")).change(function(val) {
                if ($(this).val() != batchVal) {
                    batchVal = $(this).val();
                    $.cookie('notifications-batch-size', batchVal);
                    loadNotifications(false);
                }
            });

            options.forEach(function(val, index) {
                $("<option>", {
                    text: val,
                    value: val,
                }).appendTo(selectMenu);
            });

            $(selectMenu).find("option[value='"+ batchVal +"']").prop('selected', true);

            loadNotifications(false);
            */
        } else if (currentUrl.search("/events") != -1) {

            // Create ToolBox
            var menu = getToolBox();

            // Add time conversion link
            menu.addLink("Search Events", openSearch);
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

            updateOptions();

            if (typeof loadEvents == 'function') {
                loadEvents = function(action) {
    				$.ajax({
    					url: "/event/listAclEvents",
    					data: {
    						all: $('#all').val(),
    						source: $('#source').val(),
    						max: enablePolling ? 0 : $('#max').val(),
    						id: $('#id').val(),
    						type: $('#type').val(),
    						sinceDate: $('#sinceDate:visible').val(),
    						beforeDate: $('#beforeDate:visible').val(),
    						eventType: $('#eventType').val(),
    						nameFilter: $('#nameFilter:visible').val()
    					},
    					beforeSend: function(xhr) {
    						$('#fetchingEventsSpinner').css('display', 'inline-block');
                            endSearch();
    					},
    					success: function(data) {
    						$('#fetchingEventsSpinner').hide();
    						$('.list-acl').html(data);
                            updateOptions();
    					}
    				});
    			}
            }

            $(window).unbind("scroll");
            $(window).scroll(function() {
                if(enablePolling === false && inView($("div.footer"))) {
                    if (loadingMoreEvents !== true && searching !== true && ($('#lastEvaluatedHashKey').val() !== "" && $('#lastEvaluatedRangeKey').val() !== ""
                            || $('#startAfter').val() !== "")) {
                        loadingMoreEvents = true
                        $.ajax({
                            url: "/event/listMoreEvents",
                            data: {
                                all: $('#all').val(),
                                source: $('#source').val(),
                                max: $('#max').val(),
                                id: $('#id').val(),
                                type: $('#type').val(),
                                sinceDate: $('#sinceDate:visible').val(),
                                beforeDate: $('#beforeDate:visible').val(),
                                eventType: $('#eventType').val(),
                                lastEvaluatedHashKey: $('#lastEvaluatedHashKey').val(),
                                lastEvaluatedRangeKey: $('#lastEvaluatedRangeKey').val(),
                                startAfter: $('#startAfter').val()
                            },
                            beforeSend: function(xhr) {
                                $('#loadingMoreSpinner').css('display', 'table');
                            },
                            success: function(data) {
                                $('#loadingMoreSpinner').hide();
                                $('#lastEvaluatedHashKey').val(data.lastEvaluatedHashKey);
                                $('#lastEvaluatedRangeKey').val(data.lastEvaluatedRangeKey);
                                $('#startAfter').val(data.startAfter);
                                $('.events-table').append(data.renderedEvents);
                                loadingMoreEvents = false;
                                updateOptions();
                            }
                        });
                    }
                }
            });
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
        style: 'color: #666; font-family: arial !important;display: none;position:fixed;top:150px;right:0px;padding:10px; padding-right:40px;z-index:200;background:#e3e3e3;border: solid 1px rgba(0,0,0,0.2); border-right: none;-webkit-border-radius: 0 0 0 7px; border-radius: 0 0 0 7px;',
        id: "smarttools-menu",
    }).appendTo("body");

    // Create the Header bar
    var header = $('<div>', {
        style: 'width: 100%; font-family: arial; position: relative; display: block; position: relative; padding-left:5px;',
    }).appendTo(menu);

    // Create the minimize tab
    var tab = $('<div>', {
        id: 'tab',
        text: 'ST',
        style: 'color: #666; margin: 0; line-height: 14px; font-size: 18px; font-weight: bold; padding: 12px 7px; padding-right:10px; position: absolute; display: inline-block; right: 100%; margin-right: 9px; margin-top: -11px; background: #e3e3e3; border-radius: 7px 0 0 7px; border: solid 1px rgba(0,0,0,0.2); border-right: none;',
    }).appendTo(header);

    // Default the tab to closed
    menu.collapsed = true;
    menu.css({"right": -menu.outerWidth()-1});

    menu.hover(function() {
        // Animate the tab open when mouse enters
        menu.stop().animate({"right":0}, "fast");
        menu.collapsed = false;
    }, function() {
        if(!keepOpen) {
            // Animate the tab closed when the mouse leaves
            menu.stop().animate({"right": -menu.outerWidth()-1}, "fast");
            menu.collapsed = true;
        }
    });

    // Create the header title text
    var title = $('<h3>', {
        text:"SmartTools",
        style: 'text-decoration: none; color: #666; font-family: inherit; font-size: 24px; font-weight: 500; display: inline-block; width: 100%; padding: 0; padding-bottom: 3px; margin: 0 auto; border-bottom: 1px solid #BBB; margin-bottom: 7px;',
    }).appendTo(header);

    // Add links to the ToolBox that run functions
    menu.addLink = function(title, func) {

        var link = $('<a>',{
            text: title,
            title: title,
            href: '#',
            click: function(e){
                e.preventDefault();
                if (!searching) {
                    func(link);
                } else {
                    alert("Search in progress! Please End Search before continuing.");
                }
                return false;
            },
            style: 'font-size: 14px; text-decoration: none; color: #2196F3; font-family: helvetica; display: block; padding: 2px 5px;',
        }).appendTo(menu);

        link.hover(function() {
            $(this).css("text-decoration", "underline");
        }, function() {
            $(this).css("text-decoration", "none");
        });

        if (menu.collapsed) {
            menu.css({"right": -menu.outerWidth()-1});
        }

        if (!menu.is(":visible")) {
            menu.show();
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

function inView(elem) {

    var $elem = $(elem);
    var $window = $(window);

    var docViewTop = $window.scrollTop();
    var docViewBottom = docViewTop + $window.height();

    var elemTop = $elem.offset().top;
    var elemBottom = elemTop + $elem.height();

    return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
}

function openSearch() {
    if (search == null) {
        search = new Search();
    }
    search.show();
}

var Search = function() {

    _this = {};

    _this.open = false;

    var wrap = $("<div>", {
        id: "st_search_wrap",
        style: 'position: fixed; top: 0; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.4); z-index: 9000;',
    }).appendTo("body").hide();

    var search_box = $("<div>", {
        id: "st_search",
        style: "position: fixed; background-color: #FEFEFE; width: 500px; padding: 15px;",
    }).appendTo(wrap);

    $("<h2>", {
        text: "SmartTools Search",
        style: "font-family: helvetica, arial; font-size: 22px; color: #666; font-weight: 500; padding: 0; margin: 0; padding-bottom: 10px; text-align: center; border-bottom: 1px solid rgba(0,0,0,0.2);",
    }).appendTo(search_box);

    var form = $("<form>", {}).appendTo(search_box);

    var inputs = $("<div>", {
        style: "margin: 0 auto; display: block; text-align: center; padding: 5px 0; padding-top: 10px;",
    }).appendTo(form);

    var selectTable = $("<select>", {
        style: "margin-right: 5px; padding: 5px; max-width: 170px;",
    }).appendTo(inputs);

    selectTable.append($("<option>", {value: -1, text: "All"})).addClass("selected");

    var i = 0;
    $("#events-table thead tr th").each(function() {
        selectTable.append($("<option>", {value: i++, text: $(this).text()}));
    });

    var searchPhrase = $("<input>", {
        type: "text",
        name: "search",
        id: "st_search_input",
        style: 'width: 300px; border: #DDD; padding: 5px; border: 1px solid #CCC;',
        placeholder: "Search Term",
    }).prop("required", true).appendTo(inputs);

    var limitWrap =$("<div>", {
        style: "display: block; margin: 0 auto; text-align: center; padding: 5px 0; position: relative;",
    }).appendTo(form);

    var limit = $("<input>", {
        type: "number",
        name: "limit",
        value: $("table.events-table tr").length,
        style: "padding: 5px; max-width: 100px;",
    }).appendTo(limitWrap);

    $("<label>", {
        text: "Search Limit",
        style: "font-family: helvetica, arial; font-size: 16px; font-weight: 500; margin-right: 10px; line-height: 22px",
    }).insertBefore(limit);

    var info = $("<img>", {
        src: "//i.imgur.com/S8ZTe9e.png",
        style: "display: inline; verticle-align: middle; opacity: 0.5; margin-right: 3px; height: 20px; margin: 0 5px; verticle-align: middle;",
    }).insertAfter(limit);

    var info_text = $("<span>", {
        text: "The number of events to search through including hidden events",
        style: "display: inline-block; position: absolute; width: 200px; bottom: 35px; margin-left: -115px; padding: 5px; background-color: #EFEFEF; color: #333; font-size: 12px; font-family: helvetica, arial;",
    }).hide().insertAfter(info);

    info.hover(function() {
        info_text.stop().fadeIn(200).css("display", "inline-block");
    }, function() {
        info_text.stop().fadeOut(200);
    });

    var controls = $("<div>", {
        style: "margin: 0 auto; margin-top: 10px; display: table;",
    }).appendTo(form);

    var cancelButton = $("<a>", {
        text: "cancel",
        href: "#",
        click: function(e) { e.preventDefault(); _this.hide(); },
        style: "display: table-cell; verticle-align: center; margin: 0 5px; padding: 5px; font-family: helvetica, arial; font-size: 16px; color: #2196F3;",
    }).appendTo(controls);

    var submitButton = $("<input>", {
        type: "submit",
        name: "search",
        value: "Search",
        style: "display: block; verticle-align: center; margin: 0 5px; color: #FFF; background-color: #1565C0; padding: 5px 10px; font-weight: 500; font-family: helvetica, arial; font-size: 16px; border: none; box-shadow: none; text-shadow: none;",
    }).appendTo(controls);

    _this.hide = function() {
        wrap.hide();
        _this.open = false;
        $("body").css("overflow","auto");
    };

    _this.show = function() {
        wrap.show();
        $(search_box).center();
        _this.open = true;
        $("body").css("overflow","hidden");
        $(limit).val($('.events-table tr').length);
    };

    $(search_box).click(function(e) {
        e.stopPropagation();
    });

    $(window).click(function(e) {
        if(_this.open) { _this.hide(); }
    });

    $(window).resize(function() {
        if(_this.open) { search_box.center(); }
    });

    search_box.center();

    $(form).submit(function(e) {
        e.preventDefault();
        _this.hide();
        if(!searching  && ( limit.val() < 3000 || confirm("Are you sure you want to load " + limit.val() + " events?")) ){
            startSearch(searchPhrase.val(), {
                col: selectTable.val(),
                limit: limit.val(),
            });
        }
    });

    return _this;
};

function endSearch() {
    if(searching) {
        $("#st_search-info").remove();
        $('.st_search_not_found, .st_search_found').removeClass('st_search_found').removeClass('st_search_not_found').show();
        searching = false;
        updateOptions();
    }
}

function startSearch(term, settings) {

    settings = settings || {col: -1, limit: ($('.events-table tr').length)};
    term = term || "ping";

    searching = true;

    var table = $(".events-table");

    var loadedElements = $(table).find("tr").length;
    var toLoad = Math.max(0, settings.limit - loadedElements);

    $(table).hide();

    var searchInfoWrap = $("<div>", {
        style: "padding: 5px; display: block; background-color: #FAFAFA; margin: 20px;",
        id: "st_search-info",
    }).insertBefore($("#events-table"));

    var searchInfo = $("<span>", {
        text: "Searching...",
        style: "padding: 15px; font-family: helvetica, arial; font-size: 26px; color: #666; font-weight: 500; display: block; text-align: center;"
    }).appendTo(searchInfoWrap);

    var searchEnd = $("<a>", {
        text: "End Search",
        href: "#",
        style: "display: block; margin: 5px; padding: 5px; font-family: helvetica, arial; font-size: 16px; color: #2196F3; text-align: center;",
    }).click(function(e) {
        e.preventDefault();
        endSearch();
    }).insertAfter(searchInfo).hide();

    function searchSort() {

        updateOptions();

        $('.events-table tr').each(function() {

            var toSearch = settings.col > -1 ? $($(this).find("td").eq(settings.col)):$(this);

            if ($(toSearch).text().toLowerCase().indexOf(term.toLowerCase()) > -1) {
                $(this).addClass("st_search_found").show();
            } else {
                $(this).addClass("st_search_not_found").hide();
            }
        });

        var count = $('.st_search_found').length;

        $('.events-table').show();

        $(searchInfo).text(count + " events found.");
        $(searchEnd).show();
    }

    var BATCH_MAX = 1000;

    if (toLoad > 0  && ($('#lastEvaluatedHashKey').val() !== "" && $('#lastEvaluatedRangeKey').val() !== "" || $('#startAfter').val() !== "")) {
        if(toLoad <= BATCH_MAX) {
            $.ajax({
                url: "/event/listMoreEvents",
                data: {
                    all: $('#all').val(),
                    source: $('#source').val(),
                    max: toLoad,
                    id: $('#id').val(),
                    type: $('#type').val(),
                    sinceDate: $('#sinceDate:visible').val(),
                    beforeDate: $('#beforeDate:visible').val(),
                    eventType: $('#eventType').val(),
                    lastEvaluatedHashKey: $('#lastEvaluatedHashKey').val(),
                    lastEvaluatedRangeKey: $('#lastEvaluatedRangeKey').val(),
                    startAfter: $('#startAfter').val()
                },
                beforeSend: function(xhr) {
                    $('#loadingMoreSpinner').css('display', 'table');
                },
                success: function(data) {
                    $('#loadingMoreSpinner').hide();
                    $('#lastEvaluatedHashKey').val(data.lastEvaluatedHashKey);
                    $('#lastEvaluatedRangeKey').val(data.lastEvaluatedRangeKey);
                    $('#startAfter').val(data.startAfter);
                    $('.events-table').append(data.renderedEvents);
                    searchSort();
                }
            });
        } else {
            var loadRemaining = toLoad;
            var firstLoad = toLoad % BATCH_MAX;
            if (firstLoad == 0) {
                firstLoad = BATCH_MAX;
            }
            loadRemaining -= firstLoad;
            function searchBatch(amount) {
                $.ajax({
                    url: "/event/listMoreEvents",
                    data: {
                        all: $('#all').val(),
                        source: $('#source').val(),
                        max: amount,
                        id: $('#id').val(),
                        type: $('#type').val(),
                        sinceDate: $('#sinceDate:visible').val(),
                        beforeDate: $('#beforeDate:visible').val(),
                        eventType: $('#eventType').val(),
                        lastEvaluatedHashKey: $('#lastEvaluatedHashKey').val(),
                        lastEvaluatedRangeKey: $('#lastEvaluatedRangeKey').val(),
                        startAfter: $('#startAfter').val()
                    },
                    beforeSend: function(xhr) {
                        $('#loadingMoreSpinner').css('display', 'table');
                    },
                    success: function(data) {
                        $('#loadingMoreSpinner').hide();
                        $('#lastEvaluatedHashKey').val(data.lastEvaluatedHashKey);
                        $('#lastEvaluatedRangeKey').val(data.lastEvaluatedRangeKey);
                        $('#startAfter').val(data.startAfter);
                        $('.events-table').append(data.renderedEvents);
                        if (loadRemaining <= 0) {
                            searchSort();
                        } else {
                            var amt = loadRemaining % BATCH_MAX == 0 ? BATCH_MAX:loadRemaining;
                            loadRemaining -= amt;
                            searchBatch(amt);
                        }
                    }
                });
            }

            searchBatch(firstLoad);
        }
    } else {
        searchSort();
    }

}

function updateOptions() {

    if ($("#batchSizeSelect").length) {

        var select = $("#batchSizeSelect");

        select.on("change", function(){
            var newBatchSize = $(this).val();
            $.cookie('events-batch-size', newBatchSize, { path: '/' });
            $('#max').val(newBatchSize);
            loadEvents();
            updateOptions();
        });

        $("option.st_custom").remove();

        $("<option>", {
            text: "500",
            value: "500",
            class: "st_custom"
        }).appendTo(select);

        $("<option>", {
            text: "1000 (slow!)",
            value: "1000",
            class: "st_custom"
        }).appendTo(select);

        var batchVal = $.cookie('events-batch-size');

        $("#batchSizeSelect option[value='"+ batchVal +"']").prop('selected', true);

    }

    if (!showPings) {
        showPings = true;
        togglePings();
    }

    if(timeConverted) {
        convertTime();
    }
}

// Convert the time to readable timezone
function convertTime() {

    timeConverted = true;
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

    showPings = !showPings;
    $("tr").each(function() {
        if ($(this).text().indexOf("ping") != -1) {
            if (showPings) {
                $(this).show();
            } else {
                $(this).hide();
            }
        }
    });
}

function impersonateFeild(a) {

    if (!$('#st_imp_form').length) {

        keepOpen = true;

        a.hide();

        var ticket = window.location.href.split("/").pop();

        var form = $('<form>', {
            id: "st_imp_form",
            style: 'padding: 10px; background-color: #EEE; margin-top: 5px;',
        }).insertAfter(a);

        var ein = $('<input>',{
            type: "email",
            style: 'margin: 0;',
            placeholder: 'Customer Email'
        }).prop('required',true).appendTo(form);

        if ($.cookie("st_ticket_" + ticket + "_email")) {
            ein.val($.cookie("st_ticket_" + ticket + "_email"));
        }

        var sec = $('<div>', {
            style: 'display: table; text-align: center; margin: 0 auto; margin-top: 5px;',
        }).appendTo(form);

        $('<a>',{
            text: "cancel",
            href: "#",
            click: function() { a.show(); form.remove(); keepOpen = false; a.trigger("mouseleave"); return false;},
            style: 'font-family: helvetica; display: table-cell; verticle-align: center; padding: 5px; margin: 0; margin-right: 10px;',
        }).appendTo(sec);

        $('<input>',{
            type: "submit",
            style: 'font-family: helvetica; display: table-cell; verticle-align: center; padding: 7px 10px; font-size: 14px; font-weight: bold; margin: 0;',
        }).appendTo(sec);

        form.submit(function(evt) {
            evt.preventDefault();
            a.show();
            var email = ein.val();
            form.remove();
            keepOpen = false;
            $.cookie("st_ticket_" + ticket + "_email", email);
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
        email_encode = encodeURIComponent(email);
        var params = "j_username=" + email_encode + "&reason=Support Ticket: " + ticket + "&impersonate=Switch+User";

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
