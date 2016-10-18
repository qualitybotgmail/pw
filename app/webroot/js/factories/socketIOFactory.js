define(['app'], function(app)
{
    app.factory('socketIOFactory',
    [
        'socketFactory',
        'GLOBAL',

        function(socketFactory, GLOBAL) {
            return socketFactory({
            	ioSocket: io.connect(GLOBAL.baseUrl + ':3000/')
            });
        }
    ]);
});