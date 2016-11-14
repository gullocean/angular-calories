(function() {
  'use strict';

  angular
    .module('calories')
    .controller('RegularUserHomeController', RegularUserHomeController);

  RegularUserHomeController.$inject = ['$location', '$scope', 'AuthenticationService', 'RestAPI', 'NgTableParams', '$cookieStore', '$moment', '$modal', '$alert', 'DATE_FORMAT', 'TIME_FORMAT', 'ROLE', 'usSpinnerService'];

  function RegularUserHomeController($location, $scope, AuthenticationService, RestAPI, NgTableParams, $cookieStore, $moment, $modal, $alert, DATE_FORMAT, TIME_FORMAT, ROLE, usSpinnerService) {
    var vm = this;
    vm.currentUser = {};
    vm.calories = [];
    vm.isAdmin = false;
    vm.new_calories = {id: null, date: null, time: null, meal: null, calories: null, user_id: null};
    vm.selected_calories = null;
    vm.edit_calories = null;
    vm.filterData = {
      date: {
        startDate: null,
        endDate: null
      },
      time: {
        startTime: null,
        endTime: null
      }
    };
    vm.user_id = -1;

    initController();

    function initController() {
      if (!AuthenticationService.CheckCredential()) $location.path('/login');
      vm.currentUser = AuthenticationService.GetCredential('currentUser');
      var params = $location.search();
      params.id = +params.id;
      params.setting = +params.setting;
      params.role = +params.role;
      vm.isAdmin = (vm.currentUser.role === ROLE.ADMIN);
      vm.user_id = vm.isAdmin ? params.id : vm.currentUser.id;
      if (vm.isAdmin) vm.currentUser = params;
      RestAPI.GetUserCalories(vm.user_id, function(response) {
        if (!response.hasOwnProperty('calories') || response.calories === null) {
          console.log("http response error! There is no calories!");
        } else {
          vm.calories = response.calories;
          vm.calories.forEach(function(d) {
            d.calories = +d.calories;
            d.id = +d.id;
            d.user_id = +d.user_id;
            d.time = $moment(d.time, TIME_FORMAT).format(TIME_FORMAT);
          });
          vm.tableParams = new NgTableParams({}, { dataset: vm.calories});
          CheckSetting();
        }
      });
    }
    $scope.showModal = function(data) {
      var modalObj, modalContent;
      modalContent = {
        scope: $scope,
        templateUrl: 'public/views/',
        show: false,
        backdrop: false,
        dateFormat: 'dd/MM/yyyy'
      };
      switch(data.cmd) {
        case 'create':
          modalContent.title = 'Add new calories';
          modalContent.templateUrl += 'addmeal.modal.html';
          break;
        case 'delete':
          modalContent.title = 'Notification!';
          modalContent.templateUrl += 'deletemeal.modal.html';
          vm.selected_calories = data.calories;
          break;
        case 'edit':
          modalContent.title = 'Edit calories';
          modalContent.templateUrl += 'editmeal.modal.html';
          vm.selected_calories = data.calories;
          vm.edit_calories = angular.copy(vm.selected_calories);
          vm.edit_calories.time = $moment(vm.edit_calories.time, TIME_FORMAT).toDate();
      }
      modalObj = $modal(modalContent);
      modalObj.$promise.then(modalObj.show);
    };
    $scope.onUpdateSetting = function() {
      if (vm.flagEdit) {
        usSpinnerService.spin('spinner');
        var user_data = { id : vm.currentUser.id, setting: vm.currentUser.setting };
        RestAPI.UpdateUser(user_data, function(response) {
          SetAlert(response.resultCode === 0 ? 'success' : 'danger', response.message);
          if (!response.resultCode) {
            vm.currentUser.setting = +response.currentUser.setting;
            CheckSetting();
            $cookieStore.put('currentUser', vm.currentUser);
            usSpinnerService.stop('spinner');
          } else {
            vm.oldSetting = vm.currentUser.setting;
            usSpinnerService.stop('spinner');
          }
        }, function(error) {
          console.log('error', error);
        });
      } else {
        vm.oldSetting = vm.currentUser.setting;
      }
    }
    $scope.onCancelSetting = function() {
      vm.flagEdit = false;
      vm.currentUser.setting = vm.oldSetting;
    }
    $scope.onEditMeal = function(calories) {
      calories.date = $moment(calories.date).format(DATE_FORMAT);
      calories.time = $moment(calories.time, TIME_FORMAT).format(TIME_FORMAT);
      usSpinnerService.spin('spinner');
      RestAPI.UpdateCalories(calories, function(response) {
        SetAlert(response.resultCode === 0 ? 'success' : 'danger', response.message);
        if (!response.resultCode) {
          response.calories.time = $moment(response.calories.time, TIME_FORMAT).format(TIME_FORMAT);
          var keys = Object.keys(response.calories);
          keys.forEach(function(key) {
            vm.selected_calories[key] = response.calories[key];
          });
          vm.tableParams.reload();
          CheckSetting();
          usSpinnerService.stop('spinner');
        } else {
          usSpinnerService.stop('spinner');
        }
      });
    }
    $scope.onDeleteCalories = function(calories) {
      usSpinnerService.spin('spinner');
      RestAPI.DeleteCalories(calories.id, function(response) {
        SetAlert(response.resultCode === 0 ? 'success' : 'danger', response.message);
        if (!response.resultCode) {
          vm.calories.splice(vm.calories.indexOf(vm.selected_calories), 1);
          vm.tableParams.reload();
          CheckSetting();
          usSpinnerService.stop('spinner');
        } else {
          usSpinnerService.stop('spinner');
        }
      });
    }
    $scope.onCreateMeal = function(calories) {
      calories.date = $moment(calories.date).format(DATE_FORMAT);
      calories.time = $moment(calories.time, TIME_FORMAT).format(TIME_FORMAT);
      calories.user_id = vm.currentUser.id;
      vm.new_calories = {id: null, date: null, time: null, meal: null, calories: null, user_id: null};
      usSpinnerService.spin('spinner');
      RestAPI.CreateCalories(calories, function(response) {
        SetAlert(response.resultCode === 0 ? 'success' : 'danger', response.message);
        if (!response.resultCode) {
          var new_calories = response.calories;
          new_calories.calories = +new_calories.calories;
          new_calories.id = +new_calories.id;
          new_calories.user_id = +new_calories.user_id;
          new_calories.time = $moment(new_calories.time, TIME_FORMAT).format(TIME_FORMAT);
          vm.calories.unshift(new_calories);
          vm.tableParams.reload();
          CheckSetting();
          usSpinnerService.stop('spinner');
        } else {
          usSpinnerService.stop('spinner');
        }
      });
    }
    function CheckSetting() {
      var checkedDates = [], total_calories = [];
      vm.calories.forEach(function(d, i) {
        var dd = $moment(d.date).format(DATE_FORMAT);
        var index = checkedDates.indexOf(dd);
        if (index === -1) {
          index = checkedDates.push(dd);
          total_calories.push(d.calories);
        } else {
          total_calories[index] += d.calories;
        }
      });
      vm.calories.forEach(function(d, i) {
        var dd = $moment(d.date).format(DATE_FORMAT);
        var index = checkedDates.indexOf(dd);
        d.color = total_calories[index] < vm.currentUser.setting ? 'green' : 'red';
      })
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