/**
 * Contains all the dependecies of this module
 */
define([
	// import models
	'../../models/threads',
	'../../models/users',
	'../../models/groupChats',
	'../../models/profiles',
	'../../models/heads',
	'../../models/comments',
	
	// import filters
	'../../factories/filter',
	
	// import modals
	'./modals/threadModal',
	'./modals/groupChatModal',
	
	// message controller
	'./search/modal/MessageInfoController',
	
	// users like the head modal
	'../modals/userLikeModal',
	
	'./MainController',
	'./loading/LoadingController',
	'./search/SearchController',

	'../../services/commonService',
	'../../services/focusService',
	'../../services/modalService',
	'../../services/blockerService',
	'../../directives/jwertyDirective',
	'../../directives/selectTwoDirective',
	'../../directives/fancyboxDirective',
	'../../directives/stringToLinkDirective',
	
], function () {});
