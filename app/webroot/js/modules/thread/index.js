/**
 * Contains all the dependecies of this module
 */
define([
	// import models
	'../../models/heads',
	'../../models/threads',
	'../../models/uploads',
	'../../models/ignoredThreads',
	
	// import modals
	'./modals/addMemberModal',
	'./modals/threadHeadModal',
	'../main/modals/threadModal',
	
	
	// users like the head modal
	'../modals/userLikeModal',
	
	
	// import filters
	'../../factories/filter',
	
	'./Thread',

	'../../services/modalService',
	'../../directives/selectTwoDirective',
	'../../directives/fancyboxDirective',
	'../../directives/bootstrapSwitchDirective',
], function () {});
