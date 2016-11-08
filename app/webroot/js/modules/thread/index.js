/**
 * Contains all the dependecies of this module
 */
define([
	// import models
	'../../models/threads',
	'../../models/heads',
	
	// import modals
	'./modals/addMemberModal',
	'./modals/threadHeadModal',
	
	// import filters
	'../../factories/filter',
	
	'./Thread',

	'../../services/commonService',
	'../../services/focusService',
	'../../services/modalService',
	'../../services/blockerService',
	'../../services/formService',
	'../../directives/jwertyDirective',
	'../../directives/selectTwoDirective',
	'../../directives/onKeyPressDirective',
	'../../directives/uploadDirective',
	'../../directives/fancyboxDirective',
], function () {});
