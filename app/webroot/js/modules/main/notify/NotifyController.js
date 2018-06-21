define(['app'], function(app)
{
	app.controller('NotifyController',
    [
    	'$scope',
        '$interval',

        function($scope, $interval) {
            var ctr = 0;

            $scope.data = {
                num: 0
            };

            var interval = $interval(function(){
                /*$scope.$apply(function(){

                });*/
                $scope.data.num = ctr++;
                //console.log($scope.data.num);
            }, 1000);
            

        	/*$scope.dataTest = "sadsad";

        	setInterval(function(){
        		console.log(ctr++);
        	}, 2000);

            $scope.test123 = [{"num" : 1}, {"num" : 2}];*/
/*
            $scope.loading = {
                show: true
            }*/
        	
            $scope.$on('$destroy', function(){
                $interval.cancel(interval);
            });
        }
    ]);
});