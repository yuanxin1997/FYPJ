angular.module('starter.services', [])
  .constant('APIurl', 'http://acerobot.sit.nyp.edu.sg/WebServiceLCafe1/')
  .constant('Emailurl', 'http://acerobot.sit.nyp.edu.sg/LCafeEmailServices/')
  .constant('Accesskey', 'W7djP08dGhXqld1g3RXpz')
  .directive('errSrc', function() {
    return {
      link: function(scope, element, attrs) {
        element.bind('error', function() {
          if (attrs.src != attrs.errSrc) {
            attrs.$set('src', attrs.errSrc);
          }
        });
      }
    };
  })
  .directive('confirmPassword', function() {
    return {
      require: 'ngModel',
      scope: {
        password: '=confirmPassword'
      },
      link: function(scope, elm, attrs, ctrl) {
        ctrl.$validators.confirmPassword = function(modelValue, viewValue) {
          if (ctrl.$isEmpty(modelValue)) {
            // consider empty models to be valid
            return true;
          }

          return (modelValue === scope.password);
        };

        // If the user changes the password, then we have to re-validate the confirm password input
        scope.$watch('password', function() {
          if (scope.password) ctrl.$validate();
        });
      }
    };
  });

app.factory('Menu', function($http, APIurl, $q, Connection, LatestUpdate, Initialize) {
  return {
    getFood: function() {
      var deferred = $q.defer();
      var haveInternet = Connection.checkInternet();
      var foodMenu = localStorage.getItem('Cache::foodMenu');
      var currentDT = localStorage.getItem('foodMenuLUDT');
      if (haveInternet) {
        Initialize.token().then(function(res) {
          console.log(res);
          LatestUpdate.get().then(function(latestDT) {
            console.log("current: " + currentDT);
            console.log("latest: " + latestDT);
            if (foodMenu == null || currentDT != latestDT) {
              var url = APIurl + 'WebserviceCafe.asmx/retrieveMenu?itemCategory=';
              return $http({
                method: 'GET',
                url: url + "food&label=" + "&token=" + localStorage.getItem("accessToken"),
                dataType: "json",
                contentType: "application/json; charset=utf-8"
              }).then(function successCallback(response) {
                localStorage.setItem('Cache::foodMenu', JSON.stringify(response.data));
                localStorage.setItem('foodMenuLUDT', latestDT);
                console.log("using web service");
                deferred.resolve(response.data);
              }, function errorCallback(response) {
                deferred.resolve(response.data);
              });
            } else {
              console.log("using cache");
              deferred.resolve(JSON.parse(foodMenu));
            }
          });
        });
      } else {
        if (foodMenu == null) {
          deferred.resolve("noInternet");
        } else {
          console.log("using cache");
          deferred.resolve(JSON.parse(foodMenu));
        }
      }
      return deferred.promise;
    },
    getBeverage: function() {
      var deferred = $q.defer();
      var haveInternet = Connection.checkInternet();
      var beverageMenu = localStorage.getItem('Cache::beverageMenu');
      var currentDT = localStorage.getItem('beverageMenuLUDT');
      if (haveInternet) {
        Initialize.token().then(function(res) {
          console.log(res);
          LatestUpdate.get().then(function(latestDT) {
            console.log("current: " + currentDT);
            console.log("latest: " + latestDT);
            if (beverageMenu == null || currentDT != latestDT) {
              var url = APIurl + 'WebserviceCafe.asmx/retrieveMenu?itemCategory=';
              return $http({
                method: 'GET',
                url: url + "beverages&label=" + "&token=" + localStorage.getItem("accessToken"),
                dataType: "json",
                contentType: "application/json; charset=utf-8"
              }).then(function successCallback(response) {
                localStorage.setItem('Cache::beverageMenu', JSON.stringify(response.data));
                localStorage.setItem('beverageMenuLUDT', latestDT);
                console.log("using web service");
                deferred.resolve(response.data);
              }, function errorCallback(response) {
                deferred.resolve(response.data);
              });
            } else {
              console.log("using cache");
              deferred.resolve(JSON.parse(beverageMenu));
            }
          });
        });
      } else {
        if (beverageMenu == null) {
          deferred.resolve("noInternet");
        } else {
          console.log("using cache");
          deferred.resolve(JSON.parse(beverageMenu));
        }
      }
      return deferred.promise;
    },
    getSpecial: function() {
      var deferred = $q.defer();
      var haveInternet = Connection.checkInternet();
      var specialMenu = localStorage.getItem('Cache::specialMenu');
      var currentDT = localStorage.getItem('specialMenuLUDT');
      if (haveInternet) {
        Initialize.token().then(function(res) {
          console.log(res);
          LatestUpdate.get().then(function(latestDT) {
            console.log("current: " + currentDT);
            console.log("latest: " + latestDT);
            if (specialMenu == null || currentDT != latestDT) {
              var url = APIurl + 'WebserviceCafe.asmx/retrieveMenu?itemCategory=';
              return $http({
                method: 'GET',
                url: url + "&label=specialOrNew&token=" + localStorage.getItem("accessToken"),
                dataType: "json",
                contentType: "application/json; charset=utf-8"
              }).then(function successCallback(response) {
                localStorage.setItem('Cache::specialMenu', JSON.stringify(response.data));
                localStorage.setItem('specialMenuLUDT', latestDT);
                console.log("using web service");
                deferred.resolve(response.data);
              }, function errorCallback(response) {
                deferred.resolve(response.data);
              });
            } else {
              console.log("using cache");
              deferred.resolve(JSON.parse(specialMenu));
            }
          });
        });
      } else {
        if (specialMenu == null) {
          deferred.resolve("noInternet");
        } else {
          console.log("using cache");
          deferred.resolve(JSON.parse(specialMenu));
        }
      }
      return deferred.promise;
    }
  };
});

app.factory('Items', function($http, APIurl) {
  return {
    getItem: function(itemId) {
      var url = APIurl + 'WebserviceCafe.asmx/retrieveMenuItem';
      return $http({
        method: 'GET',
        url: url,
        params: {
          itemID: itemId,
          token: localStorage.getItem("accessToken")
        },
        dataType: "json",
        contentType: "application/json; charset=utf-8"
      }).then(function successCallback(response) {
        return response.data;
      }, function errorCallback(response) {
        return response.data;
      });
    }
  };
});

app.factory('Account', function($http, Cart, APIurl, Emailurl, $q, Connection, LatestUpdate, Initialize) {
  return {
    login: function(username, password) {
      var url = APIurl + 'WebserviceCafe.asmx/login';
      return $http({
        method: 'GET',
        url: url,
        params: {
          custEmail: username,
          custPassword: password,
          token: localStorage.getItem("accessToken")
        },
        dataType: "json",
        contentType: "application/json; charset=utf-8"
      }).then(function successCallback(response) {
        return response.data;
      }, function errorCallback(response) {
        return response.data;
      });
    },
    loginWithTempPassword: function(username, password) {
      var url = APIurl + 'WebserviceCafe.asmx/loginWithTempPassword';
      return $http({
        method: 'GET',
        url: url,
        params: {
          custEmail: username,
          custPassword: password,
          token: localStorage.getItem("accessToken")
        },
        dataType: "json",
        contentType: "application/json; charset=utf-8"
      }).then(function successCallback(response) {
        return response.data;
      }, function errorCallback(response) {
        return response.data;
      });
    },
    create: function(a) {
      var url = APIurl + 'WebserviceCafe.asmx/createAccount';
      return $http.post(url, a);
    },
    get: function(id) {
      var deferred = $q.defer();
      var haveInternet = Connection.checkInternet();
      var account = localStorage.getItem('Cache::account');
      if (haveInternet) {
        Initialize.token().then(function(res) {
          console.log(res);
          var url = APIurl + 'WebserviceCafe.asmx/retrieveAccountById?';
          return $http({
            method: 'GET',
            url: url + "token=" + localStorage.getItem("accessToken") + "&id=" + id,
            dataType: "json",
            contentType: "application/json; charset=utf-8"
          }).then(function successCallback(response) {
            localStorage.setItem('Cache::account', JSON.stringify(response.data));
            console.log("using web service");
            deferred.resolve(response.data);
          }, function errorCallback(response) {
            deferred.resolve(response.data);
          });
        });
      } else {
        if (account == null) {
          deferred.resolve("noInternet");
        } else {
          console.log("using cache");
          deferred.resolve(JSON.parse(account));
        }
      }
      return deferred.promise;
    },
    getByEmail: function(email) {
      var url = APIurl + "WebserviceCafe.asmx/retrieveAccountByEmail?";
      return $http({
        method: 'GET',
        url: url + "email=" + email + "&token=" + localStorage.getItem("accessToken"),
        dataType: "json",
        contentType: "application/json; charset=utf-8"
      }).then(function successCallback(response) {
        return response.data;
      }, function errorCallback(response) {
        return response.data
      });
    },
    checkDuplicateEmail: function(email) {
      var url = APIurl + "WebserviceCafe.asmx/checkDuplicateEmail?";
      return $http({
        method: 'GET',
        url: url + "email=" + email + "&token=" + localStorage.getItem("accessToken"),
        dataType: "json",
        contentType: "application/json; charset=utf-8"
      }).then(function successCallback(response) {
        return response.data;
      }, function errorCallback(response) {
        return response.data
      });
    },
    checkEmail: function(email) {
      var url = APIurl + "WebserviceCafe.asmx/checkEmail?";
      return $http({
        method: 'GET',
        url: url + "email=" + email + "&token=" + localStorage.getItem("accessToken"),
        dataType: "json",
        contentType: "application/json; charset=utf-8"
      }).then(function successCallback(response) {
        return response.data;
      }, function errorCallback(response) {
        return response.data
      });
    },
    checkTempPassword: function(email) {
      var url = APIurl + "WebserviceCafe.asmx/checkTempPassword?";
      return $http({
        method: 'GET',
        url: url + "email=" + email + "&token=" + localStorage.getItem("accessToken"),
        dataType: "json",
        contentType: "application/json; charset=utf-8"
      }).then(function successCallback(response) {
        return response.data;
      }, function errorCallback(response) {
        return response.data
      });
    },
    checkCurrentPassword: function(custId, currentPassword) {
      var url = APIurl + 'WebserviceCafe.asmx/checkCurrentPassword';
      return $http({
        method: 'GET',
        url: url,
        params: {
          custID: custId,
          custPassword: currentPassword,
          token: localStorage.getItem("accessToken")
        },
        dataType: "json",
        contentType: "application/json; charset=utf-8"
      }).then(function successCallback(response) {
        return response.data;
      }, function errorCallback(response) {
        return response.data;
      });
    },
    changePassword: function(a) {
      var url = APIurl + 'WebserviceCafe.asmx/resetPassword';
      return $http.post(url, a);
    },
    sendVerification: function(acc) {
      var url = Emailurl + 'EmailServices.asmx/SendEmailVerification?';
      return $http({
        method: 'GET',
        url: url + "email=" + acc.custEmail + "&name=" + acc.custFullName + "&confirmCode=" + acc.confirmCode,
        dataType: "json",
        contentType: "application/json; charset=utf-8"
      }).then(function successCallback(response) {
        return response.data;
      }, function errorCallback(response) {
        return response.data;
      });
    },
    sendRecoverLink: function(acc) {
      var url = Emailurl + 'EmailServices.asmx/SendTemporaryPassword?';
      return $http({
        method: 'GET',
        url: url + "email=" + acc.custEmail + "&name=" + acc.custFullName + "&custID=" + acc.custID.toString(),
        dataType: "json",
        contentType: "application/json; charset=utf-8"
      }).then(function successCallback(response) {
        return response.data;
      }, function errorCallback(response) {
        return response.data;
      });
    }
  };
});

app.factory('CafeInfo', function($http, APIurl, $q, Connection, LatestUpdate, Initialize) {
  return {
    get: function() {
      var deferred = $q.defer();
      var haveInternet = Connection.checkInternet();
      var openingHours = localStorage.getItem('Cache::openingHours');
      var currentDT = localStorage.getItem('openingHoursLUDT');
      if (haveInternet) {
        Initialize.token().then(function(res) {
          console.log(res);
          LatestUpdate.get().then(function(latestDT) {
            console.log("current: " + currentDT);
            console.log("latest: " + latestDT);
            if (openingHours == null || currentDT != latestDT) {
              var url = APIurl + 'WebserviceCafe.asmx/retrieveAllInfo?';
              return $http({
                method: 'GET',
                url: url + "token=" + localStorage.getItem("accessToken"),
                dataType: "json",
                contentType: "application/json; charset=utf-8"
              }).then(function successCallback(response) {
                localStorage.setItem('Cache::openingHours', JSON.stringify(response.data));
                localStorage.setItem('openingHoursLUDT', latestDT);
                console.log("using web service");
                deferred.resolve(response.data);
              }, function errorCallback(response) {
                deferred.resolve(response.data);
              });
            } else {
              console.log("using cache");
              deferred.resolve(JSON.parse(openingHours));
            }
          });
        });
      } else {
        if (openingHours == null) {
          deferred.resolve("noInternet");
        } else {
          console.log("using cache");
          deferred.resolve(JSON.parse(openingHours));
        }
      }
      return deferred.promise;
    },
    getHoliday: function() {
      var deferred = $q.defer();
      var haveInternet = Connection.checkInternet();
      var holidayList = localStorage.getItem('Cache::holidayList');
      var currentDT = localStorage.getItem('holidayListLUDT');
      if (haveInternet) {
        Initialize.token().then(function(res) {
          console.log(res);
          LatestUpdate.get().then(function(latestDT) {
            console.log("current: " + currentDT);
            console.log("latest: " + latestDT);
            if (holidayList == null || currentDT != latestDT) {
              var url = APIurl + 'WebserviceCafe.asmx/retrieveHolidays?';
              return $http({
                method: 'GET',
                url: url + "token=" + localStorage.getItem("accessToken"),
                dataType: "json",
                contentType: "application/json; charset=utf-8"
              }).then(function successCallback(response) {
                localStorage.setItem('Cache::holidayList', JSON.stringify(response.data));
                localStorage.setItem('holidayListLUDT', latestDT);
                console.log("using web service");
                deferred.resolve(response.data);
              }, function errorCallback(response) {
                deferred.resolve(response.data);
              });
            } else {
              console.log("using cache");
              deferred.resolve(JSON.parse(holidayList));
            }
          });
        });
      } else {
        if (holidayList == null) {
          deferred.resolve("noInternet");
        } else {
          console.log("using cache");
          deferred.resolve(JSON.parse(holidayList));
        }
      }
      return deferred.promise;
    },
    getContact: function() {
      var deferred = $q.defer();
      var haveInternet = Connection.checkInternet();
      var contact = localStorage.getItem('Cache::contact');
      var currentDT = localStorage.getItem('contactLUDT');
      if (haveInternet) {
        Initialize.token().then(function(res) {
          console.log(res);
          LatestUpdate.get().then(function(latestDT) {
            console.log("current: " + currentDT);
            console.log("latest: " + latestDT);
            if (contact == null || currentDT != latestDT) {
              var url = APIurl + 'WebserviceCafe.asmx/retrieveAllContact?';
              return $http({
                method: 'GET',
                url: url + "token=" + localStorage.getItem("accessToken"),
                dataType: "json",
                contentType: "application/json; charset=utf-8"
              }).then(function successCallback(response) {
                localStorage.setItem('Cache::contact', JSON.stringify(response.data));
                localStorage.setItem('contactLUDT', latestDT);
                console.log("using web service");
                deferred.resolve(response.data);
              }, function errorCallback(response) {
                deferred.resolve(response.data);
              });
            } else {
              console.log("using cache");
              deferred.resolve(JSON.parse(contact));
            }
          });
        });
      } else {
        if (contact == null) {
          deferred.resolve("noInternet");
        } else {
          console.log("using cache");
          deferred.resolve(JSON.parse(contact));
        }
      }
      return deferred.promise;
    }
  };
});

app.factory('Cart', function($http, moment, APIurl, $q, Promotions, Connection) {

  var cartObject = {
    discount: 0.0,
    GST: 0.0,
    netTotal: 0.0,
    total: 0.0,
    tableNumber: '',
    orderType: '',
    preorderDateTime: '',
    custID: '',
    items: [],
    comboMessage: []
  };
  var cart = JSON.parse(localStorage.getItem('cartItems'));

  if (cart == null) {
    localStorage.setItem('cartItems', JSON.stringify(cartObject));
    cart = JSON.parse(localStorage.getItem('cartItems'));
  }

  function persist() {
    localStorage.setItem('cartItems', JSON.stringify(cart));
  }

  function clear() {
    cart.discount = 0.0;
    cart.GST = 0.0;
    cart.netTotal = 0.0;
    cart.total = 0.0;
    cart.tableNumber = '';
    cart.orderType = '',
      cart.preorderDateTime = '';
    cart.items = [];
    cart.comboMessage = [];
  }

  function convertToArray(object) {
    var arr = [];
    for (var key in object) {
      if (object.hasOwnProperty(key)) {
        obj = {};
        obj.comboType = key;
        obj.comboQty = object[key];
        arr.push(obj);
      }
    }
    return arr;
  }

  function calculateCombo1n2n3DiscountAndQty(combo1, combo2, combo1HotDrinkDiscount, combo1ColdDrinkDiscount, combo2IceBlendedDiscount, combo3) {
    var longblackIce = 0;
    var longblackHot = 0;
    var iceTea = 0;
    var hotTea = 0;
    var iceBlended = 0;
    var food = 0;
    var discount = 0;
    var comboMsgArr = [];
    var obj = {};

    // categorize them accordingly and get their quantity
    for (var i = 0; i < cart.items.length; i++) {
      var quantity = cart.items[i].quantity;
      var itemName = cart.items[i].itemName;
      var itemPrice = cart.items[i].itemPrice;
      var itemCategory = cart.items[i].itemCategory;
      var itemSubCategory = cart.items[i].itemSubCategory;

      if (itemName == "Coffee / Long Black (Hot)") {
        longblackHot += quantity;
      } else if (itemName == "Coffee / Long Black (Cold)") {
        longblackIce += quantity;
      } else if (itemSubCategory == "Tea") {
        if (itemName.toLowerCase().includes("hot")) {
          hotTea += quantity;
        } else {
          iceTea += quantity;
        }
      } else if (itemSubCategory == "Ice Blended") {
        iceBlended += quantity;
      } else if (itemCategory == "Food") {
        food += quantity;
      }
    }

    if (combo3) { // within time
      var discountItems = [];
      var combo3Arr = [];
      var combo3Objects = {};
      var combo3ObjectsToBeDiscount = {};

      // put all combo 3 items into array (item name only)
      for (var i = 0; i < cart.items.length; i++) {
        var combo = cart.items[i].combo;
        var itemName = cart.items[i].itemName;
        var quantity = cart.items[i].quantity;
        if (combo == 3) {
          for (var j = 0; j < quantity; j++) {
            combo3Arr.push(itemName);
          }
        }
      }

      // convert and categorize items from array to objects
      combo3Objects = combo3Arr.reduce(function(prev, item) {
        if (item in prev)
          prev[item]++;
        else
          prev[item] = 1;

        return prev;
      }, {});

      // clone new object for discount
      combo3ObjectsToBeDiscount = Object.assign({}, combo3Objects);

      // 1) identify discount quantity for respective items (buy 1 get 1 free logic)
      // 2) retrieve the price of each discount item by name
      // 3) put all the price into array
      for (var key in combo3ObjectsToBeDiscount) {
        if (combo3ObjectsToBeDiscount.hasOwnProperty(key)) {
          var qty = combo3ObjectsToBeDiscount[key];
          combo3ObjectsToBeDiscount[key] = Math.floor(qty / 2);
          var discountQty = combo3ObjectsToBeDiscount[key];
          for (var i = 0; i < cart.items.length; i++) {
            var itemName = cart.items[i].itemName;
            var itemPrice = cart.items[i].itemPrice;
            if (key == itemName) {
              for (var j = 0; j < discountQty; j++) {
                discountItems.push(itemPrice);
                comboMsgArr.push("combo3");
              }
            }
          }
        }
      }

      for (var i = 0; i < discountItems.length; i++) {
        discount += discountItems[i];
      }

      food -= (discountItems.length * 2);
    }

    if (food > 0 && (longblackIce + longblackHot + iceTea + hotTea + iceBlended) > 0) {
      var hotDrinks = hotTea + longblackHot;
      var coldDrinks = iceTea + longblackIce;
      var iceBlendedDrinks = iceBlended;

      for (var i = 0; i < food; i++) {
        // Priority 1
        if (iceBlendedDrinks > 0 && combo2) {
          --iceBlendedDrinks;
          comboMsgArr.push("combo2");
          discount += 1.00;
        }
        // Priority 2
        else if (coldDrinks > 0 && combo1) {
          --coldDrinks;
          comboMsgArr.push("combo1");
          discount += 1.00;
        }
        // Priority 3
        else if (hotDrinks > 0 && combo1) {
          --hotDrinks;
          comboMsgArr.push("combo1");
          discount += 0.80;
        }
      }
    }

    // put discount to object
    obj.discount = discount;

    // convert from array to objects
    obj.comboMessage = comboMsgArr.reduce(function(prev, item) {
      if (item in prev)
        prev[item]++;
      else
        prev[item] = 1;

      return prev;
    }, {});

    return obj;
  }

  function calculateDiscount() {
    var deferred = $q.defer();
    var combo1 = false;
    var combo2 = false;
    var combo3 = false;
    var combo1HotDrinkDiscount = 0.0;
    var combo1ColdDrinkDiscount = 0.0;
    var combo2IceBlendedDiscount = 0.0;
    var choiceA = {};
    var choiceB = {};
    Promotions.checkComboStatus().then(function(comboStatusRes) {
      combo1 = comboStatusRes[0];
      combo2 = comboStatusRes[1];
      combo3 = comboStatusRes[2];
      Promotions.getAllCombo().then(function(allComboRes) {
        for (var i = 0; i < allComboRes.length; i++) {
          if (allComboRes.comboType == "combo1" && combo1 == true) {
            combo1HotDrinkDiscount = allComboRes.discountHot;
            combo1ColdDrinkDiscount = allComboRes.discountCold;
          } else if (allComboRes.comboType == "combo2" && combo2 == true) {
            combo2IceBlendedDiscount = allComboRes.discountCold;
          }
        }

        var calculation = calculateCombo1n2n3DiscountAndQty(combo1, combo2, combo1HotDrinkDiscount, combo1ColdDrinkDiscount, combo2IceBlendedDiscount, combo3)
        cart.discount = parseFloat(calculation.discount).toFixed(2);
        cart.comboMessage = convertToArray(calculation.comboMessage);
        persist();
        deferred.resolve('===========================================Discount is done :' + cart.discount);
      });
    });

    return deferred.promise;
  }

  function calculateNetTotal() {
    var deferred = $q.defer();
    if (cart.items.length > 0) {
      var total = 0.0;
      for (var i = 0; i < cart.items.length; i++) {
        total += cart.items[i].itemPrice * cart.items[i].quantity;
      }
      var afterDiscount = parseFloat(total) - parseFloat(cart.discount);
      cart.netTotal = parseFloat(afterDiscount - (afterDiscount * 0.07)).toFixed(2);
      persist();
      deferred.resolve('===========================================Net total is done: ' + cart.netTotal);
    }
    return deferred.promise;
  }

  function calculateGST() {
    var deferred = $q.defer();
    if (cart.netTotal != 0.0) {
      cart.GST = parseFloat((cart.netTotal / 0.93) * 0.07).toFixed(2);
      persist();
      deferred.resolve('===========================================GST is done: ' + cart.GST);
    }
    return deferred.promise;
  }

  function calculateTotal() {
    var deferred = $q.defer();
    if (cart.netTotal != 0) {
      var total = parseFloat(cart.netTotal) + parseFloat(cart.GST);
      cart.total = parseFloat(total).toFixed(2);
      persist();
      deferred.resolve('===========================================Total is done: ' + cart.total);
    }
    return deferred.promise;
  }

  function performCalculation() {
    var haveInternet = Connection.checkInternetWithPopup();
    if (haveInternet) {
      if (cart.items.length > 0) {
        calculateDiscount().then(function(res1) {
          console.log(res1);
          return calculateNetTotal()
        }).then(function(res2) {
          console.log(res2);
          return calculateGST();;
        }).then(function(res3) {
          console.log(res3);
          return calculateTotal();
        }).then(function(res4) {
          console.log(res4);
        });
      } else {
        clear();
      }
    }
  }

  return {
    get: function() {
      performCalculation();
      return cart;
    },
    getOnly: function() {
      return cart;
    },
    create: function(c) {
      var url = APIurl + "WebserviceCafe.asmx/CreateOrder";
      return $http({
        method: 'GET',
        url: url,
        params: {
          jsonString: c,
          token: localStorage.getItem("accessToken")
        }
      }).then(function successCallback(response) {
        return response.data;
      }, function errorCallback(response) {
        return response.data;
      });
    },
    add: function(item) {
      cart.items.push(item);
      performCalculation();
      persist();
    },
    remove: function(itemID) {
      for (var i = 0; i < cart.items.length; i++) {
        if (cart.items[i].itemID === itemID) {
          cart.items.splice(i, 1);
          performCalculation();
          persist();
          return;
        }
      }
    },
    empty: function() {
      clear();
      persist();
    },
    setDineIn: function(tableNumber) {
      cart.orderType = 'Dine-In';
      cart.tableNumber = tableNumber;
      delete cart.preorderDateTime;
      persist();
    },
    setPreorder: function(datetime) {
      cart.orderType = 'Pre-Order';
      cart.preorderDateTime = datetime;
      delete cart.tableNumber;
      persist();
    },
    setCustId: function(id) {
      cart.custID = id;
      persist();
    },
    isDuplicate: function(itemID) {
      var isDuplicate = false;
      for (var i = 0; i < cart.items.length; i++) {
        if (cart.items[i].itemID === itemID) {
          isDuplicate = true;
          break;
        } else {
          isDuplicate = false;
        }
      };
      return isDuplicate;
    }
  };
});

app.factory('Feedback', function($http, APIurl) {
  return {
    create: function(f) {
      var url = APIurl + "WebserviceCafe.asmx/CreateFeedback";
      return $http.post(url, f);
    }
  };
});

app.factory('MyHistory', function($http, Cart, APIurl, $q, Connection, LatestUpdate, Initialize) {
  return {
    getOrders: function(custId) {
      var deferred = $q.defer();
      var haveInternet = Connection.checkInternet();
      var history = localStorage.getItem('Cache::history');
      if (haveInternet) {
        Initialize.token().then(function(res) {
          console.log(res);
          var url = APIurl + "WebserviceCafe.asmx/retrieveOrderList?";
          return $http({
            method: 'GET',
            url: url + "token=" + localStorage.getItem("accessToken") + "&custID=" + custId,
            dataType: "json",
            contentType: "application/json; charset=utf-8"
          }).then(function successCallback(response) {
            localStorage.setItem('Cache::history', JSON.stringify(response.data));
            console.log("using web service");
            deferred.resolve(response.data);
          }, function errorCallback(response) {
            deferred.resolve(response.data);
          });
        });
      } else {
        if (history == null) {
          deferred.resolve("noInternet");
        } else {
          console.log("using cache");
          deferred.resolve(JSON.parse(history));
        }
      }
      return deferred.promise;
    },
    getOrderItems: function(orderId) {
      var url = APIurl + "WebserviceCafe.asmx/retrieveOrderItemList?";
      return $http({
        method: 'GET',
        url: url + "token=" + localStorage.getItem("accessToken") + "&orderID=" + orderId,
        dataType: "json",
        contentType: "application/json; charset=utf-8"
      }).then(function successCallback(response) {
        return response.data;
      }, function errorCallback() {
        return response.data;
      });
    }
  };
});

app.factory('Promotions', function($http, APIurl, $q, Connection, LatestUpdate, Initialize) {
  return {
    getAll: function() {
      var deferred = $q.defer();
      var haveInternet = Connection.checkInternet();
      var promotion = localStorage.getItem('Cache::promotion');
      var currentDT = localStorage.getItem('promotionLUDT');
      if (haveInternet) {
        Initialize.token().then(function(res) {
          console.log(res);
          LatestUpdate.get().then(function(latestDT) {
            console.log("current: " + currentDT);
            console.log("latest: " + latestDT);
            if (promotion == null || currentDT != latestDT) {
              var url = APIurl + "WebserviceCafe.asmx/retrieveAllPromos?";
              return $http({
                method: 'GET',
                url: url + "token=" + localStorage.getItem("accessToken"),
                dataType: "json",
                contentType: "application/json; charset=utf-8"
              }).then(function successCallback(response) {
                localStorage.setItem('Cache::promotion', JSON.stringify(response.data));
                localStorage.setItem('promotionLUDT', latestDT);
                console.log("using web service");
                deferred.resolve(response.data);
              }, function errorCallback(response) {
                deferred.resolve(response.data);
              });
            } else {
              console.log("using cache");
              deferred.resolve(JSON.parse(promotion));
            }
          });
        });
      } else {
        if (promotion == null) {
          deferred.resolve("noInternet");
        } else {
          console.log("using cache");
          deferred.resolve(JSON.parse(promotion));
        }
      }
      return deferred.promise;
    },
    getAllCombo: function() {
      var url = APIurl + "WebserviceCafe.asmx/retrieveAllCombo?";
      return $http({
        method: 'GET',
        url: url + "token=" + localStorage.getItem("accessToken"),
        dataType: "json",
        contentType: "application/json; charset=utf-8"
      }).then(function successCallback(response) {
        return response.data;
      }, function errorCallback(response) {
        return response.data;
      });
    },
    checkComboStatus: function() {
      var url = APIurl + "WebserviceCafe.asmx/retrieveComboStatus";
      return $http({
        method: 'GET',
        url: url,
        params: {
          token: localStorage.getItem("accessToken")
        }
      }).then(function successCallback(response) {
        return response.data;
      }, function errorCallback(response) {
        return response.data;
      });
    }
  };
});

app.factory('Top10', function($http, APIurl, $q, Connection, LatestUpdate, Initialize) {
  return {
    getFood: function() {
      var deferred = $q.defer();
      var haveInternet = Connection.checkInternet();
      var top10Food = localStorage.getItem('Cache::top10Food');
      var currentDT = localStorage.getItem('top10FoodLUDT');
      if (haveInternet) {
        Initialize.token().then(function(res) {
          console.log(res);
          LatestUpdate.get().then(function(latestDT) {
            console.log("current: " + currentDT);
            console.log("latest: " + latestDT);
            if (top10Food == null || currentDT != latestDT) {
              var url = APIurl + "WebserviceCafe.asmx/retrieveTop10MenuItems?itemCategory=";
              return $http({
                method: 'GET',
                url: url + "food&token=" + localStorage.getItem("accessToken"),
                dataType: "json",
                contentType: "application/json; charset=utf-8"
              }).then(function successCallback(response) {
                localStorage.setItem('Cache::top10Food', JSON.stringify(response.data));
                localStorage.setItem('top10FoodLUDT', latestDT);
                console.log("using web service");
                deferred.resolve(response.data);
              }, function errorCallback(response) {
                deferred.resolve(response.data);
              });
            } else {
              console.log("using cache");
              deferred.resolve(JSON.parse(top10Food));
            }
          });
        });
      } else {
        if (top10Food == null) {
          deferred.resolve("noInternet");
        } else {
          console.log("using cache");
          deferred.resolve(JSON.parse(top10Food));
        }
      }
      return deferred.promise;
    },
    getBeverage: function() {
      var deferred = $q.defer();
      var haveInternet = Connection.checkInternet();
      var top10Beverage = localStorage.getItem('Cache::top10Beverage');
      var currentDT = localStorage.getItem('top10BeverageLUDT');
      if (haveInternet) {
        Initialize.token().then(function(res) {
          console.log(res);
          LatestUpdate.get().then(function(latestDT) {
            console.log("current: " + currentDT);
            console.log("latest: " + latestDT);
            if (top10Beverage == null || currentDT != latestDT) {
              var url = APIurl + "WebserviceCafe.asmx/retrieveTop10MenuItems?itemCategory=";
              return $http({
                method: 'GET',
                url: url + "beverages&token=" + localStorage.getItem("accessToken"),
                dataType: "json",
                contentType: "application/json; charset=utf-8"
              }).then(function successCallback(response) {
                localStorage.setItem('Cache::top10Beverage', JSON.stringify(response.data));
                localStorage.setItem('top10BeverageLUDT', latestDT);
                console.log("using web service");
                deferred.resolve(response.data);
              }, function errorCallback(response) {
                deferred.resolve(response.data);
              });
            } else {
              console.log("using cache");
              deferred.resolve(JSON.parse(top10Beverage));
            }
          });
        });
      } else {
        if (top10Beverage == null) {
          deferred.resolve("noInternet");
        } else {
          console.log("using cache");
          deferred.resolve(JSON.parse(top10Beverage));
        }
      }
      return deferred.promise;
    }
  };
});

app.factory('Favourite', function($http, APIurl, $q, Connection, LatestUpdate, Initialize) {
  return {
    updateFavourites: function(f) {
      var url = APIurl + 'WebserviceCafe.asmx/updateFavourites';
      return $http.post(url, f);
    },
    get: function(id) {
      var deferred = $q.defer();
      var haveInternet = Connection.checkInternet();
      var favourite = localStorage.getItem('Cache::favourite');
      if (haveInternet) {
        Initialize.token().then(function(res) {
          console.log(res);
          var url = APIurl + "WebserviceCafe.asmx/retrieveFav?";
          return $http({
            method: 'GET',
            url: url + "custID=" + id + "&token=" + localStorage.getItem("accessToken"),
            dataType: "json",
            contentType: "application/json; charset=utf-8"
          }).then(function successCallback(response) {
            localStorage.setItem('Cache::favourite', JSON.stringify(response.data));
            console.log("using web service");
            deferred.resolve(response.data);
          }, function errorCallback(response) {
            deferred.resolve(response.data);
          });
        });
      } else {
        if (favourite == null) {
          deferred.resolve("noInternet");
        } else {
          console.log("using cache");
          deferred.resolve(JSON.parse(favourite));
        }
      }
      return deferred.promise;
    }
  };
});

app.factory('Token', function($http, APIurl, Accesskey) {
  return {
    get: function() {
      var url = APIurl + "WebserviceCafe.asmx/getToken?";
      return $http({
        method: 'GET',
        url: url + "accessKey=" + Accesskey,
        dataType: "json",
        contentType: "application/json; charset=utf-8"
      }).then(function successCallback(response) {
        return response.data;
      }, function errorCallback() {
        return response.data;
      });
    },
    checkToken: function(tokenString) {
      var url = APIurl + "WebserviceCafe.asmx/checkToken?";
      return $http({
        method: 'GET',
        url: url + "token=" + tokenString,
        dataType: "json",
        contentType: "application/json; charset=utf-8"
      }).then(function successCallback(response) {
        return response.data;
      }, function errorCallback() {
        return response.data;
      });
    }
  };
});

app.factory('Connection', function($ionicPopup) {

  function popupCheckInternet() {
    $ionicPopup.alert({
      title: 'No connection found',
      subTitle: 'Please check your internet connection and try again later.',
      okType: 'button-assertive'
    }).then(function(res) {
      console.log('No connection found');
    });
  }


  return {
    checkInternet: function() {
      var haveInternet = true;
      if (window.cordova) {
        if (window.Connection) {
          if (navigator.connection.type == Connection.NONE) {
            haveInternet = false;
          }
        }
      }
      console.log("Have Internet: " + haveInternet);

      return haveInternet;
    },
    checkInternetWithPopup: function() {
      var haveInternet = true;
      if (window.cordova) {
        if (window.Connection) {
          if (navigator.connection.type == Connection.NONE) {
            haveInternet = false;
            popupCheckInternet();
          }
        }
      }
      console.log("Have Internet: " + haveInternet);

      return haveInternet;
    }
  };
});

app.factory('LatestUpdate', function($http, APIurl, Accesskey) {
  return {
    get: function() {
      var url = APIurl + "WebserviceCafe.asmx/retrieveLatestDate?";
      return $http({
        method: 'GET',
        url: url + "token=" + localStorage.getItem("accessToken"),
        dataType: "json",
        contentType: "application/json; charset=utf-8"
      }).then(function successCallback(response) {
        return response.data;
      }, function errorCallback() {
        return response.data;
      });
    }
  };
});

app.factory('Initialize', function($http, APIurl, Accesskey, Token, $q) {
  return {
    init: function() {
      var acccountId = localStorage.getItem('accountId');
      var favourite = localStorage.getItem("favouriteItemsID");
      if (acccountId == null) {
        localStorage.setItem('accountId', '');
      }
      if (favourite == null) {
        localStorage.setItem("favouriteItemsID", '');
      }
      console.log("Your token: " + localStorage.getItem("accessToken"));
      console.log("Your id:" + acccountId);
      console.log("foodMenuLUDT:" + localStorage.getItem("foodMenuLUDT"));
      console.log("beverageMenuLUDT:" + localStorage.getItem("beverageMenuLUDT"));
      console.log("specialMenuLUDT:" + localStorage.getItem("specialMenuLUDT"));
      console.log("promotionLUDT:" + localStorage.getItem("promotionLUDT"));
      console.log("top10FoodLUDT:" + localStorage.getItem("top10FoodLUDT"));
      console.log("top10BeverageLUDT:" + localStorage.getItem("top10BeverageLUDT"));
      console.log("openingHoursLUDT:" + localStorage.getItem("openingHoursLUDT"));
      console.log("holidayListLUDT:" + localStorage.getItem("holidayListLUDT"));
      console.log("contactLUDT:" + localStorage.getItem("contactLUDT"));
    },
    token: function() {
      var deferred = $q.defer();
      if (localStorage.getItem("accessToken") == null) {
        Token.get().then(function(response) {
          localStorage.setItem("accessToken", response.token);
          localStorage.setItem("foodMenuLUDT", "");
          localStorage.setItem("beverageMenuLUDT", "");
          localStorage.setItem("specialMenuLUDT", "");
          localStorage.setItem("promotionLUDT", "");
          localStorage.setItem("top10FoodLUDT", "");
          localStorage.setItem("top10BeverageLUDT", "");
          localStorage.setItem("openingHoursLUDT", "");
          localStorage.setItem("holidayListLUDT", "");
          localStorage.setItem("contactLUDT", "");
          console.log("New token: " + localStorage.getItem("accessToken"));
          console.log("Your id:" + localStorage.getItem('accountId'));
          console.log("foodMenuLUDT:" + localStorage.getItem("foodMenuLUDT"));
          console.log("beverageMenuLUDT:" + localStorage.getItem("beverageMenuLUDT"));
          console.log("specialMenuLUDT:" + localStorage.getItem("specialMenuLUDT"));
          console.log("promotionLUDT:" + localStorage.getItem("promotionLUDT"));
          console.log("top10FoodLUDT:" + localStorage.getItem("top10FoodLUDT"));
          console.log("top10BeverageLUDT:" + localStorage.getItem("top10BeverageLUDT"))
          console.log("openingHoursLUDT:" + localStorage.getItem("openingHoursLUDT"));
          console.log("holidayListLUDT:" + localStorage.getItem("holidayListLUDT"));
          console.log("contactLUDT:" + localStorage.getItem("contactLUDT"));
          deferred.resolve("checked");
        });
      } else {
        // if there is a token, check if token is valid
        Token.checkToken(localStorage.getItem("accessToken")).then(function(response) {
          if (response.message == "unsuccessful") {
            Token.get().then(function(response) {
              // not valid
              console.log("Old token: " + response.token);
              localStorage.setItem("accessToken", response.token);
            });
          }
          deferred.resolve("checked");
        });
      }
      return deferred.promise;
    }
  };
});
