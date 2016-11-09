(function() {
  'use strict';

  angular
    .module('calories')
    .controller('RegularUserHomeController', RegularUserHomeController);

  RegularUserHomeController.$inject = ['$rootScope', '$scope', '$http', 'NgTableParams', '$cookieStore', '$moment', '$modal'];

  function RegularUserHomeController($rootScope, $scope, $http, NgTableParams, $cookieStore, $moment, $modal) {
    var self = this;
    var startDateTime = new Date('2015-01-25 03:00:00'),
        endDateTime   = new Date('2015-08-20 15:00:00');
    // Pre-fetch an external template populated with a custom scope
    var myOtherModal = $modal({scope: $scope, title: "Add a new meal", templateUrl: 'public/views/addmeal.modal.html', show: false});
    // Show when some event occurs (use $promise property to ensure the template has been loaded)
    $scope.showModal = function() {
      myOtherModal.$promise.then(myOtherModal.show);
    };
    $scope.onUpdateSetting = function() {
      if ($scope.flagEdit) {
        //$http
        //error : $scope.oldSetting = angular.copy($scope.currentUser.setting);
      } else {
        $scope.oldSetting = $scope.currentUser.setting;
        console.log($scope.oldSetting);
      }
    }
    $scope.onCancelSetting = function() {
      $scope.flagEdit = false;
      $scope.currentUser.setting = $scope.oldSetting;
    }
    $scope.onFilter = function() {
      console.log("filter");
    }
    $scope.onEditMeal = function(id) {
      console.log("edit : " + id);
    }
    $scope.onDeleteMeal = function(id) {
      console.log("delete : " + id);
    }
    $scope.onAddMeal = function() {
      console.log("add a new meal");
    }
    function initController() {
      $scope.filterData = {
        date: {
          startDate: null,
          endDate: null
        },
        time: {
          startTime: null,
          endTime: null
        }
      };
      $scope.currentUser = $rootScope.globals.currentUser;
      $scope.oldSetting = $scope.currentUser.setting;
      var caloriesList = $rootScope.globals.caloriesList;
      self.tableParams = new NgTableParams({}, { dataset: caloriesList});
    }

    initController();

    
  }
})();