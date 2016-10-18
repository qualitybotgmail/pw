define(['app', 'jquery'], function(app, $)
{
	app.service('focusService',
    [
        '$timeout',

        function($timeout) {
        	return {
        		vars: {
	        		element: null,
	        		active: null,
	        		last: null,
	        		lastActiveList: []	,
	        	},

	        	init: function() {
	        		return this.vars;
	        	},

	        	on: function(elem) {
	        		var _this = this;
	        		var t = $timeout(function(){
	        			_this.vars.element = elem;
	        			$timeout.cancel(t);
	        		});
	        	},

	        	active: function() {
	        		var _this = this;
	        		var t = $timeout(function(){
	        			_this.vars.active = true;
	        			$timeout.cancel(t);
	        		});	
	        	},

	        	chosen: function(elem, timeout) {
	        		var _this = this;

	        		timeout = timeout || 500;

	        		var t = $timeout(function(){
	        			$(elem).trigger('chosen:activate');
	        			$timeout.cancel(t);
	        		}, timeout);
	        	},

	        	last: function() {
	        		var _this = this;
	        		var t = $timeout(function(){
	        			_this.vars.last = true;
	        			$timeout.cancel(t);
	        		});		
	        	}
        	}
        }
    ]);


    app.directive('focus', 
    [
    	'$timeout',

        function($timeout) {
			return {
				scope: {
					focus: '=?',
					focusCallback: '&'
				},

				link: function(scope, element, attrs) {

					// Focus on the element if focus-callback attribute is present
					$(element).focusin(function(){
						if (scope.focusCallback) {
							if (scope.focus) {
								scope.$apply(function(){
									scope.focus = false;	
								});
								
								scope.focusCallback();
							}	
						}
            		});

					scope.$watch('focus.element', function(value){
						if(value) {
							var t = $timeout(function() {
            					$(value).focus();
            					$(value).select();

            					scope.focus.element = null;

            					$timeout.cancel(t);
          					});
						}
					});

					scope.$watch('focus.active', function(value){
						var active = document.activeElement;
						if(value) {
							var t = $timeout(function() {
								scope.focus.lastActiveList.push(active);

            					scope.focus.active = null;

            					$timeout.cancel(t);
          					});
						}
					});

					scope.$watch('focus.last', function(value){
						if(value) {
							var t = $timeout(function() {
								var lastElement = scope.focus.lastActiveList.pop();

								lastElement.focus();
								
								try {
									lastElement.select();	
								} catch(x) {}
								

            					scope.focus.last = null;

            					$timeout.cancel(t);
          					});
						}
					});


				}
			}
        }
    ]);
});