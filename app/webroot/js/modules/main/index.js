/**
 * Contains all the dependecies of this module
 */
define([
	// import models
	'../../models/threads',
	'../../models/users',
	'../../models/groupChats',
	
	// import filters
	'../../factories/filter',
	
	// import modals
	'./modals/threadModal',
	'./modals/groupChatModal',
	
	'./MainController',
	'./loading/LoadingController',
	// './notify/NotifyController',

	'../../services/commonService',
	'../../services/focusService',
	'../../services/modalService',
	'../../services/blockerService',
	'../../directives/jwertyDirective',
	'../../directives/selectTwoDirective',
	
], function () {});
