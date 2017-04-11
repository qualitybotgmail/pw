require.config({
	paths: {
		domReady: 		'../vendor/domReady/domReady.min',
		jquery: 		'../vendor/jquery/jquery-2.0.3.min',
		angular: 		'../vendor/angular/angular.min',
		underscore: 	'../vendor/underscore/underscore.min',
		restangular: 	'../vendor/restangular/restangular.min',
		uiRouter: 		'../vendor/angular-ui-route/angular-ui-router.min',
		pace: 			'../vendor/pace/pace.min',
		bootstrap: 		'../vendor/bootstrap/bootstrap.min',
		lteApp: 		'../vendor/lte/app.min',
		lteAppExtend: 	'../vendor/lte/app.extend.min',
		chosen: 		'../vendor/chosen/chosen.jquery.min',
		jqGrid: 		'../vendor/jqgrid/jquery.jqgrid.min',
		jqGridLocaleEn: '../vendor/jqgrid/i18n/grid.locale-en.min',
		uiBootstrap: 	'../vendor/ui-bootstrap/ui-bootstrap.min',
		jqueryUi: 		'../vendor/jquery-ui/jquery-ui.min',
		ngAnimate: 		'../vendor/angular-animate/angular-animate.min',
		gritter: 		'../vendor/gritter/jquery.gritter.min',
		blockUi: 		'../vendor/blockui/blockUI.min',
		jwerty: 		'../vendor/jwerty/jwerty.min',
		datepicker: 	'../vendor/datepicker/js/bootstrap-datepicker.min',
		maskedinput: 	'../vendor/maskedinput/jquery.maskedinput.min',
		select2: 		'../vendor/select2/select2.min',
		highlight: 		'../vendor/highlight/jquery.highlight.min',
		debounce: 		'../vendor/angular-debounce/angular-debounce.min',
		papa: 			'../vendor/papaparse/papaparse',
		socketIO: 		'../vendor/angular-socket-io/socket.min',
		moment: 		'../vendor/moment/moment.min',

		// Uploader
		loadImage: 		'../vendor/jquery-fileupload/load-image.min',
		loadImageMeta: 	'../vendor/jquery-fileupload/load-image-meta.min',
		loadImageExif: 	'../vendor/jquery-fileupload/load-image-exif.min',
		loadImageIos: 	'../vendor/jquery-fileupload/load-image-ios.min',
		upload: 		'../vendor/jquery-fileupload/jquery.fileupload.min',
		uploadAngular: 	'../vendor/jquery-fileupload/jquery.fileupload-angular.min',
		uploadAudio: 	'../vendor/jquery-fileupload/jquery.fileupload-audio.min',
		uploadProcess:	'../vendor/jquery-fileupload/jquery.fileupload-process.min',
		uploadImage: 	'../vendor/jquery-fileupload/jquery.fileupload-image.min',
		uploadValidate:	'../vendor/jquery-fileupload/jquery.fileupload-validate.min',
		uploadVideo: 	'../vendor/jquery-fileupload/jquery.fileupload-video.min',
		uploadWidget:   '../vendor/jquery-fileupload/vendor/jquery.ui.widget.min',
		
		html2canvas:    '../vendor/html2canvas/html2canvas',
		canvas2image:   '../vendor/canvas2image/canvas2image',
		text:           '../vendor/requirejs/require-text',
		
		fancybox :  	'../vendor/jquery-fancybox/jquery.fancybox.min',
		ngIdleJs :		'../vendor/ngIdle/angular-idle.min',
		bootstrapSwitch:'../vendor/bootstrap-switch/bootstrap-switch.min',
		ngNotification :'../vendor/angular-notifications/angular-notification.min',
		ngFilter :'../vendor/angular-filter/angular-filter',

	},
	shim: {
		'angular' 		: {exports : 'angular', deps: ['jquery']},
		'jquery'		: {exports : '$'},
		'Papa'			: {exports : 'Papa'},
		'uiRouter' 		: {deps: ['angular']},
		'restangular'	: {deps: ['angular', 'underscore']},
		'uiBootstrap'	: {deps: ['angular', 'jquery']},
		'ngAnimate'		: {deps: ['angular']},
		'chosen'		: {deps: ['jquery']},
		'gritter'		: {deps: ['jquery']},
		'jqueryUi'		: {deps: ['jquery']},
		'bootstrap'		: {deps: ['jquery']},
		'blockUi'		: {deps: ['jquery']},
		'jwerty'		: {deps: ['jquery']},
		'select2'		: {deps: ['jquery']},
		'highlight'		: {deps: ['jquery']},
		'debounce' 		: {deps: ['angular']},
		'moment' 		: {deps: ['jquery']},
		
		'fancybox' 		: {deps: ['jquery']},
		'ngIdleJs' 		: {deps: ['angular']},
		'bootstrapSwitch': {deps: ['angular']},
		'ngNotification': {deps: ['angular']},
		'ngFilter': {deps: ['angular']},

		'html2canvas': {
            exports: 'html2canvas',
            deps: ['jquery']
        },
        'canvas2image': {
        	exports: 'Canvas2Image',
        	deps: ['html2canvas']
        },

	},
	
	priority: [
		"pace",
		"angular",
		"jquery"
	],

	urlArgs: "paqs=" + Talknote.version,
	
	deps: ['start']
});

requirejs.onError = function (err) {
    /*if (err.requireType === 'timeout') {
    	alert('Loading Error, the window will be reloaded.');
        //window.location.reload();
    } else {
        throw err;
    }*/
};