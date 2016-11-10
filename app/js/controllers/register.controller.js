(function() {
  'use strict';

  angular
    .module('calories')
    .controller('RegisterController', RegisterController);

  RegisterController.$inject = ['$location', '$rootScope', 'FlashService'];

  function RegisterController($location, $rootScope, FlashService) {
    var vm = this;

    vm.register = register;

    function register() {
      //vm.dataLoading = true;
      /*UserService.Create(vm.user)
          .then(function (response) {
              if (response.success) {
                  FlashService.Success('Registration successful', true);
                  $location.path('/regular-user-home');
              } else {
                  FlashService.Error(response.message);
                  vm.dataLoading = false;
              }
          });*/
      $location.path('/regular-user-home');
    }
  }
})();