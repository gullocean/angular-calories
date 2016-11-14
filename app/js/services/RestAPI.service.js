(function() {
  'use strict';

  angular
    .module('calories')
    .factory('RestAPI', RestAPI);

  RestAPI.$inject = ['$http', '$location', 'API_URL', 'AuthenticationService'];

  function RestAPI($http, $location, API_URL, AuthenticationService) {
    var service = {};

    service.Login     = Login;
    service.Register  = Register;
    service.CreateUser = CreateUser;
    service.GetUsers  = GetUsers;
    service.GetUserCalories = GetUserCalories;
    service.UpdateUser = UpdateUser;
    service.DeleteUser = DeleteUser;
    service.DeleteCalories = DeleteCalories;
    service.UpdateCalories = UpdateCalories;
    service.CreateCalories = CreateCalories;

    return service;

    function Login(username, password, callback) {
      var data = {
        username: username,
        password: password,
      };
      $http({
        method: 'POST',
        url: API_URL + 'users/auth',
        data: data,
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
      }).success(function (response) {
        AuthenticationService.SetCredentials('token', response.token);
        callback(response);
      }).error(function (error) {
        $location.path('/login');
      });
    }
    function Register(username, password, setting, role, callback) {
      var data = {
        username: username,
        password: password,
        setting: setting,
        role: role
      };
      $http({
        method: 'POST',
        url: API_URL + 'users/register',
        data: data,
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
      }).success(function(response) {
        callback(response);
      }).error(function(error) {
        callback(error);
      });
    }
    function CreateUser(user_data, callback) {
      var data = {
        username: user_data.username,
        password: user_data.password,
        setting: user_data.setting,
        role: user_data.role
      };
      $http({
        method: 'POST',
        url: API_URL + 'users',
        data : data,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'token': AuthenticationService.GetCredential('token')
        }
      }).success(function(response) {
        AuthenticationService.SetCredentials('token', response.token);
        callback(response);
      }).error(function(error) {
        callback(error);
        $location.path('/login');
      });
    }
    function UpdateUser(user_data, callback) {
      $http({
        method: 'PUT',
        url: API_URL + 'users/' + user_data.id,
        data: user_data,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'token': AuthenticationService.GetCredential('token')
        }
      }).success(function(response) {
        AuthenticationService.SetCredentials('token', response.token);
        callback(response);
      }).error(function(error) {
        callback(error);
        $location.path('/login');
      });
    }
    function DeleteUser(user_id, callback) {
      $http({
        method: 'DELETE',
        url: API_URL + 'users/' + user_id,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'token': AuthenticationService.GetCredential('token')
        }
      }).success(function(response) {
        AuthenticationService.SetCredentials('token', response.token);
        callback(response);
      }).error(function(error) {
        callback(error);
        $location.path('/login');
      });
    }
    function GetUsers(callback) {
      $http({
        method: 'GET',
        url: API_URL + 'users',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'token': AuthenticationService.GetCredential('token')
        }
      }).success(function(response) {
        AuthenticationService.SetCredentials('token', response.token);
        callback(response);
      }).error(function(error) {
        callback(error);
        $location.path('/login');
      });
    }
    function GetUserCalories(user_id, callback) {
      $http({
        method: 'GET',
        url: API_URL + 'usercalories/' + user_id,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'token': AuthenticationService.GetCredential('token')
        }
      }).success(function(response) {
        AuthenticationService.SetCredentials('token', response.token);
        callback(response);
      }).error(function(error) {
        $location.path('/login');
      });
    }
    function UpdateCalories(calories_data, callback) {
      var calories_id = calories_data.id;
      $http({
        method: 'PUT',
        url: API_URL + 'calories/' + calories_id,
        data: {date: calories_data.date, time: calories_data.time, meal: calories_data.meal, calories: calories_data.calories},
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'token': AuthenticationService.GetCredential('token')
        }
      }).success(function(response) {
        AuthenticationService.SetCredentials('token', response.token);
        callback(response);
      }).error(function(error) {
        callback(error);
        $location.path('/login');
      });
    }
    function DeleteCalories(calories_id, callback) {
      $http({
        method: 'DELETE',
        url: API_URL + 'calories/' + calories_id,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'token': AuthenticationService.GetCredential('token')
        }
      }).success(function(response) {
        AuthenticationService.SetCredentials('token', response.token);
        callback(response);
      }).error(function(error) {
        callback(error);
        $location.path('/login');
      });
    }
    function CreateCalories(calories, callback) {
      $http({
        method: 'POST',
        url: API_URL + 'calories',
        data: calories,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'token': AuthenticationService.GetCredential('token')
        }
      }).success(function(response) {
        AuthenticationService.SetCredentials('token', response.token);
        callback(response);
      }).error(function(error) {
        callback(error);
        $location.path('/login');
      });
    }
  }
})();