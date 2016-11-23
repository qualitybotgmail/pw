define([], function()
{
    var baseSourcePath = Talknote.baseSourcePath + 'js/modules/';

    return {
        defaultRoutePath: '/',
        routes: {
            '/': {
                views: {
                    'main': {
                        templateUrl: baseSourcePath + 'main/main.html?version=' + Talknote.version,
                        controller: 'MainController'
                    },
                    'loading': {
                        templateUrl: baseSourcePath + 'main/loading/loading.html?version=' + Talknote.version,
                        controller: 'LoadingController'  
                    }
                    // ,
                    // 'notify': {
                    //     templateUrl: baseSourcePath + 'main/notify/notify.html?version=' + Talknote.version,
                    //     controller: 'NotifyController'
                    // }
                },
                
                dependencies: [
                    'modules/main/index'
                ],
                name: 'app'
            },
            
            'threads': {
                views: {
                    'content': {
                        templateUrl: baseSourcePath + 'threads/threads.html?version=' + Talknote.version,
                        controller: 'ThreadsController'   
                    }
                },
                dependencies: [
                    'modules/threads/index'
                ],
                name: 'app.threads'
            },

            'threads/:id': {
                views: {
                    'content': {
                        templateUrl: baseSourcePath + 'thread/thread.html?version=' + Talknote.version,
                        controller: 'ThreadController'   
                    }
                },
                dependencies: [
                    'modules/thread/index'
                ],
                name: 'app.thread'
            },

            'heads/:id': {
                views: {
                    'content': {
                        templateUrl: baseSourcePath + 'head/head.html?version=' + Talknote.version,
                        controller: 'HeadController'   
                    }
                },
                dependencies: [
                    'modules/head/index'
                ],
                name: 'app.head'
            },

            'message/:id': {
                views: {
                    'content': {
                        templateUrl: baseSourcePath + 'message/message.html?version=' + Talknote.version,
                        controller: 'MessageController'   
                    }
                },
                dependencies: [
                    'modules/message/index'
                ],
                name: 'app.message'
            },

            'timeline': {
                views: {
                    'content': {
                        templateUrl: baseSourcePath + 'timeline/timeline.html?version=' + Talknote.version,
                        controller: 'TimelineController'   
                    }
                },
                dependencies: [
                    'modules/timeline/index'
                ],
                name: 'app.timeline'
            },

            'profile': {
                views: {
                    'content': {
                        templateUrl: baseSourcePath + 'profile/profile.html?version=' + Talknote.version,
                        controller: 'ProfileController'   
                    }
                },
                dependencies: [
                    'modules/profile/index'
                ],
                name: 'app.profile'
            },

        }
    };
});