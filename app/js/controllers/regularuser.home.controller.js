(function() {
  'use strict';

  angular
    .module('calories')
    .controller('RegularUserHomeController', RegularUserHomeController);

  RegularUserHomeController.$inject = ['$rootScope', '$scope', '$http', 'NgTableParams', '$cookieStore', '$moment', '$modal', 'API_URL', '$alert', 'DATE_FORMAT', 'TIME_FORMAT'];

  function RegularUserHomeController($rootScope, $scope, $http, NgTableParams, $cookieStore, $moment, $modal, API_URL, $alert, DATE_FORMAT, TIME_FORMAT) {
    var self = this;
    // Pre-fetch an external template populated with a custom scope
    $scope.new_calories = {id: null, date: null, time: null, meal: null, calories: null, user_id: null};
    var modalCreateMeal = $modal({
      scope: $scope,
      title: "Add a new meal",
      templateUrl: 'public/views/addmeal.modal.html',
      show: false
    });
    var modalDeleteMeal = $modal({
      title: "Notification!",
      content: "Would you delete this meal?",
      show: false
    });
    // Show when some event occurs (use $promise property to ensure the template has been loaded)
    $scope.showModal = function() {
      modalCreateMeal.$promise.then(modalCreateMeal.show);
    };
    $scope.onUpdateSetting = function() {
      if ($scope.flagEdit) {
        var data = JSON.stringify({
          user_id: $rootScope.globals.currentUser.id,
          setting: $scope.currentUser.setting,
          cmd    : 'update_user'
        });
        $http({
          method: 'POST',
          url: API_URL,
          data: data
        }).success(function(response) {
          if (angular.isUndefined(response.resultCode) || response.resultCode === null) console.log("server error!");
          if (response.resultCode) {
            var alert = $alert({
              title: 'Hello!',
              content: 'Updated your setting!',
              container: '#alerts-container',
              type:'success',
              placement: 'top',
              show: true,
              duration: 1,
              animation: 'am-fade-and-slide-top'
            });
          } else {
            var alert = $alert({
              type:'danger',
              title: 'Hello!',
              content: 'failed updating user setting!',
              container: '#alerts-container',
              placement: 'top',
              show: true,
              duration: 1,
              animation: 'am-fade-and-slide-top'
            });
            $scope.currentUser.setting = $scope.oldSetting;
          }
        }).error(function(error) {
          var alert = $alert({
            type:'danger',
            title: 'Hello!',
            content: 'failed updating user setting!',
            container: '#alerts-container',
            placement: 'top',
            show: true,
            duration: 1,
            animation: 'am-fade-and-slide-top'
          });
          $scope.currentUser.setting = $scope.oldSetting;
        });
      } else {
        $scope.oldSetting = $scope.currentUser.setting;
      }
    }
    $scope.onCancelSetting = function() {
      $scope.flagEdit = false;
      $scope.currentUser.setting = $scope.oldSetting;
    }
    $scope.onEditMeal = function(id) {
      console.log("edit : " + id);
    }
    $scope.onDeleteMeal = function(id) {
      modalDeleteMeal.$promise.then(modalDeleteMeal.show);
    }
    $scope.onCreateMeal = function() {
      $scope.new_calories.user_id = $rootScope.globals.currentUser.id;
      var data = JSON.stringify({
        user_id : $scope.new_calories.user_id,
        date: $moment($scope.new_calories.date).format(DATE_FORMAT),
        time: $moment($scope.new_calories.time).format(TIME_FORMAT),
        meal: $scope.new_calories.meal,
        calories: $scope.new_calories.calories,
        cmd   : 'add_calories'
      });
      $http({
        method: 'POST',
        url: API_URL,
        data: data
      }).success(function(response) {
        if (angular.isUndefined(response.resultCode) || response.resultCode === null) {
          var alert = $alert({
            title: 'Hello!',
            content: 'server error!',
            container: '#alerts-container',
            type:'danger',
            placement: 'top',
            show: true,
            duration: 1,
            animation: 'am-fade-and-slide-top'
          });
        } else {
          if (response.resultCode) {
            var alert = $alert({
              title: 'Hello!',
              content: 'Created a new meal(' + $scope.new_calories.meal + ')!',
              container: '#alerts-container',
              type:'success',
              placement: 'top',
              show: true,
              duration: 1,
              animation: 'am-fade-and-slide-top'
            });
            $scope.new_calories.id = response.calories_id;
            $scope.new_calories.date = $moment($scope.new_calories.date).format(DATE_FORMAT);
            $scope.new_calories.time = $moment($scope.new_calories.time).format(TIME_FORMAT);
            $rootScope.globals.caloriesList.unshift($scope.new_calories);
            $cookieStore.put('globals', $rootScope.globals);
            self.tableParams = new NgTableParams({}, { dataset: $rootScope.globals.caloriesList});
            $scope.new_calories = {id: null, date: null, time: null, meal: null, calories: null, user_id: null};
          } else {
            var alert = $alert({
              type:'danger',
              title: 'Hello!',
              content: 'failed creating a new meal!',
              container: '#alerts-container',
              placement: 'top',
              show: true,
              duration: 1,
              animation: 'am-fade-and-slide-top'
            });
          }
        }
      }).error(function(error) {
        var alert = $alert({
          type:'danger',
          title: 'Hello!',
          content: 'failed creating a new meal!',
          container: '#alerts-container',
          placement: 'top',
          show: true,
          duration: 1,
          animation: 'am-fade-and-slide-top'
        });
      });
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