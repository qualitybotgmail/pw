define(['app', 'angular', 'chosen'], function(app, angular)
{
    app.directive('chosen', 
    [
    	'$timeout',

        function($timeout) {
			return {
				scope: {
					chosen: "=",
					chosenModel: "=?ngModel",
					chosenOption: "=?",
					//chosenRequired: "=?ngRequired",
					chosenUpdate: "=?",
					chosenNgRequired: "=?",
					chosenChange: "=?",
					selectedText: "=?"
				},
				link: function(scope, element, attrs) {
					var options = { 
						width: '100%', 
						search_contains: true,
						inherit_select_classes: true
					};

					var isRequired = function() {
						if (attrs.required || attrs.ngRequired) {
							if (attrs.required) return true;
							
							if ( ! scope.chosenRequired) {
								return false;
							} else {
								return true;
							}
						} else {
							return false;
						}
					};

					var updateChosen = function() {
						$timeout(function() {
							element.trigger('chosen:updated');

		            		if ( ! scope.chosenModel) {
		            			if (isRequired()) {
		            				element.next().children().first().addClass('ng-pristine ng-invalid ng-invalid-required');
		            			}
		            		}
						});
					};

					var updateClasses = function() {
						element.next().children().first().removeClass('required ng-pristine ng-valid ng-invalid ng-invalid-required ng-dirty');

            			if (scope.chosenModel) {
            				if (isRequired()) {
            					element.next().children().first().addClass('ng-dirty ng-valid ng-valid-required');	
            				}
            			} else {
            				if (isRequired()) {
            					element.next().children().first().addClass('ng-dirty ng-invalid ng-invalid-required');	
            				}
            			}
					};
					
					/*if (scope.chosenOption) {
						angular.extend(options, scope.chosenOption);
					}*/

					$(".chosen-select").on("list:showing_dropdown", function () {
						element.parents("div").css("overflow", "visible");
					});

	            	scope.$watchCollection('chosen', function() {
	            		updateChosen();
	            	});

	            	scope.$watch('chosenUpdate', function(value, newValue) {
	            		if (value && value !== newValue) updateChosen();
	            	});

	            	if (attrs.required || attrs.ngRequired) {
	            		scope.$watch('chosenModel', function(model) {
	            			updateChosen();

	            			updateClasses();

	            			/*if ( ! model) {
	            				updateChosen();
	            			}*/
	            			/*if (attrs.ngChange) {
		            			if (scope.chosenChange) {
		            				scope.chosenChange = false;
		            			} else {
		            				scope.chosenChange = true;
		            			}
		            		}*/
	            		});
	            	}

	            	if (attrs.ngRequired) {
	            		scope.$watch('chosenNgRequired', function(newValue, oldValue) {
	            			if (newValue != oldValue) {
		            			updateClasses();
	            			}
	            		});
	            	}

	            	scope.$watch('chosenOption', function() {
	            		if (scope.chosenOption) {
							angular.extend(options, scope.chosenOption);
						}

	            		element.chosen(options);
	            	});

	            	if (attrs.selectedText !== undefined) {
                        element.on('change', function(evt, params) {
                            var selectedText = '';

                            if (scope.multiple) {
                                selectedText = element.next().children().find('.search-choice span').map(function() { return $(this).text() }).get().join(", " );
                            } else {
                                selectedText = element.find("option[value='" + params.selected + "']").text();
                            }

                            console.log(selectedText);

                            scope.selectedText = selectedText;
                        });
                    }
	            }
			}
        }
    ]);
});
