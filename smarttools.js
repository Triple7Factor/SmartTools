// ==UserScript==
// @name        		ST Tools
// @namespace   	triple7factor
// @description 	IDE tools
// @include     		https://graph.api.smartthings.com/*
// @include			https://smartthings.zendesk.com/*
// @version     		0.1
// @grant       		none
// ==/UserScript==


// Determine what page is being viewed and display appropriate options
var currentUrl = window.location.href;

if (currentUrl.search("agent/ticket") != -1)
{
	// Zendesk
	/*
	// Draw tools window
	var elemDiv = document.createElement('div');
	elemDiv.style.cssText = 'position:absolute;position:fixed;top:150px;right:0px;padding:10px;padding-right:40px;z-index:100;background:#e3e3e3;';
	document.body.appendChild(elemDiv);

	// Add title
	elemDiv.innerHTML += "<b>SmartTools</b><br>"
	
	// Create "Impersonate" link
		var a = document.createElement('a');
		var linkText = document.createTextNode("Impersonate");
		a.appendChild(linkText);
		a.title = "Impersonate";
		a.href="#";
		a.onclick = Impersonate;
		elemDiv.appendChild(a);
	*/
}
else if (currentUrl.search("graph.api.smartthings.com") != -1)
{
	// IDE
	
	
	// Show options for the specific IDE page
	if (currentUrl.search("location/installedSmartApps/") != -1)
	{
		// Installed SmartApps
		
			// Draw tools window
			var elemDiv = document.createElement('div');
			elemDiv.style.cssText = 'position:absolute;position:fixed;top:150px;right:0px;padding:10px;padding-right:40px;z-index:100;background:#e3e3e3;';
			document.body.appendChild(elemDiv);

			// Add title
			elemDiv.innerHTML += "<b>SmartTools</b><br>"
		
		// Create "Update All" link
		var a = document.createElement('a');
		var linkText = document.createTextNode("Update all SmartApps");
		a.appendChild(linkText);
		a.title = "Update all SmartApps";
		a.href="#";
		a.onclick = UpdateApps;
		elemDiv.appendChild(a);
	}
	else if (currentUrl.search("hub/") != -1)
	{
		// Hub page
		if (currentUrl.search("show/") != -1)
		{
			// Hub details page
		}
		else if (currentUrl.search("/events") != -1)
		{
			// Hub events page
			
				// Draw tools window
				var elemDiv = document.createElement('div');
				elemDiv.style.cssText = 'position:absolute;position:fixed;top:120px;right:0px;padding:10px;padding-right:40px;z-index:100;background:#e3e3e3;';
				document.body.appendChild(elemDiv);

				// Add title
				elemDiv.innerHTML += "<b>SmartTools</b><br>"
			
			// Increase number of events possible and force refresh on option change
			var select = document.getElementById('batchSizeSelect');
			select.options[select.options.length] = new Option('500', '500');
			select.options[select.options.length] = new Option('1000 (slow!)', '1000');
			select.addEventListener('change',function(){
				select.dispatchEvent(new Event('change'));
				loadEvents(action);
			});

			// Create "Remove Ping Events" link
			var a = document.createElement('a');
			var linkText = document.createTextNode("Remove Ping Events");
			a.appendChild(linkText);
			a.title = "Remove Ping Events";
			a.href="#";
			a.onclick = RemovePings;
			elemDiv.appendChild(a);
		}
	}
}
	

// Loop through all links and activate each "Update" link
function UpdateApps()
{

	// Loop through each link
	var links = document.getElementsByTagName("a");
	
	for(var i=0; i<links.length; i++)
	{
		// If link is an update link, activate it
		var thisLink = links[i];

		if(thisLink.getAttribute('class') == 'executeUpdate')
		{
			// Call Update URL and display results
			var result = GetHTTP(thisLink);
			if(result.search("OK") == -1)
			{
				// Failed
				thisLink.innerHTML += " <font color=red><b>Error</b></font>";
				console.log(result);
				flashErrorMessage("Error updating one or more SmartApps!");
			}
			else
			{
				// Succeeded
				thisLink.innerHTML += " <font color=green><b>" + result + "</b></font>";

			}
			
		}
	}
	
	// Display confirmation
	flashMessage("SmartApps updated successfully!");
}

// Loop through all event entries and remove each "Ping" entry
function RemovePings()
{
		// Loop through each row in the table
	var rows = document.getElementsByTagName("tr");
	
	for(var i=0; i<rows.length; i++)
	{
		// If link contains a ping link, hide it
		var currentRow = rows[i];

		if(currentRow.innerHTML.indexOf("ping") != -1)
		{
			// TODO: Change to toggle
			 $(currentRow).hide();
		}

	}
	
	// TODO: Remove empty rows
	
}

function Impersonate()
{
	// Grab ticket number from URL
	var ticket = window.location.href.split("/").pop();
	
	// Find all email addresses in page and return most common one
	var search_in = document.body.innerHTML;
	var string_context = search_in.toString();

	var array_mails = string_context.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);
	
	// Find and remove "support@smartthings.com" from list of email addresses found
	for(var p = array_mails.length-1; p--;){
	if (array_mails[p] == "support@smartthings.com") array_mails.splice(p, 1);
	}
	
	var o = _(array_mails).reduce(function(o, s) {
    o.freq[s] = (o.freq[s] || 0) + 1;
    if(!o.freq[o.most] || o.freq[s] > o.freq[o.most])
        o.most = s;
    return o;
	}, { freq: { }, most: '' });

	// Set parameters for impersonation request and call impersonation URL
	var email = _.chain(array_mails).countBy().pairs().max(_.last).head().value();
    var params = "j_username=" + email + "&reason=Support Ticket: " + ticket + "&impersonate=Switch+User";
	
	var win = window.open("https://graph.api.smartthings.com/login/switchUser?" + params, '_blank');
	win.focus();

}
	
	

// Display message at top of page (borrowed from existing page source)
function flashMessage(messageText)
{
	var tempSource = $("#message-template").html();
	var template = Handlebars.compile(tempSource);
	$("#flash-message-container").html(
		template(
			{
				message:messageText
			}));
}

// Display error message at top of page (borrowed from existing page source)
function flashErrorMessage(messageText)
{
	var tempSource = $("#error-template").html();
	var template = Handlebars.compile(tempSource);
	$("#flash-message-container").html(
		template(
			{
				error:messageText
			}));
}

// Request HTTP and return results
function GetHTTP(url)
{	
	// Initialize results container
	var xmlHttp = null;

	// Call URL and get results
	xmlHttp = new XMLHttpRequest();
	xmlHttp.open( "GET", url, false );
	xmlHttp.send(null);
	
	// Return results
	return xmlHttp.responseText;
}
