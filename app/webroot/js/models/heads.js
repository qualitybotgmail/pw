define(['app'], function(app)
{
    app.factory('HeadsModel',
    [
        'Restangular',

        function(Restangular) {
            return Restangular.service('heads');
        }
    ]);
    
});