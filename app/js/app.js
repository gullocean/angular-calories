(function() {
  'use strict';

  angular
    .module('calories', [
      'ngRoute',
      'ngCookies',
      'ngPassword',
      'daterangepicker',
      'ngTable',
      'angular-md5',
      'ui.bootstrap',
      'ngAnimate',
      'ngSanitize',
      'mgcrea.ngStrap',
      'angular-momentjs'
    ])
    .config(config)
    .run(run)
    .constant('ROLE', {
      ADMIN: 0,
      USER_MANAGER: 1,
      REGULAR_USER: 2
    })
    .constant('DATE_FORMAT', 'YYYY-MM-DD')
    .filter("rangeDate", function() {
      return function(items, from, to) {
        if (from === null || to === null) return items;
        var df = $moment(from, DATE_FORMAT);
        var dt = $moment(to, DATE_FORMAT);
        var result = [];     
        for (var i=0; i<items.length; i++){
          var tf = new Date(items[i].date1 * 1000),
              tt = new Date(items[i].date2 * 1000);
          if (items[i].date > from && items[i].date < to)  {
            result.push(items[i]);
          }
        }            
        return result;
      };
    });

  function parseDate(input) {
    var parts = input.split('-');
    return new Date(parts[2], parts[1]-1, parts[0]); 
  }

  config.$inject = ['$routeProvider', '$locationProvider', '$momentProvider'];

  function config($routeProvider, $locationProvider, $momentProvider) {
    $routeProvider
      .when('/admin-home', {
        controller: 'AdminHomeController',
        templateUrl: 'public/views/admin.home.view.html',
        controllerAs: 'vm'
      })
      .when('/user-manager-home', {
        controller: 'UserManagerHomeController',
        templateUrl: 'public/views/usermanager.home.view.html',
        controllerAs: 'vm'
      })
      .when('/regular-user-home', {
        controller: 'RegularUserHomeController',
        templateUrl: 'public/views/regularuser.home.view.html',
        controllerAs: 'vm'
      })
      .when('/login', {
        controller: 'LoginController',
        templateUrl: 'public/views/login.view.html',
        controllerAs: 'vm'
      })
      .when('/register', {
        controller: 'RegisterController',
        templateUrl: 'public/views/register.view.html',
        controllerAs: 'vm'
      })
      .otherwise({
        redirectTo: '/login'
      });

    $momentProvider
      .asyncLoading(false)
      .scriptUrl('node_modules/moment/min/moment.min.js');
  }

  run.$inject = ['$rootScope', '$location', '$cookieStore', '$http'];

  function run($rootScope, $location, $cookieStore, $http) {
    // keep user logged in after page refresh
    $rootScope.globals = $cookieStore.get('globals') || {};
    if ($rootScope.globals.currentUser) {
      $http.defaults.headers.common['Authorization'] = 'Basic ' + $rootScope.globals.currentUser.authdata; // jshint ignore:line
    }

    $rootScope.$on('$locationChangeStart', function(event, next, current) {
      // redirect to login page if not logged in and trying to access a restricted page
      /*var restrictedPage = $.inArray($location.path(), ['/login', '/register']) === -1;
      var loggedIn = $rootScope.globals.currentUser;
      if (restrictedPage && !loggedIn) {
          $location.path('/login');
      }*/
    });
  }

})();