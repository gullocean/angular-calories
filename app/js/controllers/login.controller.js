(function() {
  'use strict';

  angular
    .module('calories')
    .controller('LoginController', LoginController);

  LoginController.$inject = ['$location', 'AuthenticationService', 'FlashService', 'ROLE'];

  function LoginController($location, AuthenticationService, FlashService, ROLE) {
    var vm = this;

    vm.login = login;

    (function initController() {
      // reset login status
      AuthenticationService.ClearCredentials();
    })();

    function login() {
      vm.dataLoading = true;
      AuthenticationService.Login(vm.username, vm.password, function(response) {
        if (response.resultCode) {
          response.currentUser.role = +response.currentUser.role;
          response.currentUser.setting = +response.currentUser.setting;
          response.currentUser.id = +response.currentUser.id;
          console.log(response);
          AuthenticationService.SetCredentials(response);
          switch(response.currentUser.role) {
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
          FlashService.Error(response.resultString);
          vm.dataLoading = false;
        }
      });
    };
  }
})();