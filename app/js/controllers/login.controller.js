(function() {
  'use strict';

  angular
    .module('calories')
    .controller('LoginController', LoginController);

  LoginController.$inject = ['$location', 'AuthenticationService', 'FlashService', 'ROLE', 'RestAPI'];

  function LoginController($location, AuthenticationService, FlashService, ROLE, RestAPI) {
    var vm = this;

    vm.login = login;

    (function initController() {
      if (!!AuthenticationService.GetCredential('token')) {
        RestAPI.Logout(function(response) {
          if (!response.resultCode) {
            FlashService.Success(response.message);
          }
        });
      }
      AuthenticationService.ClearCredentials();
    })();

    function login() {
      vm.dataLoading = true;
      RestAPI.Login(vm.username, vm.password, function(response) {
        if (!response.resultCode) {
          FlashService.Success(response.message);
          vm.currentUser = {};
          vm.currentUser.username = response.currentUser.username;
          vm.currentUser.id       = +response.currentUser.id;
          vm.currentUser.role     = +response.currentUser.role;
          vm.currentUser.setting  = +response.currentUser.setting;
          vm.token                = response.token;
          AuthenticationService.SetCredentials('currentUser', vm.currentUser);
          vm.dataLoading = false;
          switch(vm.currentUser.role) {
            case ROLE.ADMIN:
              $location.path('/admin-home');
              break;
            case ROLE.USER_MANAGER:
              $location.path('/user-manager-home');
              break;
            case ROLE.REGULAR_USER:
              $location.path('/regular-user-home');
              break;
          }
        } else {
          FlashService.Error(response.message);
          vm.dataLoading = false;
        }
      });
    };
  }
})();