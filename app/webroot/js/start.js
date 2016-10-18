/**
 * bootstraps angular onto the window.document node
 */
define([
	'require',
	'angular',
	'app', 
	'lteApp'
	], function (require, ng) {
	'use strict';

	require(['domReady!'], function (document) {
		ng.bootstrap(document, ['talknoteApp']);
	});
});