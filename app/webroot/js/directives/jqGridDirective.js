define(['app', 'angular', 'jquery', 'underscore', 'jqGrid', '../../js/services/toolbarService', '../../js/helpers/caret', 'blockUi', 'highlight', './jqGridExtend',], function(app, angular, $, _)
{
    app.directive('jqgrid', 
    [
    	'$window',
    	'$compile',
    	'$timeout',
    	'toolbarService',

        function($window, $compile, $timeout, Toolbar) {

        	var additionalHeight, lastXhr;

        	var parent_column = $('#gbox_correct').closest('[class*="col-"]');

        	var highlightFilteredData = function () {
	            var $self = $(this), filters, i, l, rules, rule, iCol,
	                isFiltered = $self.jqGrid("getGridParam", "search"),
	                postData = $self.jqGrid("getGridParam", "postData"),
	                colModel = $self.jqGrid("getGridParam", "colModel"),
	                colIndexByName = {};

	            // validate whether we have input for highlighting
	            if (!isFiltered || typeof postData !== "object") {
	                return;
	            }
	            filters = postData.filters;
	            if (filters == null || filters.rules == null && filters.rules.length <= 0) {
	                return;
	            }

	            // fill colIndexByName which get easy column index by the column name
	            for (i = 0, l = colModel.length; i < l; i++) {
	                colIndexByName[colModel[i].name] = i;
	            }

	            rules = filters.rules;
	            for (i = 0, l = rules.length; i < l; i++) {
	                rule = rules[i];
	                iCol = colIndexByName[rule.field];
	                if (iCol !== undefined) {
	                	var searchData = (rule.data);
	                	searchData = searchData.replace(/  /g, ' ');

	                	searchData = searchData.split(' ');

	                	for (var j = searchData.length - 1; j >= 0; j--) {
	                		$self.find(">tbody>tr.jqgrow>td:nth-child(" + (iCol + 1) + ")").highlight(searchData[j]);
	                    	$('span.ui-state-highlight').css({'border':'solid 1px #fad42e', 'background-color':'#fbec88'});
	                	}
	                }
	            }
	        };

	        /** Loading Text template */
            var getLoadingText = function(message, iconClass) {
                message = message || 'LOADING';

                iconClass = iconClass || 'blue fa fa-spinner fa-spin fa-4x';
                return '<div class="locker"><div class="lock"><i class="' + iconClass + '"></i><p class="text-yellow"><strong>' + message + '</strong></p></div></div>';
            };

        	/* Lock the Grid */
            var lockGrid = function(elem, message, iconClass) {
        
                message = message || 'LOADING';
                iconClass = iconClass || 'blue fa fa-spinner fa-spin fa-4x';

                var strMessage = getLoadingText(message, iconClass);

                elem.block({
                    message: strMessage,
                    fadeIn: 700, 
                    fadeOut: 700, 
                    css: { border: 'none', backgroundColor: 'transparent', width: '95%' },
                    overlayCSS: { opacity: .1 },
                    baseZ: 999
                });
            };

        	/* Make the jqGrid responsive by replacing its fixed width with percentage (%) */
            var makeResponsive = function(elementId, colModels, rowNumber, multiSelect) {
                var counter = 1;

                if (rowNumber) counter++;
                if (multiSelect) counter++;

                // Change fixed width to percentage

                $('#gbox_' + elementId).css('width', '100%');
                $('#' + elementId).css('width', '100%');

                $('#gbox_' + elementId + ' .ui-jqgrid-view').css('width', '100%');
                $('#gbox_' + elementId + ' .ui-jqgrid-hdiv').css('width', '100%');
                $('#gbox_' + elementId + ' .ui-jqgrid-bdiv').css('width', '100%');
                $('#gbox_' + elementId + ' .ui-jqgrid-htable').css('width', '100%');
                $('#gbox_' + elementId + ' .ui-jqgrid-pager').css('width', '100%');

                $('#gbox_' + elementId + ' .ui-jqgrid-ftable').css('width', '100%');
                

                $('#gbox_' + elementId + ' .ui-userdata').css('width', '100%');
                $('#gbox_' + elementId + ' .ui-jqgrid-sdiv').css('width', '100%');

                // Set Row Header width to percentage type

                _.each(colModels, function(col) {
                    if ( ! col.hidden) $('#' + elementId + '_' + col.name).css('width', col.width);

                    $('#' + elementId +  ' tr:first td:nth-child(' + counter + ')').css('width', col.width);

                    $('.ui-jqgrid-ftable tr:first td:nth-child(' + counter + ')').css('width', col.width);

                    counter++;
                });
            };

        	var getHeight = function(offset) {
        		return $('.scroll-top-wrapper').offset().top - offset;
        	};

        	// Search
        	var startSearch = function(id, scope) {
        		var el = $('#gbox_' + id + ' input[name=grid_search]');

        		el.unbind("keydown");

				el.bind("keydown", function (e) {

					if (e.keyCode === 13) {
                        scope.$apply(function() {
                        	scope.jqSearchTrigger = true;
                        });
					}
				});
        	};

        	var navigateSearch = function(gridId, elem, key, namespace, multiselect) {
                        
                elem.unbind('keydown.' + namespace);

                elem.bind('keydown.' + namespace, jwerty.event(key, function (e) {
                    e.preventDefault();

                    var id, multiselect, current = $(gridId).jqGrid('getGridParam','selrow');
                    
                    if (key === '↑') id = getPrevious(gridId);
                    if (key === '↓') id = getNext(gridId);
                    
                    if ( ! id) return;

                    if ( ! multiselect) {
                        $(gridId).jqGrid('editCell', id, 2, true);
                    } else {
                        $(gridId).jqGrid('editCell', id, 2, false);
                    }

                    var t = $timeout(function() {
                        elem.focus();    

                        $timeout.cancel(t);
                    });
                        
                }));
            };

            /** Get the next row index, also trigger `scroll` when set to 1 or true */
            var getNext = function(gridId) {
                var next, row = $(gridId).jqGrid('getGridParam').iRow,
                    ids = $(gridId).jqGrid('getDataIDs');

                if ( ! row) {
                    next = 1;
                } else {
                    row++;

                    if (row > ids.length) {
                        var page = $(gridId).jqGrid('getGridParam').page,
                            lastpage = $(gridId).jqGrid('getGridParam').lastpage;

                        if (page !== lastpage) {
                            var gridParent = $(gridId).parent().parent(),
                                scrollTop = gridParent.scrollTop();

                            if ( ! gridIsLoading)  gridParent.animate({scrollTop: scrollTop+10});

                            gridIsLoading = true;

                            return false;
                        }
                        
                        next = 1;
                    } else {
                        next = row;
                        gridIsLoading = false;
                    }
                }

                return next;
            };

            /** Get the previous row index */
            var getPrevious = function(gridId) {
                var prev, row = $(gridId).jqGrid('getGridParam').iRow,
                    ids = $(gridId).jqGrid('getDataIDs');

                if ( ! row) {
                    prev = ids.length;
                } else {
                    row--;

                    if (row === 0) {
                        prev = ids.length;
                    } else {
                        prev = row;
                    }
                }

                return prev;
            };

			return {
				scope: {
		            config: '=',
		            data:   '=?',
		            tb:  '=?',
		            insert: '=?',
		            api:    '=?',
		            vapi:    '=?',
		            selection:'=?',

		            searchParams: '=?'
		        },
				
				link: function(scope, element, attrs) {
	            	var table, div, hasToolbar;

	            	var selRow, selCol;
	            	
	            	var configDefault = {
	            		cellEdit: true,
                        scrollrows: true,
                        scrollOffset: 35,
						loadComplete: function (data) {
                        	var searchElem = $('#gbox_' + scope.config._gridId + ' input[name=grid_search]');

                        	highlightFilteredData.call(this);

                            $(searchElem).focus();

                        }
	            	};

	            	var configEditable = {
	            		cellsubmit: 'clientArray',

						cellEdit: true,
						resizeStart: function(event, columIndex){
						    var gridLeftPos = $(this.grid.bDiv).offset().left,
						        gridId = $.jgrid.jqID(this.p.id);
						    $("#gbox_"+gridId).find("#rs_m"+gridId).css({left:event.pageX - gridLeftPos});
						},

	            		beforeEditCell : function(rowid, cellname, value, iRow, iCol)
						{
							
							$('td.ui-state-highlight').removeClass('edit-cell');

						    selCol = iCol;
						    selRow = iRow;
						}, // beforeEditCell

						afterRestoreCell : function(rowid, value, iRow, iCol){
                            var gridId = "#" + scope.config._gridId;
                            
                            var row = $(gridId).jqGrid('getRowData', rowid);

                            if ( ! row.id && row._new == -1 ) {
                            	$(gridId).jqGrid('delRowData', rowid);
                            }
                        },

						afterEditCell: function (rowid) {
							var gridId = "#" + scope.config._gridId;

							var $editControl = $("#" + rowid).find("input, select, textarea"),
								events = $._data($editControl[0], "events"),
								originalKeydown;

							// Blur
							$editControl.blur(function(e){
                                $(gridId).jqGrid('saveCell', selRow, selCol);
                            });

							if (events && events.keydown && events.keydown.length === 1) {
								originalKeydown = events.keydown[0].handler; // save old jGridHandler

								$editControl.unbind("keydown");
								$editControl.bind("keydown", function (e) {
	                               	// Left Arrow
	                                if (e.keyCode === 37) {
	                                    var caret = $editControl.getCursorPosition();
	                                    if (caret === 0) {
	                                        if ( (selCol-1) >= 0) {
	                                            $(gridId).jqGrid('editCell', selRow, selCol-1, true);  
	                                        } 
	                                    }
	                                }
		                                
	                                // Up Arrow
	                                if (e.keyCode === 38) {
	                                    if ( (selRow-1) > 0) {
	                                        $(gridId).jqGrid('editCell', selRow-1, selCol, true);  
	                                    }     
	                                }
	                                
	                                // Right Arrow
	                                if (e.keyCode === 39) {
	                                    var caret = $editControl.getCursorPosition();
	                                    
	                                    if (caret === $editControl.val().length) {
	                                        try {
	                                            $(gridId).jqGrid('editCell', selRow, selCol+1, true);
	                                        }
	                                        catch(x) {
	                                            console.log('Error' + x);   
	                                        }
	                                    }
	                                }
		                            
		                            // Enter Key and Down Arrow
									//if (e.keyCode === 13 || e.keyCode === 40) {
									if (e.keyCode === 40) {
	                                    var recLen = $(gridId).jqGrid('getGridParam', 'records');
	                                    setTimeout(function() {
	                                        if ( (selRow+1) <= recLen) {
	                                            $(gridId).jqGrid('editCell', selRow+1, selCol, true);
	                                        } 
	                                    });
									}

									originalKeydown.call(this, e);
								});
							}
						}, // end of afterEditCell

						beforeSaveCell: function(rowid) {
							var gridId = "#" + scope.config._gridId;

							var row = $(gridId).jqGrid('getRowData', rowid);

							if (row._new) {
								if ( row._new == -1 ) {
									row._new = 1;
									
									$(gridId).jqGrid('setRowData', rowid, row);

									scope.$apply(function() {
										scope.tb.save = true;	
									});
									
								}
							}
						}
	            	}; // end of configEditable

	            	var configNavigate = {
	            		_bindKeys: function(table) {
	            			return;
	            			return $(table).each(function() {
								var $t = this;
								if( !$('body').is('[role]') ){$('body').attr('role','application');}
								//$t.p.scrollrows = o.scrollingRows;
								$($t).keydown(function(event){
									//var target = $($t).find('tr[tabindex=0]')[0], id, r, mind;
									//expanded = $t.p.treeReader.expanded_field;
									
									//window.selected = table.jqGrid('getGridParam','selarrrow');

									var target = $($t).find('tr[tabindex=0]')[0], id, r, mind;

									/*// Multi Select configuration is enabled
									if ( ! target) {
										target = $($t).find('tr[aria-selected="true"]')[0];
										console.log(target);
									}*/

									//check for arrow keys
									if(target) {
										mind = $t.p._index[$.jgrid.stripPref($t.p.idPrefix, target.id)];
										if(event.keyCode === 38 || event.keyCode === 40){
											// up key
											if(event.keyCode === 38 ){
												r = target.previousSibling;
												id = "";
												if(r) {
													if($(r).is(":hidden")) {
														while(r) {
															r = r.previousSibling;
															if(!$(r).is(":hidden") && $(r).hasClass('jqgrow')) {id = r.id;break;}
														}
													} else {
														id = r.id;
													}
												}

												// Selection reach the top row
												if ( ! id ) {
													var rowLength =$(table).getDataIDs().length - 1,
														lastId = $($(table)).getDataIDs()[rowLength];

													table.jqGrid('setSelection', lastId, true, event);													
												} else {
													table.jqGrid('setSelection', id, true, event);	
												}
												
												event.preventDefault();
											}
											//if key is down arrow
											if (event.keyCode === 40){
												r = target.nextSibling;
												id ="";
												if(r) {
													if($(r).is(":hidden")) {
														while(r) {
															r = r.nextSibling;
															if(!$(r).is(":hidden") && $(r).hasClass('jqgrow') ) {id = r.id;break;}
														}
													} else {
														id = r.id;
													}
												}

												// Selection reach the last row
												if ( ! id ) {
													var _url = true;
													if (_url) {
														var fetch = table.jqGrid('getGridParam');
														console.log(fetch);
													} else
													{
														var firstId = $(table).getDataIDs()[0];

														table.jqGrid('setSelection', firstId, true, event);
													}
												}
												else {
													table.jqGrid('setSelection', id, true, event);
												}
												
												event.preventDefault();
											}
										}
									}
								});
							}); // return $(table).each(function() {
	            		} //end of _bindKeys
	            	}; // end of configNavigate

	            	var setSelected = function(rowid)
	            	{
	            		scope.selection.multiple = table.jqGrid('getGridParam', 'selarrrow');
            			scope.selection.one = table.jqGrid('getGridParam','selrow');
            			scope.selection.properties = {};

            			scope.tb.edit = true;
		            	scope.tb.delete = true;

            			if (scope.config._properties !== undefined && ! scope.config.multiselect) {
                            var properties = {}, data = table.jqGrid('getRowData', rowid);

                            angular.forEach(scope.config._properties, function(property) {
                                if (data[property] !== undefined) properties[property] = data[property];
                            });

                            console.log(properties);
                            scope.selection.properties = properties;
                        }
	            	};

	            	var configSelection = {
	            		onSelectRow: function(rowid) {
	            			if (scope.selection !== undefined) {
	            				var t = $timeout(function() {
	            					scope.$apply(function() {
	            						setSelected(rowid);

			            				/*scope.selection.multiple = table.jqGrid('getGridParam', 'selarrrow');
				            			scope.selection.one = table.jqGrid('getGridParam','selrow');
				            			scope.selection.properties = {};

				            			if (scope.config._properties !== undefined && ! scope.config.multiselect) {
				                            var properties = {}, data = table.jqGrid('getRowData', rowid);

				                            angular.forEach(scope.config._properties, function(property) {
				                                if (data[property]) properties[property] = data[property];
				                            });

				                            scope.selection.properties = properties;
				                        }


				            			scope.tb.edit = true;
				            			scope.tb.delete = true;*/
			            			});

			            			$timeout.cancel(t);
	            				});
	            			}
	            		},
	            		onSelectCell: function(rowid, celname, value, iRow, iCol) {
                            if (scope.selection !== undefined) {
                                scope.$apply(function(){
                                	setSelected(rowid);
                                	/*scope.selection.multiple = table.jqGrid('getGridParam', 'selarrrow');
		            				scope.selection.one = table.jqGrid('getGridParam','selrow');
                                    
                                    scope.tb.edit = true;
		            				scope.tb.delete = true;*/
                                });
                            }
                        }
	            	};

	            	var configUrl = {
	            		datatype: 'json',
                        jsonReader: {
                            root: 'data',
                            page: 'page',
                            total: 'total',
                            records: 'records'
                        },
                        myType: 'GET',
                        //loadui: 'disable'
                        loadtext: getLoadingText()
                        
	            	};

	            	scope.jqSearch = '';
	            	scope.jqSearchTrigger = false;

	            	scope.$watch('config', function (configValue) {
	            		
	            		var editable   		 = configValue._editable,
	            			pager 	   		 = configValue._pager,
	            			gridId       	 = configValue._gridId;

	            		additionalHeight = configValue._additionalHeight || 0;

	            		hasToolbar = configValue.toolbar;

	            		var pagerId  = gridId + '_pager';

		                if (editable) {
		                	configValue = angular.extend(configValue, configEditable);
		                }

		                configValue = angular.extend(configValue, configSelection);
		                configValue = angular.extend(configValue, configNavigate);

		                configValue = angular.extend(configValue, configDefault);

			            // Occupy the full height of the parent, applicable only with .page-header class
		                if (configValue._fullParentHeight) {
		                	configValue.height = getHeight(element.offset().top) + additionalHeight; //+ getAddHeight(pager, 'pager') + getAddHeight(hasToolbar, 'toolbar') ;
		                }

		                if (configValue._fullParentWidth) {
		                	configValue.width = getWidth();
		                }

		                // Has `url` config
		                if (configValue.url) {
							configValue = angular.extend(configValue, configUrl);
		                }

		                // Cleans the element
		                element.children().empty();

		                var tableElem;

		                if (editable) {
		                	tableElem = '<table id="' + gridId + '" class="ui-jqgrid-editable"></table>';
		                } else {
		                	tableElem = '<table id="' + gridId + '"></table>';
		                }

		                table = angular.element(tableElem);

		                element.append(table);

		                // Insert Pager or Navigation
		                if (pager) {

		                    configValue.pager = '#' + pagerId;
		                    
		                    var pager = angular.element(configValue.pager);
		                    if (pager.length == 0) {
		                        div = angular.element('<div id="' + pagerId + '"></div>');
		                        element.append(div);
		                    }
		                }
						
		                // Create the JqGrid
		                table.jqGrid(configValue);

		                // Make title changeable
		                $compile(table.parent().parent().parent().find('.ui-jqgrid-title'))(scope.$parent);


		                if (configValue.toolbar) {
		                	if (configValue._toolbar) {

		                		var elToolbar = $('#t_' + gridId), 
		                		    search = '<input type="text" name="q" class="form-control" placeholder="Search..."/>';
		                		elToolbar.append(Toolbar.make(configValue._toolbar));
		                		//elToolbar.append(search);
		                		//$compile(elToolbar)(scope.$parent);
		                		$compile(elToolbar)(scope);
		                		//$('#t_' + gridId).append(angular.element(Toolbar.make(configValue._toolbar)));	
		                		//element.find('#t_' + gridId).append(Toolbar.make(configValue._toolbar));	
		                	}
		                }

		                configNavigate._bindKeys(table);

		                // Change Navigation Icon Classes
		                if (pagerId) {
		                    $('#first_' + pagerId + ' span').removeClass('ui-icon ui-icon-seek-first').addClass('fa fa-fw fa-fast-backward bigger-140');
		                    $('#prev_' + pagerId + ' span').removeClass('ui-icon ui-icon-seek-first').addClass('fa fa-fw fa-backward bigger-140');
		                    $('#next_' + pagerId + ' span').removeClass('ui-icon ui-icon-seek-first').addClass('fa fa-fw fa-fast-forward bigger-140');
		                    $('#last_' + pagerId + ' span').removeClass('ui-icon ui-icon-seek-first').addClass('fa fa-fw fa-forward bigger-140');
		                }

		                // Variadic API – usage:
		                //   view:  <ng-jqgrid … vapi="apicall">
		                //   ctrl:  $scope.apicall('method', 'arg1', …);
		                scope.vapi = function() {
		                    var args = Array.prototype.slice.call(arguments,0);
		                    return table.jqGrid.apply(table, args);
		                };
		                // allow to insert(), clear(), refresh() the grid from 
		                // outside (e.g. from a controller). Usage:
		                //   view:  <ng-jqgrid … api="gridapi">
		                //   ctrl:  $scopeapi.clear();
		                scope.api = {
		                    insert: function(rows) {
		                        if (rows) {
		                            for (var i = 0; i < rows.length; i++) {
		                                //scope.data.push(rows[i]);
		                                table.jqGrid('addRowData', rows[i].id, rows[i], 'first');
		                            }
		                        }
		                    },
		                    clear: function() {
		                        scope.data.length = 0;
		                        table.jqGrid('clearGridData', { data: scope.data })
		                            .trigger('reloadGrid');
		                    },
		                    refresh: function() {
		                        table
		                            .jqGrid('clearGridData')
		                            .jqGrid('setGridParam', { data: scope.data })
		                            .trigger('reloadGrid');
		                    }
		                };

		                var gridId = "#" + scope.config._gridId;
		                var searchElem = $('#gbox_' + scope.config._gridId + ' input[name=grid_search]');

		                makeResponsive(scope.config._gridId, scope.config.colModel, scope.config.rownumbers, scope.config.multiselect);

		                startSearch(scope.config._gridId, scope);

		                navigateSearch(gridId, searchElem, '↑', 'grid.up', scope.config.multiselect);
		                navigateSearch(gridId, searchElem, '↓', 'grid.down', scope.config.multiselect);
		            });
					
					scope.$watch('config._lock', function(value) {
						var elem = $('#gbox_' + scope.config._gridId + ' .ui-jqgrid-bdiv');

						if (value) {
							lockGrid(elem, scope.config._lockMessage, scope.config._lockIcon);
							scope.config._lockMessage = null;
							scope.config._lockIcon = null;
						}
						else {
							elem.unblock();
						}
					});

					/** Watch for the scope jqgrid variable _lock */
                    scope.$watch('config._lockNotify', function(value) {
                    	var elem = $('#gbox_' + scope.config._gridId + ' .ui-jqgrid-bdiv');

                        if (value) {
                            if (scope.config._lock === true) scope.config._lock = false;

                            var message, icon;

                            switch (value) {
                                case 1: // error
                                    message = scope.config._lockMessage || "SOMETHING WENT WRONG!";
                                    icon = scope.config._lockIcon || 'blue fa fa-frown-o fa-4x';
                                    break;
                                case 2: // no records
                                    message = scope.config._lockMessage || "NO RECORDS FOUND!";
                                    icon = scope.config._lockIcon || 'blue fa fa-file-o fa-4x';
                                    break;
                                default:
                                    message = scope.config._lockMessage || "SOMETHING WENT WRONG!";
                                    icon = scope.config._lockIcon || 'blue fa fa-frown-o fa-4x';
                            }

                            var t = $timeout(function() {
                                lockGrid(elem, message, icon);

                                scope.config._lockNotify = null;
                                scope.config._lockMessage = null;
                                scope.config._lockIcon = null;

                                $timeout.cancel(t);
                            });
                        } else {
                            if (value === false) elem.unblock();
                        }
                    });

					scope.$watch('config._reload', function(value) {
						if (value) {
							makeResponsive(scope.config._gridId, scope.config.colModel, scope.config.rownumbers, scope.config.multiselect);
							scope.config._reload = false;
						}
					});

					scope.$watchCollection('data', function (dataValue) {
		               	table.jqGrid('clearGridData');
		               	table.jqGrid('setGridParam', { data: dataValue })
		                     .trigger('reloadGrid');

		                var t = $timeout(function() {
		                	var id = table.find('tbody:first-child tr:nth(1)').attr('id');
			                table.setSelection(id).focus();

			                $timeout.cancel(t);
		                });
		            });

		            scope.$watch('jqSearchTrigger', function(newValue, oldValue) {
		            	if (newValue) {
		            		var postData  = table.jqGrid("getGridParam", "postData"),
		            			//colModels = scope.config.colModel,
		            			colModels = table.jqGrid("getGridParam", "colModel")
		            			rules     = [];

		            		_.each(colModels, function(col) {
		            			console.log(col);
		            			if ( col.search && (col.stype === undefined || cm.stype === "text") ) {
		            				rules.push({
		            					field : col.name, // column name
		            					op    : 'cn',     // option 'cn' means contains
		            					data  : scope.jqSearch  // data to search
		            				});
		            			}
		            		});

		            		postData.filters = {
                                groupOp: "OR",
                                rules: rules
                            };

                            table.jqGrid('getGridParam').iRow = null;
                            table.jqGrid("setGridParam", { search: true });
                            table.trigger("reloadGrid", [{page: 1, current: true}]);

                            scope.jqSearchTrigger = false;
                            
                            return false;
		            	}
		            });

	            }
			}
        }
    ]);
});