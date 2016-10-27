define(['app'], function(app)
{
    app.factory('CommentsModel',
    [
        'Restangular',

        function(Restangular) {
            return Restangular.service('comments');
        }
    ]);
});