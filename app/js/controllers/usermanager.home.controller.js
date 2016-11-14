(function() {
  'use strict';

  angular
    .module('calories')
    .controller('UserManagerHomeController', UserManagerHomeController);

  UserManagerHomeController.$inject = ['$location', '$scope', 'NgTableParams', '$modal', 'API_URL', '$alert', 'ROLE', 'RestAPI', 'AuthenticationService', 'usSpinnerService'];

  function UserManagerHomeController($location, $scope, NgTableParams, $modal, API_URL, $alert, ROLE, RestAPI, AuthenticationService, usSpinnerService) {
    var vm = this;
    initController();
    function initController() {
      if (!AuthenticationService.CheckCredential()) $location.path('/login');
      vm.currentUser = AuthenticationService.GetCredential('currentUser');
      RestAPI.GetUsers(function(response) {
        if (!response.resultCode) {
          vm.users = response.users;
          vm.users.forEach(function(user) {
            user.id = +user.id;
            user.setting = +user.setting;
          })
          vm.tableParams = new NgTableParams({}, { dataset: vm.users});
        }
      });
    }
    $scope.showModal = function(data) {
      var modalObj, modalContent;
      modalContent = {
        scope: $scope,
        templateUrl: 'public/views/',
        show: false,
        backdrop: false
      };
      switch(data.cmd) {
        case 'create':
          modalContent.title = 'Add User';
          modalContent.templateUrl += 'adduser.modal.html';
          break;
        case 'delete':
          modalContent.title = 'Notification!';
          modalContent.content = 'Would you delete this user?';
          modalContent.templateUrl += 'deleteuser.modal.html';
          vm.selected_user = data.user;
          break;
        case 'edit':
          modalContent.title = 'Edit User';
          modalContent.templateUrl += 'edituser.modal.html';
          vm.selected_user = data.user;
          vm.edit_user = angular.copy(vm.selected_user);
          break;
      }
      modalObj = $modal(modalContent);
      modalObj.$promise.then(modalObj.show);
    }
    $scope.onCreateUser = function(user_data) {
      var data = {
        username: user_data.username,
        password: user_data.password,
        setting: user_data.setting,
        role: ROLE.REGULAR_USER
      };
      usSpinnerService.spin('spinner');
      RestAPI.CreateUser(data, function(response) {
        SetAlert(response.resultCode === 0 ? 'success' : 'danger', response.message);
        if (!response.resultCode) {
          var new_user = response.currentUser;
          vm.users.unshift(new_user);
          vm.tableParams.reload();
        }
        usSpinnerService.stop('spinner');
      });
    }
    $scope.onEditUser = function(user_data) {
      var data = {
        id: user_data.id,
        username: user_data.username,
        password: user_data.password,
        setting: user_data.setting,
        role: ROLE.REGULAR_USER
      };
      usSpinnerService.spin('spinner');
      RestAPI.UpdateUser(data, function(response) {
        SetAlert(response.resultCode === 0 ? 'success' : 'danger', response.message);
        if (!response.resultCode) {
          response.currentUser.id = +response.currentUser.id;
          response.currentUser.role = +response.currentUser.role;
          response.currentUser.setting = +response.currentUser.setting;
          vm.edit_user = response.currentUser;
          var index = vm.users.indexOf(vm.selected_user);
          var keys = Object.keys(response.currentUser);
          keys.forEach(function(key) {
            vm.users[index][key] = response.currentUser[key];
          })
          vm.tableParams.reload();
        }
        usSpinnerService.stop('spinner');
      });
    }
    $scope.onDeleteUser = function(user_data) {
      usSpinnerService.spin('spinner');
      RestAPI.DeleteUser(user_data.id, function(response) {
        SetAlert(response.resultCode === 0 ? 'success' : 'danger', response.message);
        if (!response.resultCode) {
          var index = vm.users.indexOf(vm.selected_user);
          vm.users.splice(index, 1);
          vm.tableParams.reload();
        }
        usSpinnerService.stop('spinner');
      });
    }
    function SetAlert(type, message) {
      var alert = $alert({
        type: type,
        content: message,
        container: '#alerts-container',
        placement: 'top',
        show: true,
        duration: 2,
        animation: 'am-fade-and-slide-top'
      });
    }
  }
})();