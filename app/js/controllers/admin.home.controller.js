(function() {
  'use strict';

  angular
    .module('calories')
    .controller('AdminHomeController', AdminHomeController);

  AdminHomeController.$inject = ['$location', '$scope', 'AuthenticationService', 'RestAPI', 'NgTableParams', '$modal', 'ROLE', '$alert', 'usSpinnerService'];

  function AdminHomeController($location, $scope, AuthenticationService, RestAPI, NgTableParams, $modal, ROLE, $alert, usSpinnerService) {
    var vm = this;
    vm.roles = [
      {
        value: ROLE.ADMIN,
        label: "Admin"
      }, {
        value: ROLE.USER_MANAGER,
        label: "User Manager"
      }, {
        value: ROLE.REGULAR_USER,
        label: "Regular User"
      }
    ];
    vm.ROLE = ROLE;
    initController();
    function initController() {
      if (!AuthenticationService.CheckCredential()) $location.path('/login');
      vm.currentUser = AuthenticationService.GetCredential('currentUser');
      vm.currentUser.role = +vm.currentUser.role;
      
      RestAPI.GetUsers(function(response) {
        vm.users = response.users;
        vm.users.forEach(function(user) {
          user.id = +user.id;
          user.setting = user.setting === null ? null : +user.setting;
        })
        vm.tableParams = new NgTableParams({}, { dataset: vm.users});
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
      }
      modalObj = $modal(modalContent);
      modalObj.$promise.then(modalObj.show);
    }
    $scope.onCreateUser = function(user_data) {
      var data = angular.copy(user_data);
      if (data.hasOwnProperty('confirmPassword')) delete data.confirmPassword;
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
      var data = angular.copy(user_data);
      if (data.hasOwnProperty('confirmPassword')) delete data.confirmPassword;
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
    $scope.onView = function(user_data) {
      $location.path('/regular-user-home').search(user_data);
    }
    $scope.isRegularUser = function(user_data) {
      return (+user_data.role) === ROLE.REGULAR_USER;
    }
    $scope.getUserLabel = function(user_data) {
      for (var i = 0; i < vm.roles.length; i ++) {
        if ((+user_data.role) == vm.roles[i].value) return vm.roles[i].label;
      }
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