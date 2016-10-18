define(['app', 'underscore', './modalService', './focusService'], function(app, _)
{
    app.service('pdfService',
    [
        '$timeout',
        'modalService',
        'focusService',

        function($timeout, Modal, Focus)
        {
            this.open = function(headerText, url) {
                var pdf = Modal.pdf(headerText, url);
                pdf.opened.then(
                    function(){
                        var t = $timeout(function() {
                            Focus.on('#modal-report object');
                        });
                    }
                );

                pdf.result.then(
                    function() {},
                    function() {
                        Focus.last();
                    }
                );
            };
        }
    ]);
});