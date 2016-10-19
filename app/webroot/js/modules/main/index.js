/**
 * Contains all the dependecies of this module
 */
define([
	// import models
	'../../models/threads',
	
	// import modals
	'./modals/threadModal',
	
	'./MainController',
	'./loading/LoadingController',
	'./notify/NotifyController',

	'../../services/previewService',
	'../../services/commonService',
	'../../services/focusService',
	'../../services/modalService',
	'../../services/gritterService',
	'../../services/blockerService',
	'../../services/gridService',
	'../../services/formService',
	'../../directives/jwertyDirective',
	'../../directives/jqGridDirective'
	
], function () {});
