define([
    'app',
    'angular',
    'jquery',
    'fancybox',
], function (app, angular, $) {
   
    // app.directive('fancybox', function($compile, $parse) 
    // {
    // 	return {
    // 		restrict: 'C',
    // 		replace: false,
    // 		link: function($scope, element, attrs) {
    
    // 			$scope.$watch(function() { return element.attr('openbox') }, function(openbox) 
    // 			{
    // 				if (openbox == 'show') {
    
    // 					var options = $parse(attrs.options)($scope) || {};
    
    // 					if (!options.href && !options.content) {
    
    // 						options.content = angular.element(element.html()); 
    
    // 						$compile(options.content)($scope);
    
    // 					}
    					
    // 					var onClosed = options.onClosed || function() {};
    
    // 					options.onClosed = function() {
    // 						$scope.$apply(function() {
    // 							onClosed();
    // 							element.attr('openbox', 'hide');
    // 						});
    // 					};
    
    // 					$.fancybox(options);
    // 				}
    // 			});		 
    // 		}
    // 	};
    // });
    
    app.directive('fancybox', function(){
      return {
        restrict: 'A',
    
        link: function(scope, element, attrs) {
          $(element).fancybox({  
            fitToView: false,
            autoSize    : false,
            closeClick  : true,
            openEffect  : 'none',
            closeEffect : 'none',
          });
        }
      }
    });
});