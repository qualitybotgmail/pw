/**
*  The the difference of two given dates
*  http://ditio.net/2010/05/02/javascript-date-difference-calculation/
*/
define(['app'], function(app)
{
     app.service('dateDiffService',
    [
        function() {

            // Private Functions
            var checkDate = function(d) {
                if (typeof d === 'string') {
                    d = new Date(d);
                }

                if (typeof d === 'object') {
                    if (Object.prototype.toString.call(d) === "[object Date]") {
                        if (isNaN(d.getTime())) {
                            return 'Invalid Date';        
                        }

                        return d;
                    }
                else
                    return 'Invalid Date';
                }
            };

            var inDays = function(d1, d2) {
                var t2 = d2.getTime();
                var t1 = d1.getTime();

                return parseFloat((t2-t1)/(24*3600*1000));
            };

            var inWeeks = function(d1, d2) {
                var t2 = d2.getTime();
                var t1 = d1.getTime();
         
                return parseInt((t2-t1)/(24*3600*1000*7));
            };

            var inMonths = function(d1, d2) {
                var d1Y = d1.getFullYear();
                var d2Y = d2.getFullYear();
                var d1M = d1.getMonth();
                var d2M = d2.getMonth();
         
                return (d2M+12*d2Y)-(d1M+12*d1Y);
            };

            var inYears = function(d1, d2) {
                return d2.getFullYear()-d1.getFullYear();
            };



            // Public Functions

            this.get = function(d1, d2, format) {
                
                d1 = checkDate(d1);
                d2 = checkDate(d2);

                if (d1 === 'Invalid Date' || d2 === 'Invalid Date' || d1 === undefined || d2 === undefined) return null;

                switch (format) {
                    case 0: case 'day': case 'd':
                        return inDays(d1, d2);
                        break;
                    case 1: case 'week': case 'w':
                        return inWeeks(d1, d2);
                        break;
                    case 2: case 'month': case 'm':
                        return inMonths(d1, d2);
                        break;
                    case 3: case 'week': case 'y':
                        return inYears(d1, d2);
                        break;
                    default:
                        return inDays(d1, d2);
                }
            };

        }
    ]);
});