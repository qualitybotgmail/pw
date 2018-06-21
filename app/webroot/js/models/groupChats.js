define(['app'], function(app)
{
    app.factory('GroupChatModel',
    [
        'Restangular',

        function(Restangular) {
            return Restangular.service('groupchats');
        }
    ]);
    
});