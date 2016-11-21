define(['app'], function(app)
{
    app.factory('IgnoredThreadsModel',
    [
        'Restangular',

        function(Restangular) {
            return Restangular.service('ignored_threads');
        }
    ]);
});