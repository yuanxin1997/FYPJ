var app = angular.module('lcafe', ['ionic', 'starter.controllers', 'starter.services', 'ngCordova', 'ion-datetime-picker', 'ion-floating-menu', 'angular-md5', 'ionic.rating', 'jett.ionic.content.banner', 'angularMoment', 'ja.qr', 'star-rating'])
  .config(function($stateProvider, $urlRouterProvider) {
    $stateProvider.state('app', {
      url: '/app',
      abstract: true,
      templateUrl: 'templates/tabs.html',
      cache: false
    });
    $stateProvider.state('app.food', {
      url: '/food',
      views: {
        'tab-home': {
          templateUrl: 'templates/food.html',
          controller: 'homeCtrl',
          cache: false
        }
      }
    });
    $stateProvider.state('app.beverage', {
      url: '/beverage',
      views: {
        'tab-beverage': {
          templateUrl: 'templates/beverage.html',
          controller: 'beverageCtrl',
          cache: false
        }
      }
    });
    $stateProvider.state('app.special', {
      url: '/special',
      views: {
        'tab-special': {
          templateUrl: 'templates/special.html',
          controller: 'specialCtrl',
          cache: false
        }
      }
    });
    $stateProvider.state('app.foodItem', {
      url: '/item/:id',
      views: {
        'tab-home': {
          templateUrl: 'templates/item.html',
          controller: 'itemCtrl',
          cache: false
        }
      }
    });
    $stateProvider.state('app.beverageItem', {
      url: '/item/:id',
      views: {
        'tab-beverage': {
          templateUrl: 'templates/item.html',
          controller: 'itemCtrl',
          cache: false
        }
      }
    });
    $stateProvider.state('app.specialItem', {
      url: '/item/:id',
      views: {
        'tab-special': {
          templateUrl: 'templates/item.html',
          controller: 'itemCtrl',
          cache: false
        }
      }
    });
    $stateProvider.state('top10', {
      url: '/top10',
      abstract: true,
      templateUrl: 'templates/top10Tabs.html',
      cache: false
    });
    $stateProvider.state('top10.food', {
      url: '/top10Food',
      views: {
        'top10Tab-food': {
          templateUrl: 'templates/topFood.html',
          controller: 'topFoodCtrl',
          cache: false
        }
      }
    });
    $stateProvider.state('top10.beverage', {
      url: '/top10Beverage',
      views: {
        'top10Tab-beverage': {
          templateUrl: 'templates/topBeverage.html',
          controller: 'topBeverageCtrl',
          cache: false
        }
      }
    });
    $stateProvider.state('top10.foodItem', {
      url: '/item/:id',
      views: {
        'top10Tab-food': {
          templateUrl: 'templates/item.html',
          controller: 'itemCtrl',
          cache: false
        }
      }
    });
    $stateProvider.state('top10.beverageItem', {
      url: '/item/:id',
      views: {
        'top10Tab-beverage': {
          templateUrl: 'templates/item.html',
          controller: 'itemCtrl',
          cache: false
        }
      }
    });
    $stateProvider.state('item', {
      url: '/item/:id',
      templateUrl: 'templates/item.html',
      controller: 'itemCtrl',
      cache: false
    });
    $stateProvider.state('promotions', {
      url: '/promotions',
      templateUrl: 'templates/promotions.html',
      controller: 'promoCtrl',
      cache: false
    });
    $stateProvider.state('cart', {
      url: '/cart',
      templateUrl: 'templates/cart.html',
      controller: 'cartCtrl',
      cache: false
    });
    $stateProvider.state('history', {
      url: '/history',
      templateUrl: 'templates/history.html',
      controller: 'historyCtrl',
      cache: false
    });
    $stateProvider.state('orderDetails', {
      url: '/order-details/:id',
      templateUrl: 'templates/orderDetails.html',
      controller: 'ordDetailsCtrl',
      cache: false
    });
    $stateProvider.state('aboutUs', {
      url: '/aboutUs',
      templateUrl: 'templates/aboutUs.html',
      controller: 'aboutCtrl',
      cache: false
    });
    $stateProvider.state('contactUs', {
      url: '/contactUs',
      templateUrl: 'templates/contactUs.html',
      controller: 'contactCtrl',
      cache: false
    });
    $stateProvider.state('login', {
      url: '/login',
      templateUrl: 'templates/login.html',
      controller: 'authCtrl',
      cache: false
    });
    $stateProvider.state('resetPassword', {
      url: '/resetPassword',
      templateUrl: 'templates/resetPassword.html',
      controller: 'authCtrl',
      cache: false
    });
    $stateProvider.state('signUp', {
      url: '/signUp',
      templateUrl: 'templates/signUp.html',
      controller: 'authCtrl',
      cache: false
    });
    $stateProvider.state('forgotPassword', {
      url: '/forgotpassword',
      templateUrl: 'templates/forgotPassword.html',
      controller: 'authCtrl',
      cache: false
    });
    $stateProvider.state('feedback', {
      url: '/feedback',
      templateUrl: 'templates/feedback.html',
      controller: 'feedbackCtrl',
      cache: false
    });
    $stateProvider.state('myAccount', {
      url: '/myAccount',
      templateUrl: 'templates/myAccount.html',
      controller: 'myAccountCtrl',
      cache: false
    });
    $stateProvider.state('favourite', {
      url: '/favourite',
      templateUrl: 'templates/favourite.html',
      controller: 'favouriteCtrl',
      cache: false
    });
    $stateProvider.state('dineIn', {
      url: '/dineIn',
      templateUrl: 'templates/dineIn.html',
      controller: 'dineInCtrl',
      cache: false
    });
    $stateProvider.state('preOrder', {
      url: '/preOrder',
      templateUrl: 'templates/preOrder.html',
      controller: 'preOrderCtrl',
      cache: false
    });
    $stateProvider.state('payment', {
      url: '/payment',
      templateUrl: 'templates/payment.html',
      controller: 'paymentCtrl',
      cache: false
    });
    $urlRouterProvider.otherwise('/app/food');
  })
  .config(function($ionicConfigProvider) {
    $ionicConfigProvider.tabs.style('striped');
    $ionicConfigProvider.tabs.position('top');
  })
  .run(function($ionicPlatform, $rootScope, Initialize, Cart) {

    //localStorage.clear();

    if (localStorage.getItem("accessToken") == null) {
      $rootScope.notLoaded = false;
      console.log("Internet Assets is loaded: " + $rootScope.notLoaded);
    }

    // initialize accountId and favourite
    Initialize.init();
    // check token if it is stored in localDB
    Initialize.token();

    // run ionic platform
    $ionicPlatform.ready(function() {
      // check if logged in
      if (localStorage.getItem("accountId") == null || localStorage.getItem("accountId") == '') {
        $rootScope.menuState = "notlogin"
      } else {
        $rootScope.menuState = "login"
        Cart.setCustId(localStorage.getItem("accountId"));
      }
      if (window.cordova && window.cordova.plugins.Keyboard) {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        // Don't remove this line unless you know what you are doing. It stops the viewport
        // from snapping when text inputs are focused. Ionic handles this internally for
        // a much nicer keyboard experience.
        cordova.plugins.Keyboard.disableScroll(true);
      }
      if (window.cordova && window.cordova.InAppBrowser) {
        window.open = window.cordova.InAppBrowser.open;
      }
      if (window.StatusBar) {
        StatusBar.styleDefault();
      }
    });

  });
