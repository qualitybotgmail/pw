define(['app'], function(app)
{
    app.factory('ThreadsModel',
    [
        'Restangular',

        function(Restangular) {
            return Restangular.service('threads');
        }
    ]);
});