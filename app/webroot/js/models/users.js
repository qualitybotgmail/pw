define(['app'], function(app)
{
    app.factory('UsersModel',
    [
        'Restangular',

        function(Restangular) {
            return Restangular.service('users');
        }
    ]);
});