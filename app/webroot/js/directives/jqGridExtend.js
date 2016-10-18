define(
    [
        'jquery',
        'angular',

        'jqGrid',
        'jqGridLocaleEn',
    ],
    function($, angular) {
        
        $.jgrid.extend({
            editCell : function (iRow,iCol, ed){
                return this.each(function (){
                    var $t = this, nm, tmp,cc, cm;
                    if (!$t.grid || $t.p.cellEdit !== true) {return;}
                    iCol = parseInt(iCol,10);
                    // select the row that can be used for other methods

                    // fix error on arrow down to empty data
                    if( !$t.rows[iRow])
                        return;

                    $t.p.selrow = $t.rows[iRow].id;
                    if (!$t.p.knv) {$($t).jqGrid("GridNav");}
                    // check to see if we have already edited cell
                    if ($t.p.savedRow.length>0) {
                        // prevent second click on that field and enable selects
                        if (ed===true ) {
                            if(iRow == $t.p.iRow && iCol == $t.p.iCol){
                                return;
                            }
                        }
                        // save the cell
                        $($t).jqGrid("saveCell",$t.p.savedRow[0].id,$t.p.savedRow[0].ic);
                    } else {
                        window.setTimeout(function () { $("#"+$.jgrid.jqID($t.p.knv)).attr("tabindex","-1").focus();},0);
                    }
                    cm = $t.p.colModel[iCol];
                    nm = cm.name;
                    if (nm==='subgrid' || nm==='cb' || nm==='rn') {return;}
                    cc = $("td:eq("+iCol+")",$t.rows[iRow]);
                    if (cm.editable===true && ed===true && !cc.hasClass("not-editable-cell")) {
                        if(parseInt($t.p.iCol,10)>=0  && parseInt($t.p.iRow,10)>=0) {
                            $("td:eq("+$t.p.iCol+")",$t.rows[$t.p.iRow]).removeClass("edit-cell ui-state-highlight");
                            $($t.rows[$t.p.iRow]).removeClass("selected-row ui-state-hover");
                        }
                        $(cc).addClass("edit-cell ui-state-highlight");
                        $($t.rows[iRow]).addClass("selected-row ui-state-hover");
                        try {
                            tmp =  $.unformat.call($t,cc,{rowId: $t.rows[iRow].id, colModel:cm},iCol);
                        } catch (_) {
                            tmp = ( cm.edittype && cm.edittype === 'textarea' ) ? $(cc).text() : $(cc).html();
                        }
                        if($t.p.autoencode) { tmp = $.jgrid.htmlDecode(tmp); }
                        if (!cm.edittype) {cm.edittype = "text";}
                        $t.p.savedRow.push({id:iRow,ic:iCol,name:nm,v:tmp});
                        if(tmp === "&nbsp;" || tmp === "&#160;" || (tmp.length===1 && tmp.charCodeAt(0)===160) ) {tmp='';}
                        if($.isFunction($t.p.formatCell)) {
                            var tmp2 = $t.p.formatCell.call($t, $t.rows[iRow].id,nm,tmp,iRow,iCol);
                            if(tmp2 !== undefined ) {tmp = tmp2;}
                        }
                        $($t).triggerHandler("jqGridBeforeEditCell", [$t.rows[iRow].id, nm, tmp, iRow, iCol]);
                        if ($.isFunction($t.p.beforeEditCell)) {
                            $t.p.beforeEditCell.call($t, $t.rows[iRow].id,nm,tmp,iRow,iCol);
                        }
                        var opt = $.extend({}, cm.editoptions || {} ,{id:iRow+"_"+nm,name:nm});
                        var elc = $.jgrid.createEl.call($t,cm.edittype,opt,tmp,true,$.extend({},$.jgrid.ajaxOptions,$t.p.ajaxSelectOptions || {}));
                        $(cc).html("").append(elc).attr("tabindex","0");
                        $.jgrid.bindEv.call($t, elc, opt);
                        window.setTimeout(function () { $(elc).focus();},0);
                        $("input, select, textarea",cc).bind("keydown",function(e) {
                            if (e.keyCode === 27) {
                                if($("input.hasDatepicker",cc).length >0) {
                                    if( $(".ui-datepicker").is(":hidden") )  { $($t).jqGrid("restoreCell",iRow,iCol); }
                                    else { $("input.hasDatepicker",cc).datepicker('hide'); }
                                } else {
                                    $($t).jqGrid("restoreCell",iRow,iCol);
                                }
                            } //ESC
                            if (e.keyCode === 13) {
                                $($t).jqGrid("saveCell",iRow,iCol);
                                // Prevent default action
                                return false;
                            } //Enter
                            if (e.keyCode === 9)  {
                                if(!$t.grid.hDiv.loading ) {
                                    if (e.shiftKey) {$($t).jqGrid("prevCell",iRow,iCol);} //Shift TAb
                                    else {$($t).jqGrid("nextCell",iRow,iCol);} //Tab
                                } else {
                                    return false;
                                }
                            }
                            e.stopPropagation();
                        });
                        $($t).triggerHandler("jqGridAfterEditCell", [$t.rows[iRow].id, nm, tmp, iRow, iCol]);
                        if ($.isFunction($t.p.afterEditCell)) {
                            $t.p.afterEditCell.call($t, $t.rows[iRow].id,nm,tmp,iRow,iCol);
                        }
                    } else {
                        if (parseInt($t.p.iCol,10)>=0  && parseInt($t.p.iRow,10)>=0) {
                            $("td:eq("+$t.p.iCol+")",$t.rows[$t.p.iRow]).removeClass("edit-cell ui-state-highlight");
                            $($t.rows[$t.p.iRow]).removeClass("selected-row ui-state-hover");
                        }
                        cc.addClass("edit-cell ui-state-highlight");
                        $($t.rows[iRow]).addClass("selected-row ui-state-hover");
                        tmp = cc.html().replace(/\&#160\;/ig,'');
                        $($t).triggerHandler("jqGridSelectCell", [$t.rows[iRow].id, nm, tmp, iRow, iCol]);
                        if ($.isFunction($t.p.onSelectCell)) {
                            $t.p.onSelectCell.call($t, $t.rows[iRow].id,nm,tmp,iRow,iCol);
                        }
                    }
                    $t.p.iCol = iCol; $t.p.iRow = iRow;

                    if(typeof $t.p.onDownSearch == 'function' && typeof ed == 'undefined') {
                        $t.p.onDownSearch($t.p.selrow, $('#'+$t.p.id).jqGrid('getRowData', $t.p.selrow));
                    }

                    if(typeof $t.p._onNavigate == 'function' && typeof ed == 'undefined') {
                        $t.p._onNavigate($t.p.selrow, $('#'+$t.p.id).jqGrid('getRowData', $t.p.selrow));
                    }
                   
                    var trid = $($t).jqGrid('getGridRowById',$t.p.selrow);
                    $( trid ).siblings().removeClass("ui-state-highlight");


                    /** ScrollTop for multiple/editable grid */
                    var ner, selection = $t.p.selrow;

                    function scrGrid(iR){
                        var ch = $($t.grid.bDiv)[0].clientHeight,
                        st = $($t.grid.bDiv)[0].scrollTop,
                        rpos = $($t.rows[iR]).position().top,
                        rh = $t.rows[iR].clientHeight;
                        if(rpos+rh >= ch+st) { $($t.grid.bDiv)[0].scrollTop = rpos-(ch+st)+rh+st; }
                        else if(rpos < ch+st) {
                            if(rpos < st) {
                                $($t.grid.bDiv)[0].scrollTop = rpos;
                            }
                        }
                    }
                    if($t.p.scrollrows===true) {
                        ner = $($t).jqGrid('getGridRowById',selection).rowIndex;
                        if(ner >=0 ){
                            scrGrid(ner);
                        }
                    }

                    /** End of ScrollTop for multiple/editable grid */
                });
            }
        });

        // Formatters
        $.extend($.fn.fmatter, {
            requiredField : function(cellvalue, options, rowdata) {
                if (cellvalue === null) {
                    return '<span class="badge bg-red col-md-12">REQUIRED</span>';
                } else {
                    return cellvalue;
                }
            }
        });

        $.extend($.fn.fmatter.requiredField, {
            unformat : function(cellvalue, options) {
                if (cellvalue === '<span class="badge bg-red col-md-12">REQUIRED</span>') {
                    return null;
                } else {
                    return cellvalue;
                }
            }
        });

        // Formatters
        $.extend($.fn.fmatter, {
            locked : function(cellvalue, options, rowdata) {
                if (cellvalue === 1) {
                    return '<i class="text-red fa fa-lock bigger-180"></i>';
                } else {
                    return '<i class="text-green fa fa-unlock bigger-180"></i>';
                }
            }
        });

        $.extend($.fn.fmatter.locked, {
            unformat : function(cellvalue, options) {
                if (cellvalue === '<i class="text-red fa fa-lock bigger-180"></i>') {
                    return 1;
                } else {
                    return 0;
                }
            }
        });
    }
);