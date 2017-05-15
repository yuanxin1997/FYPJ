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



$scope.noInternet = false;

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

$scope.reconnect = function() {
  getData();
};
