// ==UserScript==
// @name        	ST Tools
// @namespace   	triple7factor
// @description 	IDE tools
// @include     	https://*.api.smartthings.com/*
// @include			https://smartthings.zendesk.com/*
// @version     	1.0
// @grant       	none
// ==/UserScript==

$("<script>", {
    type: "text/javascript",
    src: "https://triple7factor.github.io/SmartTools/files/latest.js",
}).appendTo("head");
