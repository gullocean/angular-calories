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
      'angular-momentjs',
      'angularSpinner'
    ])
    .config(config)
    .run(run)
    .constant('ROLE', {
      ADMIN: 0,
      USER_MANAGER: 1,
      REGULAR_USER: 2
    })
    .constant('DATE_FORMAT', 'YYYY-MM-DD')
    .constant('TIME_FORMAT', 'HH:mm')
    .constant('API_URL', 'http://192.168.0.28/RestAPI/api/')
    .factory('httpRequestInterceptor', function () {
      return {
        request: function (config) {
          config.headers['Authorization'] = 'Basic d2VudHdvcnRobWFuOkNoYW5nZV9tZQ==';
          config.headers['Accept'] = 'application/json;odata=verbose';
          return config;
        }
      };
    })
    .filter("rangeDate", function($moment, DATE_FORMAT, TIME_FORMAT) {
      return function(items, filterDate) {
        if (angular.isUndefined(items) || items === null) return null;
        if (angular.isUndefined(filterDate) || filterDate === null) return items;

        var minDate = $moment(), maxDate = $moment(), minTime = $moment(), maxTime = $moment();

        for (var i in items) {
          if (i == 0) {
            minDate = $moment(items[i].date, DATE_FORMAT);
            maxDate = $moment(items[i].date, DATE_FORMAT);
            minTime = $moment(items[i].time, TIME_FORMAT);
            maxTime = $moment(items[i].time, TIME_FORMAT);
          }
          if (minDate.isAfter($moment(items[i].date, DATE_FORMAT)))  minDate = $moment(items[i].date, DATE_FORMAT);
          if (maxDate.isBefore($moment(items[i].date, DATE_FORMAT))) maxDate = $moment(items[i].date, DATE_FORMAT);
          if (minTime.isAfter($moment(items[i].time, TIME_FORMAT)))  minTime = $moment(items[i].time, TIME_FORMAT);
          if (maxTime.isBefore($moment(items[i].time, TIME_FORMAT))) maxTime = $moment(items[i].time, TIME_FORMAT);
        }
        var df, dt, tf, tt;
        if (angular.isUndefined(filterDate.date)) {
          df = minDate.subtract(1, 'days');
          dt = maxDate.add(1, 'days');
        } else {
          df = filterDate.date.startDate === null ? minDate.subtract(1, 'days') : $moment(filterDate.date.startDate);
          dt = filterDate.date.endDate === null ? maxDate.add(1, 'days') : $moment(filterDate.date.endDate);
        }

        if (angular.isUndefined(filterDate.time)) {
          tf = minTime.subtract(1, 'minutes');
          tt = maxTime.add(1, 'minutes');
        } else {
          tf = filterDate.time.startTime === null ? minTime.subtract(1, 'minutes') : $moment($moment(filterDate.time.startTime).format(TIME_FORMAT), TIME_FORMAT);
          tt = filterDate.time.endTime === null ? maxTime.add(1, 'minutes') : $moment($moment(filterDate.time.endTime).format(TIME_FORMAT), TIME_FORMAT);
        }

        var result = [];     
        for (var i in items){
          if (angular.isUndefined(items[i].date)) continue;
          var d = $moment(items[i].date, DATE_FORMAT);
          var t = $moment(items[i].time, TIME_FORMAT);
          if ((d.isAfter($moment(df)) && d.isBefore($moment(dt))) &&
              (t.isAfter($moment(tf)) && t.isBefore($moment(tt))))  {
            result.push(items[i]);
          }
        }
        return result;
      };
    });

  config.$inject = ['$routeProvider', '$locationProvider', '$momentProvider', '$httpProvider', '$modalProvider'];

  function config($routeProvider, $locationProvider, $momentProvider, $httpProvider, $modalProvider) {
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

    angular
      .extend($modalProvider.defaults, {
        html: true
      });
  }

  run.$inject = ['$rootScope', '$location', '$cookieStore', '$http'];

  function run($rootScope, $location, $cookieStore, $http) {
    // keep user logged in after page refresh
    $rootScope.currentUser = $cookieStore.get('currentUser') || {};
    if ($rootScope.currentUser) {
      $http.defaults.headers.common['Authorization'] = 'Basic ' + $rootScope.currentUser.authdata; // jshint ignore:line
    }
    $rootScope.$on('$locationChangeStart', function(event, next, current) {
      // redirect to login page if not logged in and trying to access a restricted page
      var restrictedPage = $.inArray($location.path(), ['/login', '/register']) === -1;
      var loggedIn = $rootScope.currentUser;
      if (restrictedPage && !loggedIn) {
          $location.path('/login');
      }
    });
  }
})();