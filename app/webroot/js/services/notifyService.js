/** 
* Used  for notification such as system update, loading state, etc.
*
*/

define(['angular'], function(angular)
{
    'use strict';
        
    var notify = angular.module('notify', []);

    notify.service('notifyService',
    [
        function(){
            this.loading = {
                show: true,
                change: true,
                first: false
            }
        }
    ]);
});