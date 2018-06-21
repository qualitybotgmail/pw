/**
 * Contains all the dependecies of this module
 */
define([
	// import models
	'../../models/heads',
	'../../models/comments',
	'../../models/uploads',
	
	// import filters
	'../../factories/filter',
	
	// import modals
	'../thread/modals/threadHeadModal',
	
	// users like the head modal
	'../modals/userLikeModal',
	
	'./Head',

	'../../services/modalService',
	'../../directives/fancyboxDirective',
	'../../directives/stringToLinkDirective',
], function () {});
