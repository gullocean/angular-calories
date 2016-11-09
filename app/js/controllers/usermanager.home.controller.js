(function() {
  'use strict';

  angular
    .module('calories')
    .controller('UserManagerHomeController', UserManagerHomeController);

  UserManagerHomeController.$inject = ['$rootScope', '$scope', '$http', 'NgTableParams'];

  function UserManagerHomeController($rootScope, $scope, $http, NgTableParams) {
    var vm = this;
    vm.user = null;
    vm.allUsers = [];

    var self = this;
    var data = [{name: "Moroni", age: 50},
    {name: "Moroni", age: 50},
    {name: "Moroni", age: 50},
    {name: "Moroni", age: 50},
    {name: "Moroni", age: 50},
    {name: "Moroni", age: 50},
    {name: "Moroni", age: 50},
    {name: "Moroni", age: 50},
    {name: "Moroni", age: 50}];
    self.tableParams = new NgTableParams({}, { dataset: data});

    $scope.onUpdateSetting = function() {
      if ($scope.flagEdit) {
        //$http
        //error : $scope.oldSetting = angular.copy($scope.currentUser.setting);
      } else {
        $scope.oldSetting = angular.copy($scope.currentUser.setting);
        console.log($scope.oldSetting);
      }
    }

    $scope.onCancelSetting = function() {
      $scope.flagEdit = false;
      $scope.currentUser.setting = angular.copy($scope.oldSetting);
    }

    initController();

    function initController() {
      $scope.currentUser = $rootScope.globals.currentUser;
      $scope.oldSetting = angular.copy($scope.currentUser.setting);


      //loadCurrentUser();
      //loadAllUsers();
    }
  }
})();