define(['app'], function(app)
{
    app.factory('UploadsModel',
    [
        'Restangular',

        function(Restangular) {
            return Restangular.service('uploads');
        }
    ]);
});