/*
    This will return the an HTML string for toolbar buttons.
*/
define(['app'], function(app, pace)
{
    app.service('toolbarService',
    [
        function()
        {
        	var make = function(config) {
		        var template = '<button class="btn btn-xs btn-toolbar _button" name="_name" ng-click="_click" ng-disabled="_disabled"><i class="bigger-110 _icon"></i>_text</button>';
		        var html = '';
		        for (var i = 0, j = config.length; i < config.length; i++) {
		            var htmlTemp = template;

		            // Button
		            htmlTemp = replaceTemplate(htmlTemp, '_button', getProperty(config[i].button));

		            // Icon
		            htmlTemp = replaceTemplate(htmlTemp, '_icon', getProperty(config[i].icon));

		            // Click
		            htmlTemp = replaceTemplate(htmlTemp, '_click', getProperty(config[i].click));

		            // Click
		            htmlTemp = replaceTemplate(htmlTemp, '_disabled', getProperty(config[i].disabled));

		            // Text
		            htmlTemp = replaceTemplate(htmlTemp, '_text', getProperty('&nbsp;' + config[i].text) + '&nbsp;');

		            // Name
					htmlTemp = replaceTemplate(htmlTemp, '_name', getProperty(config[i].name));		            

		            html += htmlTemp;
		        }

		        html = '<div class="row"><div class="col-xs-6 col-md-8">' + html + '</div><div class="col-xs-6 col-md-4"><input type="text" name="grid_search" class="ui-grid-search form-control" placeholder="Search..." ng-model="jqSearch"><i class="fa fa-search ui-grid-search-icon"></i></div></div>';
		        
		        return html;
		    };

		    var getProperty = function(prop) {
		        if (prop) {
		            return isObject(prop);
		        }
		        else {
		            return '';
		        }
		    };

		    var replaceTemplate = function(str, oldText, newText) {
		        return str.replace(oldText, newText);
		    };

		    var isObject = function(prop) {
		        if (Object.prototype.toString.call( prop ) === '[object Array]') {
		            var str = '';
		            for (var key in prop) {
		                str = str + prop[key] + ' ';
		            }

		            return str.trim();
		        }
		        else {
		            return prop;
		        }
		    };

        	
		    this.make = make;
        }
    ])
});