define(['app'], function(app)
{
    app.factory('ProfilesModel',
    [
        'Restangular',

        function(Restangular) {
            return Restangular.service('profiles');
        }
    ]);
});