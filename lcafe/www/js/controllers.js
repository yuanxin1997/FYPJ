angular.module('starter.controllers', [])
  .constant('salt', 'bfawuiobwfb79237bf2628vf763vf32if732vfb937bvf89g7ase89vf2378vf812v783g92g793')

  .controller('authCtrl', function($scope, $ionicHistory, Account, $rootScope, $state, $ionicPopup, md5, salt, Cart, $ionicModal, Connection) {

    $scope.Account = {};
    $scope.dataSend = {};
    $scope.dataSend2 = {};

    function popupLoginFail() {
      $ionicPopup.alert({
        title: 'Login Fail',
        subTitle: 'Invalid email or password.',
        okType: 'button-royal'
      }).then(function(res) {
        console.log("Login Fail");
      });
    }

    function popupEmailTaken() {
      $ionicPopup.alert({
        title: 'Sign Up Fail',
        subTitle: 'This is email is already taken!',
        okType: 'button-royal'
      }).then(function(res) {
        console.log('Sign Up Fail');
      });
    }

    function popupSuccessSignUp() {
      $ionicPopup.alert({
        title: 'Sign Up Successsful',
        subTitle: 'Please verify your email before logging in.',
        okType: 'button-royal'
      }).then(function(res) {
        $state.go('login');
        console.log('Sign Up Successful');
      });
    }

    function popupEmailNotFound() {
      $ionicPopup.alert({
        title: 'Email Not Found',
        subTitle: 'This email does not exists in our record.',
        okType: 'button-royal'
      }).then(function(res) {
        console.log('Eamil Not Found');
      });
    }

    function popupSuccessRequest() {
      $ionicPopup.alert({
        title: 'Request Successful',
        subTitle: 'The link will be sent to you in a short while.',
        okType: 'button-royal'
      }).then(function(res) {
        $ionicHistory.goBack();
        console.log('Request Successful');
      });
    }

    function popupSuccessReset() {
      $ionicPopup.alert({
        title: 'Password Reset Successsful',
        subTitle: 'Your password has been reset.',
        okType: 'button-royal'
      }).then(function(res) {
        if ($rootScope.payment != 'true') {
          $state.go('app.food');
        } else {
          $state.go('payment');
        }
        console.log('Password Reset Successful');
      });
    }

    $scope.createAcc = function(acc, form) {
      var haveInternet = Connection.checkInternetWithPopup();
      if (haveInternet) {
        $scope.dataSend.fullname = $scope.Account.fullname;
        $scope.dataSend.email = $scope.Account.email;
        $scope.dataSend.phoneNumber = $scope.Account.phoneNumber;
        $scope.dataSend.password = md5.createHash($scope.Account.password + salt);
        $scope.dataSend.token = localStorage.getItem("accessToken");
        Account.checkDuplicateEmail(acc.email).then(function(res) {
          if (res.message != 'unsuccessful') {
            Account.create($scope.dataSend).then(function(res) {
              Account.getByEmail(acc.email).then(function(newAccount) {
                console.log(newAccount);
                Account.sendVerification(newAccount).then(function(response) {
                  console.log(response);
                  if (form) {
                    $scope.Account = {};
                    form.$setPristine();
                    form.$setUntouched();
                  }
                  popupSuccessSignUp();
                })
              })
            });
          } else {
            popupEmailTaken();
          }
        });
      }
    };

    $scope.login = function(l, form) {
      var haveInternet = Connection.checkInternetWithPopup();
      if (haveInternet) {
        var passwordHash = md5.createHash(l.password + salt);
        Account.checkTempPassword(l.email).then(function(res) {
          console.log(res.message);
          if (res.message != 'exist') {
            Account.login(l.email, passwordHash).then(function(res) {
              if (res.message != 'unsuccessful') {
                var id = res.message;
                localStorage.setItem("accountId", id);
                Cart.setCustId(id);
                $rootScope.menuState = "login";
                console.log("Your id: " + localStorage.getItem("accountId"));
                Account.get(localStorage.getItem('accountId')).then(function(response) {
                  localStorage.setItem("favouriteItemsID", response.favouriteItemsID);
                });
                if ($rootScope.payment != 'true') {
                  $state.go('app.food');
                } else {
                  $state.go('payment');
                }
              } else {
                popupLoginFail();
              }
            });
          } else {
            Account.loginWithTempPassword(l.email, l.password).then(function(res) {
              console.log(res.message);
              if (res.message != 'unsuccessful') {
                var id = res.message;
                localStorage.setItem("accountId", id);
                Cart.setCustId(id);
                $rootScope.menuState = "login";
                console.log("Your id: " + localStorage.getItem("accountId"));
                Account.get(localStorage.getItem('accountId')).then(function(response) {
                  localStorage.setItem("favouriteItemsID", response.favouriteItemsID);
                });
                $state.go('resetPassword');
              } else {
                popupLoginFail();
              }
            });
          }
        });
      }
    };

    $scope.requestLink = function(req, form) {
      var haveInternet = Connection.checkInternetWithPopup();
      if (haveInternet) {
        Account.checkEmail(req.email).then(function(res) {
          if (res.message != 'unsuccessful') {
            Account.sendRecoverLink(res).then(function(response) {
              console.log(response);
              if (form) {
                $scope.Account = {};
                form.$setPristine();
                form.$setUntouched();
              }
              popupSuccessRequest();
            });
          } else {
            popupEmailNotFound();
          }
        });
      }
    };

    $scope.changePassword = function(Password, form) {
      var haveInternet = Connection.checkInternetWithPopup();
      if (haveInternet) {
        $scope.dataSend2.custID = localStorage.getItem("accountId");
        $scope.dataSend2.custPassword = md5.createHash(Password.new + salt);
        $scope.dataSend2.token = localStorage.getItem("accessToken");
        Account.changePassword($scope.dataSend2).then(function(response) {
          if (form) {
            $scope.Password = {};
            form.$setPristine();
            form.$setUntouched();
          }
          popupSuccessReset();
        });
      }
    };

  })

  .controller('homeCtrl', function($scope, $state, Menu, Cart, $rootScope, $ionicSideMenuDelegate, $ionicModal, $rootScope, $filter, $cordovaNetwork, $ionicPlatform, $ionicPopup, $timeout) {

    document.addEventListener("deviceready", function() {

      // listen for Online event
      $rootScope.$on('$cordovaNetwork:online', function(event, networkState) {
        if ($rootScope.internetConnected == true) return;
        $rootScope.internetConnected = true;
        if (localStorage.getItem("accessToken") == null) {
          $rootScope.notLoaded = true;
        }
        console.log("internetConnected: " + $rootScope.internetConnected);
      });

      // listen for Offline event
      $rootScope.$on('$cordovaNetwork:offline', function(event, networkState) {
        if ($rootScope.internetConnected == false) return;
        $rootScope.internetConnected = false;
        console.log("internetConnected: " + $rootScope.internetConnected);
      });

    }, false);

    $scope.noInternet = false;
    $scope.cart = Cart.getOnly();
    $scope.sort = {
      value: 'itemSubCategory'
    };
    var tempArr = [];
    var uniqueArr = [];
    var checked = [];
    $scope.filterItems = [];
    $scope.selected = [];
    $scope.default = [];

    Array.prototype.contains = function(v) {
      for (var i = 0; i < this.length; i++) {
        if (this[i] === v) return true;
      }
      return false;
    };

    Array.prototype.unique = function() {
      var arr = [];
      for (var i = 0; i < this.length; i++) {
        if (!arr.contains(this[i])) {
          arr.push(this[i]);
        }
      }
      return arr;
    };

    function getData() {
      Menu.getFood().then(function(menu) {
        if (menu != "noInternet") {
          $scope.noInternet = false;
          $scope.foodMenu = menu;
          for (var i = 0; i < menu.length; i++) {
            tempArr.push(menu[i].itemSubCategory);
          }
          uniqueArr = tempArr.unique();
          for (var j = 0; j < uniqueArr.length; j++) {
            var obj = {};
            obj.text = uniqueArr[j];
            obj.checked = true;
            $scope.filterItems.push(obj);
            $scope.selected.push(uniqueArr[j]);
            $scope.default.push(uniqueArr[j]);
          }
        } else {
          $scope.noInternet = true;
        }
      });
    }

    $rootScope.$on('initializeComplete', function(event, data) {
      if (!$rootScope.initializing) {
        getData();
      }
      $rootScope.initializing = false;
    });

    if (!$rootScope.initializing) {
      getData();
    }

    $scope.reconnect = function() {
      getData();
    };

    $scope.customFilter = function(item) {
      return ($scope.selected.indexOf(item.itemSubCategory) !== -1);
    };

    $scope.changeItem = function(item) {
      var enableditem = $filter('filter')($scope.filterItems, {
        checked: true
      });
      $scope.checkedArr = [];
      angular.forEach(enableditem, function(item) {
        $scope.checkedArr.push(item.text);
      });
      checked = $scope.checkedArr;
      console.log(checked);
    };

    $rootScope.logout = function() {
      localStorage.setItem('accountId', '');
      localStorage.setItem('favouriteItemsID', '');
      localStorage.removeItem('Cache::account');
      localStorage.removeItem('Cache::history');
      localStorage.removeItem('Cache::favourite');
      Cart.setCustId('');
      $rootScope.menuState = "notlogin";
      delete
      console.log("Your id: " + localStorage.getItem("accountId"));
      $ionicSideMenuDelegate.toggleLeft();
    };

    // =========================================================================Sorting Modal=========================================================================

    $scope.openSortModal = function() {
      $ionicModal.fromTemplateUrl('templates/sort.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.sortModal = modal;
        $scope.sortBy = angular.copy($scope.sort);
        $scope.sortModal.show();
      });
    };

    $scope.closeSortModal = function() {
      console.log($scope.sortBy);
      $scope.sort = angular.copy($scope.sortBy);
      $scope.sortModal.remove();
    };

    $scope.$on('$destroy', function() {
      // Execute action
    });

    $scope.$on('modal.hidden', function() {
      // Execute action
    });

    $scope.$on('modal.removed', function() {
      // Execute action
    });

    // =========================================================================Filter Modal=========================================================================

    $scope.openFilterModal = function() {
      $ionicModal.fromTemplateUrl('templates/filter.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.filterModal = modal;
        $scope.filterModal.show();
      });
    };

    $scope.closeFilterModal = function() {
      if (checked.length > 0) {
        $scope.selected = checked;
      } else {
        $scope.selected = $scope.default;
      }
      console.log(checked);
      $scope.filterModal.remove();
    };

    $scope.$on('$destroy', function() {
      // Execute action
    });

    $scope.$on('modal.hidden', function() {
      // Execute action
    });

    $scope.$on('modal.removed', function() {
      // Execute action
    });

    // =========================================================================Floating action button================================================================

    $scope.$on('floating-menu:open', function() {
      console.log("open");
    });

    $scope.$on('floating-menu:close', function() {
      console.log("close");
    });

  })

  .controller('beverageCtrl', function($scope, $state, Menu, $rootScope, $ionicModal, $filter) {

    $scope.noInternet = false;
    $scope.sort = {
      value: 'itemSubCategory'
    };
    var tempArr = [];
    var uniqueArr = [];
    var checked = [];
    $scope.filterItems = [];
    $scope.selected = [];
    $scope.default = [];

    Array.prototype.contains = function(v) {
      for (var i = 0; i < this.length; i++) {
        if (this[i] === v) return true;
      }
      return false;
    };

    Array.prototype.unique = function() {
      var arr = [];
      for (var i = 0; i < this.length; i++) {
        if (!arr.contains(this[i])) {
          arr.push(this[i]);
        }
      }
      return arr;
    };

    function getData() {
      Menu.getBeverage().then(function(menu) {
        if (menu != "noInternet") {
          $scope.noInternet = false;
          $scope.drinkMenu = menu;
          for (var i = 0; i < menu.length; i++) {
            tempArr.push(menu[i].itemSubCategory);
          }
          uniqueArr = tempArr.unique();
          for (var j = 0; j < uniqueArr.length; j++) {
            var obj = {};
            obj.text = uniqueArr[j];
            obj.checked = true;
            $scope.filterItems.push(obj);
            $scope.selected.push(uniqueArr[j]);
            $scope.default.push(uniqueArr[j]);
          }
        } else {
          $scope.noInternet = true;
        }
      });
    }

    getData();

    $scope.reconnect = function() {
      getData();
    };

    $scope.customFilter = function(item) {
      return ($scope.selected.indexOf(item.itemSubCategory) !== -1);
    };

    $scope.changeItem = function(item) {
      var enableditem = $filter('filter')($scope.filterItems, {
        checked: true
      });
      $scope.checkedArr = [];
      angular.forEach(enableditem, function(item) {
        $scope.checkedArr.push(item.text);
      });
      checked = $scope.checkedArr;
      console.log(checked);
    };

    // =========================================================================Sorting Modal=========================================================================

    $scope.openSortModal = function() {
      $ionicModal.fromTemplateUrl('templates/sort.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.sortModal = modal;
        $scope.sortBy = angular.copy($scope.sort);
        $scope.sortModal.show();
      });
    };

    $scope.closeSortModal = function() {
      console.log($scope.sortBy);
      $scope.sort = angular.copy($scope.sortBy);
      $scope.sortModal.remove();
    };

    $scope.$on('$destroy', function() {
      // Execute action
    });

    $scope.$on('modal.hidden', function() {
      // Execute action
    });

    $scope.$on('modal.removed', function() {
      // Execute action
    });

    // =========================================================================Filter Modal=========================================================================

    $scope.openFilterModal = function() {
      $ionicModal.fromTemplateUrl('templates/filter.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.filterModal = modal;
        $scope.filterModal.show();
      });
    };

    $scope.closeFilterModal = function() {
      if (checked.length > 0) {
        $scope.selected = checked;
      } else {
        $scope.selected = $scope.default;
      }
      console.log(checked);
      $scope.filterModal.remove();
    };

    $scope.$on('$destroy', function() {
      // Execute action
    });

    $scope.$on('modal.hidden', function() {
      // Execute action
    });

    $scope.$on('modal.removed', function() {
      // Execute action
    });

    // =========================================================================Floating action button================================================================

    $scope.$on('floating-menu:open', function() {
      console.log("open");
    });

    $scope.$on('floating-menu:close', function() {
      console.log("close");
    });

  })

  .controller('specialCtrl', function($scope, $state, Menu, $rootScope, $ionicModal, $timeout, $filter) {

    $scope.noInternet = false;
    $scope.sort = {
      value: 'itemSubCategory'
    };
    var tempArr = [];
    var uniqueArr = [];
    var checked = [];
    $scope.filterItems = [];
    $scope.selected = [];
    $scope.default = [];

    Array.prototype.contains = function(v) {
      for (var i = 0; i < this.length; i++) {
        if (this[i] === v) return true;
      }
      return false;
    };

    Array.prototype.unique = function() {
      var arr = [];
      for (var i = 0; i < this.length; i++) {
        if (!arr.contains(this[i])) {
          arr.push(this[i]);
        }
      }
      return arr;
    };

    function getData() {
      Menu.getSpecial().then(function(menu) {
        if (menu != "noInternet") {
          $scope.noInternet = false;
          $scope.specialMenu = menu;
          for (var i = 0; i < menu.length; i++) {
            tempArr.push(menu[i].itemSubCategory);
          }
          uniqueArr = tempArr.unique();
          for (var j = 0; j < uniqueArr.length; j++) {
            var obj = {};
            obj.text = uniqueArr[j];
            obj.checked = true;
            $scope.filterItems.push(obj);
            $scope.selected.push(uniqueArr[j]);
            $scope.default.push(uniqueArr[j]);
          }
        } else {
          $scope.noInternet = true;
        }
      });
    }

    getData();

    $scope.reconnect = function() {
      getData();
    };

    $scope.customFilter = function(item) {
      return ($scope.selected.indexOf(item.itemSubCategory) !== -1);
    };

    $scope.changeItem = function(item) {
      var enableditem = $filter('filter')($scope.filterItems, {
        checked: true
      });
      $scope.checkedArr = [];
      angular.forEach(enableditem, function(item) {
        $scope.checkedArr.push(item.text);
      });
      checked = $scope.checkedArr;
      console.log(checked);
    };

    $scope.checkLabel = function(label) {
      if (label == "Special") {
        return "ribbonRed";
      } else if (label == "New") {
        return "ribbonGreen";
      }
    }

    // =========================================================================Sorting Modal=========================================================================

    $scope.openSortModal = function() {
      $ionicModal.fromTemplateUrl('templates/sort.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.sortModal = modal;
        $scope.sortBy = angular.copy($scope.sort);
        $scope.sortModal.show();
      });
    };

    $scope.closeSortModal = function() {
      console.log($scope.sortBy);
      $scope.sort = angular.copy($scope.sortBy);
      $scope.sortModal.remove();
    };

    $scope.$on('$destroy', function() {
      // Execute action
    });

    $scope.$on('modal.hidden', function() {
      // Execute action
    });

    $scope.$on('modal.removed', function() {
      // Execute action
    });

    // =========================================================================Filter Modal=========================================================================

    $scope.openFilterModal = function() {
      $ionicModal.fromTemplateUrl('templates/filter.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.filterModal = modal;
        $scope.filterModal.show();
      });
    };

    $scope.closeFilterModal = function() {
      if (checked.length > 0) {
        $scope.selected = checked;
      } else {
        $scope.selected = $scope.default;
      }
      console.log(checked);
      $scope.filterModal.remove();
    };

    $scope.$on('$destroy', function() {
      // Execute action
    });

    $scope.$on('modal.hidden', function() {
      // Execute action
    });

    $scope.$on('modal.removed', function() {
      // Execute action
    });

    // =========================================================================Floating action button================================================================

    $scope.$on('floating-menu:open', function() {
      console.log("open");
    });

    $scope.$on('floating-menu:close', function() {
      console.log("close");
    });

  })

  .controller('itemCtrl', function($scope, $state, Items, Cart, $stateParams, $ionicPopup, $timeout, $ionicHistory, Favourite, $rootScope, $filter, Connection) {

    $scope.noInternet = false;
    var id = $stateParams.id;
    console.log($stateParams.itemName);
    $scope.itemName = ($stateParams.itemName);
    var itemToCart;
    var quantitySelected;
    $scope.itemRequests = [];
    var checked = [];
    $scope.dataSend = {};
    $scope.item = {};
    $scope.input = {};

    function checkFav(id) {
      var FavItems = localStorage.getItem("favouriteItemsID").split(',');
      for (var i = 0; i < FavItems.length; i++) {
        if (FavItems[i] == id) {
          $scope.isFavourite = true;
          break;
        } else {
          $scope.isFavourite = false;
        }
      }
    }

    function showUpdatedAlert() {
      $ionicPopup.alert({
        title: 'Item Updated',
        template: 'You have updated this item.',
        buttons: [{
          text: 'Ok',
          type: 'button-royal'
        }]
      }).then(function(res) {
        $ionicHistory.goBack();
        console.log("Item Updated");
      });
    }

    function showDuplicateAlert(itemToCart) {
      $ionicPopup.confirm({
        title: 'You have already added this item',
        template: 'Do you want to wish to update the item?',
        cancelText: 'No',
        okText: 'Yes',
        okType: 'button-royal'
      }).then(function(res) {
        if (res) {
          Cart.remove(itemToCart.itemID);
          Cart.add(itemToCart);
          showUpdatedAlert();
          console.log("Yes");
        } else {
          $ionicHistory.goBack();
          console.log("No");
        }
      });
    }

    function showSeparatePackaging() {
      $ionicPopup.confirm({
        title: 'Separate Packaging',
        template: 'You have added more than one item, do you want to package separately?',
        cancelText: 'No',
        okText: 'Yes',
        okType: 'button-royal'
      }).then(function(res) {
        if (res) {
          $scope.input.separatePackaging = "Yes";
        } else {
          $scope.input.separatePackaging = "No";
        }
      });
    }

    function showAddedAlert() {
      $ionicPopup.alert({
        title: 'Success',
        template: 'Item successfully added to cart.',
        buttons: [{
          text: 'Ok',
          type: 'button-royal'
        }]
      }).then(function(res) {
        console.log('Added');
        // window.history.back();
        $ionicHistory.goBack();
      });
    }

    function getData() {
      var haveInternet = Connection.checkInternet();
      if (haveInternet) {
        $scope.noInternet = false;
        Items.getItem(id).then(function(response) {
          console.log("Item id: " + id);
          var allItemRequests = response.itemRequest.split(';');
          $scope.chkItemRequest = allItemRequests[0];
          for (var i = 0; i < allItemRequests.length - 1; i++) {
            var obj = {};
            obj.text = allItemRequests[i];
            obj.checked = false;
            $scope.itemRequests.push(obj);
          }
          itemToCart = angular.copy(response);
          $scope.item = response;
          checkFav(id);
          if (itemToCart.itemQty == 0 || itemToCart.itemStatus == 'Unavailable') {
            quantitySelected = 0;
          } else {
            quantitySelected = 1;
          }
        }).then(function(response) {
          $scope.input.quantity = quantitySelected;
          $scope.input.separatePackaging = "";
        });
      } else {
        $scope.noInternet = true;
      }
    }

    getData();

    $scope.reconnect = function() {
      getData();
    };

    $scope.changeItem = function(item) {
      for (var i = 0; i < $scope.itemRequests.length; i++) {
        if (item.text != $scope.itemRequests[i].text) {
          $scope.itemRequests[i].checked = false;
        }
      }
      var enableditem = $filter('filter')($scope.itemRequests, {
        checked: true
      });
      $scope.checkedArr = [];
      angular.forEach(enableditem, function(item) {
        $scope.checkedArr.push(item.text);
      });
      checked = $scope.checkedArr;
      if (checked[0] != undefined) {
        console.log(checked[0]);
      }
    };

    $scope.plusQty = function(item) {
      var haveInternet = Connection.checkInternetWithPopup();
      if (haveInternet) {
        console.log("+");
        quantitySelected++;
        $scope.input.quantity = quantitySelected;
        if ($scope.input.separatePackaging == "") {
          showSeparatePackaging();
        }
      }
    };

    $scope.minusQty = function(item) {
      var haveInternet = Connection.checkInternetWithPopup();
      if (haveInternet) {
        console.log("-");
        if ($scope.input.quantity == 2) {
          $scope.input.separatePackaging = "";
        }
        if ($scope.input.quantity > 1) {
          quantitySelected--;
          $scope.input.quantity = quantitySelected;
        }
      }
    };

    $scope.addCart = function() {
      var haveInternet = Connection.checkInternetWithPopup();
      if (haveInternet) {
        itemToCart.quantity = $scope.input.quantity;
        itemToCart.separatePackaging = $scope.input.separatePackaging;
        if (checked[0] != undefined) {
          itemToCart.itemRequest = checked[0];
        } else {
          itemToCart.itemRequest = "None";
        }
        if (Cart.isDuplicate(itemToCart.itemID)) {
          showDuplicateAlert(itemToCart);
        } else {
          Cart.add(itemToCart);
          console.log("Before item: " + JSON.stringify($scope.item));
          console.log("After item: " + JSON.stringify(itemToCart));
          showAddedAlert();
        }
      }
    };

    $scope.setFavTrue = function(itemId) {
      var haveInternet = Connection.checkInternetWithPopup();
      if (haveInternet) {
        $scope.isFavourite = true;
        var FavItems = localStorage.getItem("favouriteItemsID");
        var updateFav = FavItems.concat(itemId + ',');
        localStorage.setItem("favouriteItemsID", updateFav);
        console.log(localStorage.getItem("favouriteItemsID"));
        console.log('set to true');
      }
    };

    $scope.setFavFalse = function(itemId) {
      var haveInternet = Connection.checkInternetWithPopup();
      if (haveInternet) {
        $scope.isFavourite = false;
        var FavItems = localStorage.getItem("favouriteItemsID").split(/(,)/);
        for (var i = 0; i < FavItems.length; i = i + 2) {
          if (FavItems[i] == itemId) {
            FavItems.splice(i, 2);
            break;
          }
        }
        localStorage.setItem("favouriteItemsID", FavItems.join(""));
        console.log(localStorage.getItem("favouriteItemsID"));
        console.log('set to false');
      }
    };

    $scope.$on('$ionicView.leave', function() {
      var haveInternet = Connection.checkInternet();
      if (haveInternet) {
        if ($rootScope.menuState == 'login') {
          $scope.dataSend.custID = localStorage.getItem("accountId");
          $scope.dataSend.favouriteItemsID = localStorage.getItem("favouriteItemsID");
          $scope.dataSend.token = localStorage.getItem("accessToken");
          Favourite.updateFavourites($scope.dataSend).then(function(response) {
            console.log(response);
          });
        }
      }
    });

  })

  .controller('feedbackCtrl', function($scope, Feedback, $state, $ionicPopup, $ionicModal, Connection) {

    $scope.fb = {
      name: '',
      email: '',
      comment: ''
    };
    $scope.fb.foodVarietyOrSelection = 0;
    $scope.fb.foodPrice = 0;
    $scope.fb.foodQuality = 0;
    $scope.fb.beverageVarietyOrSelection = 0;
    $scope.fb.beveragePrice = 0;
    $scope.fb.beverageQuality = 0;
    $scope.fb.serviceCleanliness = 0;
    $scope.fb.servicePoliteness = 0;
    $scope.fb.serviceSpeed = 0;

    function popupSuccessFeedback() {
      $ionicPopup.alert({
        title: 'Thank you for your feedback',
        subTitle: 'Your feedback has been submitted successfully.',
        okType: 'button-royal'
      }).then(function(res) {
        $state.go('app.food');
        console.log("Submitted");
      });
    }

    function popupFieldRequired() {
      $ionicPopup.alert({
        title: 'Rating fields are required',
        subTitle: 'Please check and give rating to all fields!',
        okType: 'button-royal'
      }).then(function(res) {
        console.log("Submitted");
      });
    }

    function showPromptForUserRole() {
      $ionicPopup.confirm({
        title: 'Are you from NYP(Staff/Student) or a Guest?',
        cssClass: 'feedbackCustomPopup',
        buttons: [{
            text: 'Guest',
            type: 'positive',
            onTap: function(e) {
              return "Guest";
            }
          },
          {
            text: 'Staff',
            type: 'positive',
            onTap: function(e) {
              return "Staff";
            }
          },
          {
            text: 'Student',
            type: 'positive',
            onTap: function(e) {
              return "Student";
            }
          }
        ]
      }).then(function(res) {
        if (res) {
          $scope.fb.role = res;
          console.log(res);
        }
        $scope.fb.token = localStorage.getItem("accessToken");
        console.log($scope.fb);
        Feedback.create($scope.fb).then(function() {
          $scope.fb = {};
          popupSuccessFeedback();
        });
      });
    }

    $scope.onRatingChange = function($event, variable) {
      switch (variable) {
        case 'foodVarietyOrSelection':
          $scope.fb.foodVarietyOrSelection = $event.rating;
          break;
        case 'foodPrice':
          $scope.fb.foodPrice = $event.rating;
          break;
        case 'foodQuality':
          $scope.fb.foodQuality = $event.rating;
          break;
        case 'beverageVarietyOrSelection':
          $scope.fb.beverageVarietyOrSelection = $event.rating;
          break;
        case 'beveragePrice':
          $scope.fb.beveragePrice = $event.rating;;
          break;
        case 'beverageQuality':
          $scope.fb.beverageQuality = $event.rating;
          break;
        case 'serviceCleanliness':
          $scope.fb.serviceCleanliness = $event.rating;
          break;
        case 'servicePoliteness':
          $scope.fb.servicePoliteness = $event.rating;
          break;
        case 'serviceSpeed':
          $scope.fb.serviceSpeed = $event.rating;
          break;
        default:
          console.log("No updates");
      }
      console.log($scope.fb);
    };

    $scope.sendFeedback = function(form) {
      var haveInternet = Connection.checkInternetWithPopup();
      if (haveInternet) {
        if ($scope.fb.foodVarietyOrSelection == 0 || $scope.fb.foodPrice == 0 || $scope.fb.foodQuality == 0 ||
          $scope.fb.beverageVarietyOrSelection == 0 || $scope.fb.beveragePrice == 0 || $scope.fb.beverageQuality == 0 ||
          $scope.fb.serviceCleanliness == 0 || $scope.fb.servicePoliteness == 0 || $scope.fb.serviceSpeed == 0) {
          popupFieldRequired();
        } else {
          showPromptForUserRole();
        }
        if (form) {
          form.$setPristine();
          form.$setUntouched();
        }
      }
    };

  })

  .controller('cartCtrl', function($scope, $rootScope, $state, $ionicPopup, Cart, Promotions, $ionicContentBanner, $timeout, $ionicSideMenuDelegate, $ionicModal, $ionicSlideBoxDelegate, Connection) {

    $scope.noInternet = false;
    var contentBannerInstance;

    function popupOrdTypePrompt() {
      $ionicPopup.show({
        title: 'Confirmation',
        subTitle: 'Do you want to dine-in or pre-order?',
        scope: $scope,
        buttons: [{
            text: 'Dine-in',
            type: 'button-royal',
            onTap: function(e) {
              $rootScope.ordType = "dine-in";
              $state.go('dineIn');
            }
          },
          {
            text: 'Pre-order',
            type: 'button-royal',
            onTap: function(e) {
              $rootScope.ordType = "pre-order";
              $state.go('preOrder');
            }
          }
        ]
      });
    }

    function showSeparatePackaging(item) {
      $ionicPopup.confirm({
        title: 'Separate Packaging',
        template: 'You have added more than one item, do you want to package separately?',
        cancelText: 'No',
        okText: 'Yes',
        okType: 'button-royal'
      }).then(function(res) {
        if (res) {
          item.separatePackaging = "Yes";
          Cart.get();
        } else {
          item.separatePackaging = "No"
          Cart.get()
        }
      });
    }

    function showBanner(bannerType, transition) {
      if (contentBannerInstance) {
        contentBannerInstance();
        contentBannerInstance = null;
      }
      contentBannerInstance = $ionicContentBanner.show({
        text: ['Hint : Swipe left to remove'],
        autoClose: 2000,
        type: bannerType,
        transition: transition || 'vertical'
      });
    }

    function checkCartItems() {
      if ($scope.cart.items.length > 0) {
        $timeout(function() {
          showBanner('info', 'vertical');
        }, 600);
      }
    }

    function getData() {
      var haveInternet = Connection.checkInternet();
      if (haveInternet) {
        $scope.noInternet = false;
        $scope.cart = Cart.get();
        checkCartItems();
      } else {
        $scope.noInternet = true;
      }
    }

    getData();

    $scope.reconnect = function() {
      getData();
    };

    $scope.cartEmpty = function() {
      if ($scope.cart.items.length > 0) {
        return false;
      } else if ($scope.cart.items.length == 0) {
        return true;
      }
    };

    $scope.plusQty = function(item) {
      var haveInternet = Connection.checkInternetWithPopup();
      if (haveInternet) {
        item.quantity++;
        if (item.separatePackaging == "") {
          showSeparatePackaging(item);
        }
        Cart.get();
      }
    };

    $scope.minusQty = function(item) {
      var haveInternet = Connection.checkInternetWithPopup();
      if (haveInternet) {
        if (item.quantity == 2) {
          showBanner('info', 'vertical');
          item.separatePackaging = "";
          Cart.get();
        }
        if (item.quantity > 1) {
          item.quantity--;
          Cart.get();
        }
      }
    };

    $scope.remove = function(itemID) {
      var haveInternet = Connection.checkInternetWithPopup();
      if (haveInternet) {
        Cart.remove(itemID);
        Cart.get();
      }
    };

    $scope.submitOrder = function() {
      popupOrdTypePrompt();
    };

    $ionicModal.fromTemplateUrl('templates/promoModal.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
    });

    $scope.openModal = function(msg) {
      var haveInternet = Connection.checkInternetWithPopup();
      $scope.list = [];
      if (haveInternet) {
        Promotions.getAll().then(function(res) {
          for (var i = 0; i < res.length; i++) {
            console.log(res[i]);
            if (res[i].status == 1 && res[i].comboType == "combo1" && msg == "combo1") {
              $scope.list.push(res[i]);
            } else if (res[i].status == 1 && res[i].comboType == "combo2" && msg == "combo2") {
              $scope.list.push(res[i]);
            } else if (res[i].status == 1 && res[i].comboType == "combo3" && msg == "combo3") {
              $scope.list.push(res[i]);
            }
          }
          console.log($scope.list);
        });
        $ionicSlideBoxDelegate.slide(0);
        $scope.modal.show();
      }
    };

    $scope.closeModal = function() {
      $scope.modal.hide();
    };

    $scope.$on('$destroy', function() {
      $scope.modal.remove();
    });

    $scope.$on('modal.hide', function() {
      // Execute action
    });

    $scope.$on('modal.removed', function() {
      // Execute action
    });

    $scope.$on('modal.shown', function() {
      console.log('Modal is shown!');
    });

    $ionicSideMenuDelegate.canDragContent(false);

  })

  .controller('promoCtrl', function($scope, $state, Promotions, $ionicSideMenuDelegate) {

    $scope.noInternet = false;

    function getData() {
      Promotions.getAll().then(function(res) {
        if (res != "noInternet") {
          $scope.noInternet = false;
          $scope.list = [];
          for (var i = 0; i < res.length; i++) {
            if (res[i].status == 1) {
              $scope.list.push(res[i]);
            }
          }
        } else {
          $scope.noInternet = true;
        }
      });
    }

    getData();

    $scope.hasPromo = function(length) {
      if (length < 1) {
        return true;
      } else {
        return false;
      }
    };

    $scope.reconnect = function() {
      getData();
    };

    $ionicSideMenuDelegate.canDragContent(false);

  })

  .controller('topFoodCtrl', function($scope, $state, Top10, $ionicPopup) {

    $scope.noInternet = false;
    $scope.items = [];

    function getData() {
      Top10.getFood().then(function(res) {
        if (res != "noInternet") {
          $scope.noInternet = false;
          for (var i = 0; i < res.length; i++) {
            res[i].number = i + 1;
            $scope.items.push(res[i]);
          }
        } else {
          $scope.noInternet = true;
        }
      });
    }

    getData();

    $scope.reconnect = function() {
      getData();
    };

  })

  .controller('topBeverageCtrl', function($scope, $state, Top10, $ionicPopup) {

    $scope.noInternet = false;
    $scope.items = [];

    function getData() {
      Top10.getBeverage().then(function(res) {
        if (res != "noInternet") {
          $scope.noInternet = false;
          for (var i = 0; i < res.length; i++) {
            res[i].number = i + 1;
            $scope.items.push(res[i]);
          }
        } else {
          $scope.noInternet = true;
        }
      });
    }

    getData();

    $scope.reconnect = function() {
      getData();
    };

  })

  .controller('favouriteCtrl', function($scope, $state, $ionicPopup, Favourite, $rootScope, $ionicContentBanner, Connection, $timeout, $q) {

    $scope.noInternet = false;
    var contentBannerInstance;
    $scope.items = [];
    $scope.dataSend = {};
    localStorage.setItem("favIndex", '');

    function showBanner(bannerType, transition) {
      if (contentBannerInstance) {
        contentBannerInstance();
        contentBannerInstance = null;
      }
      contentBannerInstance = $ionicContentBanner.show({
        text: ['You do not have any favourite items.'],
        autoClose: 2000,
        type: bannerType,
        transition: transition || 'vertical'
      });
    }

    function checkForEmpty() {
      var a = localStorage.getItem("favouriteItemsID");
      var b = localStorage.getItem("favIndex");
      if (a == '' && b == '') {
        $timeout(function() {
          showBanner('info', 'vertical');
        }, 600);
      }
    }

    function refresh() {
      var deferred = $q.defer();
      if ($rootScope.menuState == 'login') {
        $scope.dataSend.custID = localStorage.getItem("accountId");
        $scope.dataSend.favouriteItemsID = localStorage.getItem("favouriteItemsID");
        $scope.dataSend.token = localStorage.getItem("accessToken");
        Favourite.updateFavourites($scope.dataSend).then(function(response) {
          console.log(response);
        }).then(function(res) {
          var FavIndex = localStorage.getItem("favIndex").split(',');
          FavIndex.sort(function(a, b) {
            return b - a;
          });
          for (var i = 0; i < FavIndex.length; i++) {
            if (FavIndex[i] != '') {
              $scope.items.splice(FavIndex[i], 1);
            }
          }
          localStorage.setItem("favIndex", '');
          deferred.resolve('done');
        });
      }
      return deferred.promise;
    }

    function getData() {
      Favourite.get(localStorage.getItem('accountId')).then(function(res) {
        console.log(res);
        if (res != "noInternet") {
          $scope.noInternet = false;
          if (res == 'Empty' || res.length == 0) {
            checkForEmpty();
          } else {
            for (var i = 0; i < res.length; i++) {
              $scope.items.push(res[i]);
            }
          }
        } else {
          $scope.noInternet = true;
        }
      });
    }

    getData();

    $scope.reconnect = function() {
      getData();
    };

    $scope.init = function(itemId, index) {
      var FavItems = localStorage.getItem("favouriteItemsID").split(',');
      var FavIndex = localStorage.getItem("favIndex");
      var isFound = true;
      if (FavItems.length < 2) {
        $scope.items.splice(index, 1);
      }
      for (var i = 0; i < FavItems.length; i++) {
        if (FavItems[i] == itemId) {
          isFound = true;
          break;
        } else {
          isFound = false;
        }
      }
      if (isFound == false) {
        $scope.items.splice(index, 1);
      }
      checkForEmpty();
    };

    $scope.checkFav = function(id) {
      var isFavourite = true;
      var FavItems = localStorage.getItem("favouriteItemsID").split(',');
      for (var i = 0; i < FavItems.length; i++) {
        if (FavItems[i] == id) {
          isFavourite = true;
          break;
        } else {
          isFavourite = false;
        }
      }
      return isFavourite;
    };

    $scope.setFavTrue = function(itemId, index) {
      var haveInternet = Connection.checkInternetWithPopup();
      if (haveInternet) {
        var FavItems = localStorage.getItem("favouriteItemsID");
        var FavIndex = localStorage.getItem("favIndex").split(/(,)/);
        var updateFav = FavItems.concat(itemId + ',');
        for (var i = 0; i < FavIndex.length; i = i + 2) {
          if (FavIndex[i] == index) {
            FavIndex.splice(i, 2);
            break;
          }
        }
        localStorage.setItem("favouriteItemsID", updateFav);
        localStorage.setItem("favIndex", FavIndex.join(""));
        console.log('favItem: ' + localStorage.getItem("favouriteItemsID"));
        console.log('favIndex: ' + localStorage.getItem("favIndex"));
        console.log('set to true: ' + index);
      }
    };

    $scope.setFavFalse = function(itemId, index) {
      var haveInternet = Connection.checkInternetWithPopup();
      if (haveInternet) {
        var FavItems = localStorage.getItem("favouriteItemsID").split(/(,)/);
        var FavIndex = localStorage.getItem("favIndex");
        var updateIndex = FavIndex.concat(index + ',');
        for (var i = 0; i < FavItems.length; i = i + 2) {
          if (FavItems[i] == itemId) {
            FavItems.splice(i, 2);
            break;
          }
        }
        localStorage.setItem("favouriteItemsID", FavItems.join(""));
        localStorage.setItem("favIndex", updateIndex);
        console.log('favItem: ' + localStorage.getItem("favouriteItemsID"));
        console.log('favIndex: ' + localStorage.getItem("favIndex"));
        console.log('set to false: ' + index);
      }
    };

    $scope.doRefresh = function() {
      var haveInternet = Connection.checkInternetWithPopup();
      if (haveInternet) {
        refresh().then(function(res) {
          checkForEmpty();
        });
      }
      $scope.$broadcast('scroll.refreshComplete');
    };

    $scope.$on('$ionicView.leave', function() {
      var haveInternet = Connection.checkInternet();
      if (haveInternet) {
        refresh();
      }
    });

  })

  .controller('historyCtrl', function($scope, $state, $ionicSideMenuDelegate, MyHistory, $ionicContentBanner, $timeout, Connection) {

    $scope.noInternet = false;
    var contentBannerInstance;
    $scope.orders = [];

    function showBanner(bannerType, transition) {
      if (contentBannerInstance) {
        contentBannerInstance();
        contentBannerInstance = null;
      }
      contentBannerInstance = $ionicContentBanner.show({
        text: ['You have not order any items.'],
        autoClose: 2000,
        type: bannerType,
        transition: transition || 'vertical'
      });
    }

    function getData() {
      MyHistory.getOrders(localStorage.getItem('accountId')).then(function(res) {
        if (res != "noInternet") {
          $scope.noInternet = false;
          if (res != 'Empty') {
            for (var i = 0; i < res.length; i++) {
              $scope.orders.push(res[i]);
            }
          } else {
            $timeout(function() {
              showBanner('info', 'vertical');
            }, 250);
          }
        } else {
          $scope.noInternet = true;
        }
      });
    }

    getData();

    $scope.reconnect = function() {
      getData();
    };

    $scope.checkStatus = function(status) {
      if (status == "Delivered" || status == "Collected") {
        return "greenStatus";
      } else {
        return "orangeStatus";
      }
    }

  })

  .controller('ordDetailsCtrl', function($scope, $state, $stateParams, $ionicSideMenuDelegate, MyHistory, $ionicModal, Connection) {

    $scope.noInternet = false;
    var id = $stateParams.id;
    $scope.ordId = id;
    $scope.items = [];
    $scope.qrCodePin = "";

    function getData() {
      var haveInternet = Connection.checkInternet();
      if (haveInternet) {
        $scope.noInternet = false;
        MyHistory.getOrderItems(id).then(function(res) {
          console.log(res);
          $scope.ordTotal = parseFloat(res[0].total).toFixed(2);
          $scope.ordDiscount = parseFloat(res[0].discount).toFixed(2);
          $scope.ordGST = parseFloat(res[0].GST).toFixed(2);
          $scope.ordNetTotal = parseFloat(res[0].netTotal).toFixed(2);
          $scope.orderType = res[0].orderType;
          $scope.preorderDateTime = moment(res[0].preorderDateTime).format('DD-MMM-YYYY h:mm:ss A');
          $scope.tableNumber = res[0].tableNumber;
          $scope.orderDateTime = moment(res[0].orderDateTime).format('DD-MMM-YYYY h:mm:ss A');
          $scope.transNo = res[0].transNo;
          $scope.PIN = res[0].PIN.toString();
          $scope.comboMessage = res[0].comboMessage;

          for (var i = 0; i < res.length; i++) {
            res[i].itemPrice = parseFloat(res[i].itemPrice).toFixed(2);
            $scope.items.push(res[i]);
          }
          console.log("Order item Id: " + id);
        });
      } else {
        $scope.noInternet = true;
      }
    }

    getData();

    $scope.reconnect = function() {
      getData();
    };

    $scope.openQrCodeModal = function() {
      $ionicModal.fromTemplateUrl('templates/qrCode.html', {
        scope: $scope,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.qrCodeModal = modal;
        $scope.qrCodeModal.show();
      });
    };

    $scope.closeQrCodeModal = function() {
      $scope.qrCodeModal.remove();
    };

    $scope.$on('$destroy', function() {
      // Execute action
    });

    $scope.$on('modal.hidden', function() {
      // Execute action
    });

    $scope.$on('modal.removed', function() {
      // Execute action
    });

  })

  .controller('myAccountCtrl', function($scope, $state, $ionicSideMenuDelegate, Account, $ionicModal, $ionicPopup, md5, salt, Connection) {

    $scope.noInternet = false;
    $scope.Password = {};
    $scope.dataSend = {};

    function popupInvalidCurrent() {
      $ionicPopup.alert({
        title: 'Password Change Fail',
        subTitle: 'Your current password is invalid!',
        okType: 'button-royal'
      }).then(function(res) {
        console.log('Password Change Fail');
      });
    }

    function popupSuccessReset() {
      $ionicPopup.alert({
        title: 'Password Change Successsful',
        subTitle: 'You may now try to login with new password.',
        okType: 'button-royal'
      }).then(function(res) {
        $scope.closeModal();
        console.log('Password Change Successful');
      });
    }

    function getData() {
      Account.get(localStorage.getItem('accountId')).then(function(res) {
        if (res != "noInternet") {
          $scope.noInternet = false;
          $scope.details = res;
        } else {
          $scope.noInternet = true;
        }
      });
    }

    getData();

    $scope.reconnect = function() {
      getData();
    };

    $ionicModal.fromTemplateUrl('templates/changePassword.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
    });

    $scope.openModal = function() {
      $scope.modal.show();
    };

    $scope.closeModal = function() {
      $scope.modal.hide();
    };

    $scope.$on('$destroy', function() {
      $scope.modal.remove();
    });

    $scope.$on('modal.hidden', function() {
      // Execute action
    });

    $scope.$on('modal.removed', function() {
      // Execute action
    });

    $scope.changePassword = function(acc, form) {
      var haveInternet = Connection.checkInternetWithPopup();
      if (haveInternet) {
        $scope.dataSend.custID = localStorage.getItem("accountId");
        $scope.dataSend.custPassword = md5.createHash($scope.Password.new + salt);
        $scope.dataSend.token = localStorage.getItem("accessToken");
        var currentPassordHash = md5.createHash($scope.Password.current + salt);
        Account.checkCurrentPassword($scope.dataSend.custID, currentPassordHash).then(function(res) {
          if (res.message != 'unsuccessful') {
            Account.changePassword($scope.dataSend).then(function(response) {
              if (form) {
                $scope.Password = {};
                form.$setPristine();
                form.$setUntouched();
              }
              popupSuccessReset();
            });
          } else {
            popupInvalidCurrent();
          }
        });
      }
    };

  })

  .controller('contactCtrl', function($scope, $state, CafeInfo) {

    $scope.noInternet = false;

    function initialize() {
      // set up begining position
      var myLatlng = new google.maps.LatLng(1.380082, 103.849564);
      // set option for map
      var mapOptions = {
        center: myLatlng,
        zoom: 18,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };
      // init map
      var map = new google.maps.Map(document.getElementById("map"), mapOptions);
      var marker = new google.maps.Marker({
        position: myLatlng,
        title: "l'Cafe"
      });
      marker.setMap(map);
      // assign to stop
      $scope.map = map;
    }

    function getData() {
      CafeInfo.getContact().then(function(res) {
        if (res != "noInternet") {
          $scope.noInternet = false;
          $scope.contact = {};
          for (var i = 0; i < res.length; i++) {
            if (res[i].contactType == "Phone") {
              $scope.contact.phone = res[i].contactSource;
            } else if (res[i].contactType == "Email") {
              $scope.contact.email = res[i].contactSource;
            } else if (res[i].contactType == "Instagram") {
              $scope.contact.instagram = res[i].contactSource;
            } else if (res[i].contactType == "Facebook") {
              $scope.contact.facebook = res[i].contactSource;
            } else if (res[i].contactType == "Twitter") {
              $scope.contact.twitter = res[i].contactSource;
            }
          }
        } else {
          $scope.noInternet = true;
        }
      });
    }

    getData();

    $scope.init = function() {
      // load map when the ui is loaded
      initialize();
    };

    $scope.openLink = function(url) {
      window.open(url, '_blank');
    };

    $scope.reconnect = function() {
      getData();
    };

  })

  .controller('aboutCtrl', function($scope, $state, $stateParams, CafeInfo, moment) {

    $scope.noInternet = false;

    function getData() {
      CafeInfo.get().then(function(res) {
        if (res != "noInternet") {
          $scope.noInternet = false;
          var day;
          var id;
          var holidayMessage;
          var isHoliday = false;
          $scope.cafeInfos = res;
          $scope.todayRemark = "No Remarks";
          // check today's day
          switch (moment().day()) {
            case 1:
              day = "Monday";
              id = 0;
              break;
            case 2:
              day = "Tuesday";
              id = 1;
              break;
            case 3:
              day = "Wednesday";
              id = 2;
              break;
            case 4:
              day = "Thursday";
              id = 3;
              break;
            case 5:
              day = "Friday";
              id = 4;
              break;
            default:
              id = -1;
          }

          CafeInfo.getHoliday().then(function(res) {
            if (res != "noInternet") {
              $scope.noInternet = false;
              var a = moment();
              for (var i = 0; i < res.length; i++) {
                var from = new Date(res[i].DateFrom);
                var to = new Date(res[i].DateTo);
                to.setDate(to.getDate() + 1);
                var withinHoliday = moment(a).isBetween(from, to);
                console.log("Is within Holiday: " + withinHoliday);
                if (withinHoliday) {
                  isHoliday = true;
                  holidayMessage = res[i].Message;
                  break;
                } else {
                  isHoliday = false;
                }
              }
              console.log(res);
            } else {
              $scope.noInternet = true;
            }
          }).then(function() {
            if (isHoliday) {
              $scope.status = 'Closed';
              $scope.todayRemark = "It's " + holidayMessage + "!";
            } else {
              // get today's remarks
              if (id != -1) {
                $scope.todayRemark = res[id].remarks;
                $scope.todayDay = day;
                // split opening hours by ":" delimeters
                var todayOpeningHours = res[id].openinghours;
                var arrayOfSplitsOpen = todayOpeningHours.split(/(:)/);
                var hrOpen = arrayOfSplitsOpen[0];
                var minOpen = arrayOfSplitsOpen[2];

                // split closing hours by ":" delimeters
                var todayOpeningHours = res[id].closinghours;
                var arrayOfSplitsClose = todayOpeningHours.split(/(:)/);
                var hrClose = arrayOfSplitsClose[0];
                var minClose = arrayOfSplitsClose[2];

                // check between time
                var d = moment();
                var afterTime = moment().hour(hrOpen).minutes(minOpen);
                var beforeTime = moment().hour(hrClose).minutes(minClose);

                var thirtyMinutesFromNow = moment().hour(hrClose).minutes(minClose).subtract(1800, 'seconds');
                console.log("Is within an hour before closing: " + moment(d).isBetween(thirtyMinutesFromNow, beforeTime));
                console.log("Is between time: " + moment(d).isBetween(afterTime, beforeTime));

                if (moment(d).isBetween(afterTime, beforeTime)) {
                  if (moment(d).isBetween(thirtyMinutesFromNow, beforeTime)) {
                    $scope.status = 'ClosingSoon';
                  } else {
                    $scope.status = 'Open';
                  }
                } else {
                  $scope.status = 'Closed';
                }
              } else {
                $scope.status = 'Closed';
              }
            }
          });
        } else {
          $scope.noInternet = true;
        }
      });
    }

    getData();

    $scope.reconnect = function() {
      getData();
    };

  })

  .controller('dineInCtrl', function($scope, $state, $cordovaBarcodeScanner, Cart, $ionicModal, $ionicPopup, $rootScope, CafeInfo, moment, $q, $ionicScrollDelegate, Connection) {

    function cafeIsOpen() {
      var deferred = $q.defer();
      CafeInfo.get().then(function(res) {
        var day;
        var id;
        var isHoliday = false;
        $scope.cafeInfos = res;
        console.log(res);
        // check today's day
        switch (moment().day()) {
          case 1:
            day = "Monday";
            id = 0;
            break;
          case 2:
            day = "Tuesday";
            id = 1;
            break;
          case 3:
            day = "Wednesday";
            id = 2;
            break;
          case 4:
            day = "Thursday";
            id = 3;
            break;
          case 5:
            day = "Friday";
            id = 4;
            break;
          default:
            id = -1;
        }

        CafeInfo.getHoliday().then(function(res) {
          var a = moment();
          for (var i = 0; i < res.length; i++) {
            var from = new Date(res[i].DateFrom);
            var to = new Date(res[i].DateTo);
            to.setDate(to.getDate() + 1);
            var withinHoliday = moment(a).isBetween(from, to);
            console.log("Is within Holiday: " + withinHoliday);
            if (withinHoliday) {
              isHoliday = true;
              break;
            } else {
              isHoliday = false;
            }
          }
          console.log(res);
        }).then(function() {
          if (isHoliday) {
            $scope.status = 'Closed';
          } else {
            // get today's remarks
            if (id != -1) {
              // split opening hours by ":" delimeters
              var todayOpeningHours = res[id].openinghours;
              var arrayOfSplitsOpen = todayOpeningHours.split(/(:)/);
              var hrOpen = arrayOfSplitsOpen[0];
              var minOpen = arrayOfSplitsOpen[2];

              // split closing hours by ":" delimeters
              var todayOpeningHours = res[id].closinghours;
              var arrayOfSplitsClose = todayOpeningHours.split(/(:)/);
              var hrClose = arrayOfSplitsClose[0];
              var minClose = arrayOfSplitsClose[2];

              // check between time
              var d = moment();
              var afterTime = moment().hour(hrOpen).minutes(minOpen);
              var beforeTime = moment().hour(hrClose).minutes(minClose);

              var fifteenMinutesFromNow = moment().hour(hrClose).minutes(minClose).subtract(840, 'seconds');
              console.log("Is within 15 minutes before closing: " + moment(d).isBetween(fifteenMinutesFromNow, beforeTime));

              console.log("Is between time: " + moment(d).isBetween(afterTime, beforeTime));
              if (moment(d).isBetween(afterTime, beforeTime)) {
                // $scope.status = 'Open';
                if (moment(d).isBetween(fifteenMinutesFromNow, beforeTime)) {
                  $scope.status = 'WithinFifteenMinutesBeforeClose';
                } else {
                  $scope.status = 'Open';
                }
              } else {
                $scope.status = 'Closed';
              }
            } else {
              $scope.status = 'Closed';
            }
          }
          console.log('Current status is: ' + $scope.status);
          if ($scope.status == 'Closed') {
            deferred.resolve('Closed');
          } else if ($scope.status == 'Open') {
            deferred.resolve('Open');
          } else if ($scope.status == 'WithinFifteenMinutesBeforeClose') {
            deferred.resolve('WithinFifteenMinutesBeforeClose');
          }
        });
      });
      return deferred.promise;
    }

    function popupCafeClose() {
      $ionicPopup.confirm({
        title: 'Our cafe is closed now',
        template: 'Do you want to check on our Opening hours?',
        cancelText: 'No',
        okText: 'Yes',
        okType: 'button-royal'
      }).then(function(res) {
        if (res) {
          $scope.openModal();
          console.log('Yes');
        } else {
          console.log('No');
        }
      });
    }

    function popupScanSuccess(value) {
      $ionicPopup.alert({
        title: 'Scan Successful',
        template: 'Your table number is : ' + value,
        okType: 'button-royal'
      }).then(function(res) {
        console.log('Table number: ' + value);
        if (localStorage.getItem("accountId") == "") {
          $rootScope.payment = "true";
          $state.go('login');
        } else {
          $state.go('payment');
        }
      });
    }

    function popupUpNoService() {
      $ionicPopup.alert({
        title: 'No service',
        template: 'Cafe is closing within 15 minutes.',
        okType: 'button-royal'
      }).then(function(res) {
        console.log("No service");
      });
    }

    $ionicModal.fromTemplateUrl('templates/openingHours.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
    });

    $scope.openModal = function() {
      $scope.modal.show();
    };

    $scope.closeModal = function() {
      $scope.modal.hide();
    };

    $scope.$on('$destroy', function() {
      $scope.modal.remove();
    });

    $scope.$on('modal.hidden', function() {
      // Execute action
    });

    $scope.$on('modal.removed', function() {
      // Execute action
    });

    $scope.checkScroll = function() {
      var currentTop = $ionicScrollDelegate.$getByHandle('scroller').getScrollPosition().top;
      var maxTop = $ionicScrollDelegate.$getByHandle('scroller').getScrollView().__maxScrollTop;
      if (currentTop == 0) {
        console.log('top of scroll!');
        $scope.bottom = false;
        $scope.$apply();
      }
      if (currentTop >= maxTop) {
        console.log('bottom of scroll!');
        $scope.bottom = true;
        $scope.$apply();
      }
    };

    $scope.scan = function() {
      var haveInternet = Connection.checkInternetWithPopup();
      if (haveInternet) {
        cafeIsOpen().then(function(res) {
          console.log(res);
          if (res == "Open") {
            $cordovaBarcodeScanner
              .scan()
              .then(function(barcodeData) {
                Cart.setDineIn(barcodeData.text);
                popupScanSuccess(barcodeData.text);
              }, function(error) {
                console.log(error);
              });
          } else if (res == "WithinFifteenMinutesBeforeClose") {
            popupUpNoService();
          } else if (res == "Closed") {
            popupCafeClose();
          }
        });
      }
    };

    $scope.enterTableNum = function() {
      var haveInternet = Connection.checkInternetWithPopup();
      if (haveInternet) {
        cafeIsOpen().then(function(res) {
          console.log(res);
          if (res == "Open") {
            $scope.data = {};
            $ionicPopup.show({
              templateUrl: 'templates/tableNumber.html',
              title: 'Enter your table number',
              scope: $scope,
              buttons: [{
                text: 'Cancel'
              }, {
                text: '<b>Okay</b>',
                type: 'button-royal',
                onTap: function(e) {
                  if (!$scope.data.tempTable) {
                    e.preventDefault();
                  } else {
                    return $scope.data.tempTable;
                  }
                }
              }, ]
            }).then(function(res) {
              if (res != undefined) {
                Cart.setDineIn(res);
                popupScanSuccess(res);
              }
            });
          } else if (res == "WithinFifteenMinutesBeforeClose") {
            popupUpNoService();
          } else if (res == "Closed") {
            popupCafeClose();
          }
        });
      }
    };

    $scope.$on('$ionicView.enter', function() {
      $rootScope.ordType = "dine-in";
    });

  })

  .controller('preOrderCtrl', function($scope, $state, $rootScope, Cart, $ionicModal, $ionicPopup, CafeInfo, $q, $ionicScrollDelegate, Connection) {

    var coeff = 1000 * 60 * 5;
    var date = new Date();
    date.setHours(date.getHours() + 1);
    var rounded = new Date(Math.round(date.getTime() / coeff) * coeff);
    $scope.preorder = {
      value: rounded
    };

    function cafeIsOpen(selectedDT) {
      var deferred = $q.defer();
      CafeInfo.get().then(function(res) {
        var day;
        var id;
        var isHoliday = false;
        $scope.cafeInfos = res;
        // check today's day
        switch (parseInt(moment(selectedDT).format('E'))) {
          case 1:
            day = "Monday";
            id = 0;
            break;
          case 2:
            day = "Tuesday";
            id = 1;
            break;
          case 3:
            day = "Wednesday";
            id = 2;
            break;
          case 4:
            day = "Thursday";
            id = 3;
            break;
          case 5:
            day = "Friday";
            id = 4;
            break;
          default:
            id = -1;
        }

        CafeInfo.getHoliday().then(function(res) {
          var a = moment(selectedDT);
          for (var i = 0; i < res.length; i++) {
            var from = new Date(res[i].DateFrom);
            var to = new Date(res[i].DateTo);
            to.setDate(to.getDate() + 1);
            var withinHoliday = moment(a).isBetween(from, to);
            console.log("Is within Holiday: " + withinHoliday);
            if (withinHoliday) {
              isHoliday = true;
              break;
            } else {
              isHoliday = false;
            }
          }
          console.log(res);
        }).then(function() {
          if (isHoliday) {
            $scope.status = 'Closed';
          } else {
            // get today's remarks
            if (id != -1) {
              // split opening hours by ":" delimeters
              var todayOpeningHours = res[id].openinghours;
              var arrayOfSplitsOpen = todayOpeningHours.split(/(:)/);
              var hrOpen = arrayOfSplitsOpen[0];
              var minOpen = arrayOfSplitsOpen[2];

              // split closing hours by ":" delimeters
              var todayOpeningHours = res[id].closinghours;
              var arrayOfSplitsClose = todayOpeningHours.split(/(:)/);
              var hrClose = arrayOfSplitsClose[0];
              var minClose = arrayOfSplitsClose[2];

              // check between time
              var selectedDate = new Date(selectedDT);
              var date = new Date();
              var datestringA = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
                selectedDate.getHours() + ":" + selectedDate.getMinutes();
              var datestringB = date.getFullYear() + "-" + (selectedDate.getMonth() + 1) + "-" + selectedDate.getDate() + " " +
                selectedDate.getHours() + ":" + selectedDate.getMinutes();
              var formatDateA = new Date(datestringA);
              var formatDateB = new Date(datestringB);
              var d = moment(formatDateA);
              var c = moment(formatDateB);
              var afterTime = moment().hour(hrOpen).minutes(minOpen);
              var beforeTime = moment().hour(hrClose).minutes(minClose);

              var fifteenMinutesToNow = moment().hour(hrOpen).minutes(minOpen).add(840, 'seconds');
              console.log("Is within 15 minutes after opening: " + moment(d).isBetween(afterTime, fifteenMinutesToNow));

              var fifteenMinutesFromNow = moment().hour(hrClose).minutes(minClose).subtract(840, 'seconds');
              console.log("Is within 15 minutes before closing: " + moment(d).isBetween(fifteenMinutesFromNow, beforeTime));

              var now = moment();
              console.log("Time has passed: " + moment(c).isBefore(now));

              var fifteenMinutesAfterNow = moment().add(840, 'seconds');
              console.log("Need 15 minutes to prepare (pre order): " + moment(c).isBefore(fifteenMinutesAfterNow));

              console.log("Is between time: " + moment(d).isBetween(afterTime, beforeTime));
              if (moment(d).isBetween(afterTime, beforeTime)) {
                if (moment(c).isBefore(now)) {
                  $scope.status = "BeforeNow";
                } else if (moment(c).isBefore(fifteenMinutesAfterNow)) {
                  $scope.status = "FifteenMinutesAfterNow";
                } else {
                  if (moment(d).isBetween(fifteenMinutesFromNow, beforeTime)) {
                    $scope.status = 'WithinFifteenMinutesBeforeClose';
                  } else if (moment(d).isBetween(afterTime, fifteenMinutesToNow)) {
                    $scope.status = 'WithinFifteenMinutesAfterOpen';
                  } else {
                    $scope.status = 'Open';
                  }
                }
              } else {
                $scope.status = 'Closed';
              }
            } else {
              $scope.status = 'Closed';
            }
          }
          console.log('Current status is: ' + $scope.status);
          if ($scope.status == 'Closed') {
            deferred.resolve('Closed');
          } else if ($scope.status == 'BeforeNow') {
            deferred.resolve('BeforeNow');
          } else if ($scope.status == 'FifteenMinutesAfterNow') {
            deferred.resolve('FifteenMinutesAfterNow');
          } else if ($scope.status == 'Open') {
            deferred.resolve('Open');
          } else if ($scope.status == 'WithinFifteenMinutesBeforeClose') {
            deferred.resolve('WithinFifteenMinutesBeforeClose');
          } else if ($scope.status == 'WithinFifteenMinutesAfterOpen') {
            deferred.resolve('WithinFifteenMinutesAfterOpen');
          }
        });
      });
      return deferred.promise;
    }

    function popupCafeClose() {
      $ionicPopup.confirm({
        title: 'Our cafe is closed on selected date-time',
        template: 'Do you want to check on our Opening hours?',
        cancelText: 'No',
        okText: 'Yes',
        okType: 'button-royal'
      }).then(function(res) {
        if (res) {
          $scope.openModal();
          console.log('Yes');
        } else {
          console.log('No');
        }
      });
    }

    function popupUpNoService() {
      $ionicPopup.alert({
        title: 'No service',
        template: 'Cafe is closing within 15 minutes.',
        okType: 'button-royal'
      }).then(function(res) {
        console.log("No service");
      });
    }

    function popupNoEarlyPreOrder() {
      $ionicPopup.alert({
        title: 'No Early Pre-order',
        template: '15 minutes preparation is needed after opening.',
        okType: 'button-royal'
      }).then(function(res) {
        console.log("No Early Pre-order");
      });
    }

    function popupNeedPreparation() {
      $ionicPopup.alert({
        title: 'No Early Pre-order',
        template: '15 minutes preparation is needed before Pre-order',
        okType: 'button-royal'
      }).then(function(res) {
        console.log("No Early Pre-order");
      });
    }

    function popupTimePassed() {
      $ionicPopup.alert({
        title: 'Selected time have passed',
        template: 'Please select time that is after current time.',
        okType: 'button-royal'
      }).then(function(res) {
        console.log("Selected time have passed");
      });
    }

    $ionicModal.fromTemplateUrl('templates/openingHours.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
    });

    $scope.openModal = function() {
      $scope.modal.show();
    };

    $scope.closeModal = function() {
      $scope.modal.hide();
    };

    $scope.$on('$destroy', function() {
      $scope.modal.remove();
    });

    $scope.$on('modal.hidden', function() {
      // Execute action
    });

    $scope.$on('modal.removed', function() {
      // Execute action
    });

    $scope.checkScroll = function() {
      var currentTop = $ionicScrollDelegate.$getByHandle('scroller').getScrollPosition().top;
      var maxTop = $ionicScrollDelegate.$getByHandle('scroller').getScrollView().__maxScrollTop;
      if (currentTop == 0) {
        console.log('top of scroll!');
        $scope.bottom = false;
        $scope.$apply();
      }
      if (currentTop >= maxTop) {
        console.log('bottom of scroll!');
        $scope.bottom = true;
        $scope.$apply();
      }
    };

    $scope.continue = function() {
      var haveInternet = Connection.checkInternetWithPopup();
      if (haveInternet) {
        var dt = moment($scope.preorder.value).format('YYYY-MM-DD HH:mm:ss');
        cafeIsOpen(dt).then(function(res) {
          console.log(res);
          if (res == "Open") {
            Cart.setPreorder(dt);
            console.log("Pre-order dateTime: " + dt);
            if (localStorage.getItem("accountId") == "") {
              $rootScope.payment = "true";
              $state.go('login');
            } else {
              $state.go('payment');
            }
          } else if (res == "BeforeNow") {
            popupTimePassed();
          } else if (res == "FifteenMinutesAfterNow") {
            popupNeedPreparation();
          } else if (res == "WithinFifteenMinutesBeforeClose") {
            popupUpNoService();
          } else if (res == "WithinFifteenMinutesAfterOpen") {
            popupNoEarlyPreOrder();
          } else if (res == "Closed") {
            popupCafeClose();
          }
        });
      }
    };

    $scope.$on('$ionicView.enter', function() {
      $rootScope.ordType = "pre-order";
    });

  })

  .controller('paymentCtrl', function($scope, $rootScope, $state, $ionicPopup, $ionicLoading, Cart, Account, $ionicModal, Connection) {

    $scope.noInternet = false;
    var cart;
    $scope.pin = "";

    function popupPaymentSuccess() {
      $ionicPopup.alert({
        title: 'Order Submitted',
        subTitle: 'Your order has been submitted successfully.',
        okType: 'button-royal'
      }).then(function(res) {
        console.log("Order type: " + $rootScope.ordType);
        if ($rootScope.ordType == 'dine-in') {
          $scope.openModal();
        } else {
          $state.go('app.food');
        }
      });
    }

    function popupPaymentFail() {
      $ionicPopup.alert({
        title: 'Order Not Submitted',
        subTitle: 'Not enough stock, please re-select your food items',
        okType: 'button-royal'
      }).then(function(res) {
        $state.go('app.food');
        console.log("Order Not Submitted");
      });
    }

    function load() {
      $ionicLoading.show({
        template: '<p>Payment Processing...</p><ion-spinner></ion-spinner>',
        noBackdrop: true,
        animation: 'fade-in'
      }).then(function() {
        Cart.create(cart).then(function(response) {
          console.log("Message: " + JSON.stringify(response));
          $rootScope.payment = "false";
          $ionicLoading.hide();
          Cart.empty();
          if (response.message != -1) {
            $scope.pin = response.message;
            if ($scope.pin != null) {
              popupPaymentSuccess();
            }
          } else {
            popupPaymentFail();
          }
        });
      });
    }

    function getData() {
      var haveInternet = Connection.checkInternet();
      if (haveInternet) {
        $scope.noInternet = false;
        cart = Cart.get()
        Account.get(localStorage.getItem("accountId")).then(function(res) {
          $scope.paymentForm = {
            reference: 'CC843154841254',
            name: res.custFullName,
            identifier: 'CC6541564531641321',
            amount: '$' + cart.total
          };
        });
      } else {
        $scope.noInternet = true;
      }
    }

    getData();

    $scope.reconnect = function() {
      getData();
    };

    $ionicModal.fromTemplateUrl('templates/pin.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
    });

    $scope.openModal = function() {
      $scope.modal.show();
    };

    $scope.closeModal = function() {
      $scope.modal.hide();
      $state.go('app.food');
    };

    $scope.$on('$destroy', function() {
      $scope.modal.remove();
    });

    $scope.$on('modal.hidden', function() {
      // Execute action
    });

    $scope.$on('modal.removed', function() {
      // Execute action
    });

    $scope.pay = function() {
      var haveInternet = Connection.checkInternetWithPopup();
      if (haveInternet) {
        load();
      }
    };

  });
