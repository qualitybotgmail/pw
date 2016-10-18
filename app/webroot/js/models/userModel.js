define(['app'], function(app)
{
    app.factory('userModel',
    [
        'Restangular',

        function(Restangular) {
            return Restangular.service('user');
        }
    ]);
});