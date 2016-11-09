(function() {
  'use strict';

  angular
    .module('calories')
    .factory('AuthenticationService', AuthenticationService);

  AuthenticationService.$inject = ['$http', '$cookieStore', '$rootScope', '$timeout', 'md5'];

  function AuthenticationService($http, $cookieStore, $rootScope, $timeout, md5) {
    var service = {};

    service.Login = Login;
    service.SetCredentials = SetCredentials;
    service.ClearCredentials = ClearCredentials;

    return service;

    function Login(username, password, callback) {
      var data = JSON.stringify({
        username: username,
        password: md5.createHash(password || ''),
        cmd     : 'authenticate'
      });
      $http({
        method: 'POST',
        url: 'http://192.168.0.28/api/',
        data: data
      }).success(function(response) {
        callback(response);
      }).error(function(error) {
        callback(error);
      });
    }

    function SetCredentials(data) {
      $rootScope.globals = data;

      $cookieStore.put('globals', $rootScope.globals);
    }

    function ClearCredentials() {
      $rootScope.globals = {};
      $cookieStore.remove('globals');
      $http.defaults.headers.common.Authorization = 'Basic';
    }
  }
})();