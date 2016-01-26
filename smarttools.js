// ==UserScript==
// @name        	ST Tools
// @namespace   	triple7factor
// @description 	IDE tools
// @include     	https://graph.api.smartthings.com/*
// @include			https://smartthings.zendesk.com/*
// @version     	1.0
// @grant       	none
// ==/UserScript==

$("<script>", {
    type: "text/javascript",
    src: "https://trevorrecker.github.io/SmartTools/files/latest.js",
}).appendTo("head");
