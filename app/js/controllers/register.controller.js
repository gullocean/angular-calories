(function() {
  'use strict';

  angular
    .module('calories')
    .controller('RegisterController', RegisterController);

  RegisterController.$inject = ['$location', '$rootScope', 'FlashService', 'RestAPI', 'AuthenticationService', 'ROLE'];

  function RegisterController($location, $rootScope, FlashService, RestAPI, AuthenticationService, ROLE) {
    var vm = this;

    vm.register = register;

    (function initController() {
      AuthenticationService.ClearCredentials();
    })();

    function register() {
      vm.dataLoading = true;
      RestAPI.Register(vm.username, vm.password, vm.setting, ROLE.REGULAR_USER, function(response) {
        console.log(response);
        if (!response.resultCode) {
          FlashService.Success(response.message);
          vm.currentUser = {};
          vm.currentUser.username = response.currentUser.username;
          vm.currentUser.id       = +response.currentUser.id;
          vm.currentUser.role     = +response.currentUser.role;
          vm.currentUser.setting  = +response.currentUser.setting;
          vm.token                = response.token;
          AuthenticationService.SetCredentials('currentUser', vm.currentUser);
          AuthenticationService.SetCredentials('token', vm.token);
          vm.dataLoading = false;
          $location.path('/regular-user-home');
        } else {
          FlashService.Error(response.message);
          vm.dataLoading = false;
        }
      });
    }
  }
})();