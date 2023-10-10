var app = angular.module('myApp', ['ngRoute']);

app.config(function ($routeProvider, $locationProvider) {
    $locationProvider.hashPrefix('');
    $routeProvider
        .when('/Countries', {
            templateUrl: 'views/countries.html',
            controller: 'myController'
        })
        .when('/Country/:countryCode', {
            templateUrl: 'views/country.html',
            controller: 'countryController'
        })
        .otherwise({
            redirectTo: '/Countries'
        });
});

app.service('dataService', function ($http) {
    var data = [];
    this.loadData = function () {
        return $http.get('data/data.json')
            .then(function (response) {
                data = response.data;
                return data;
            });
    };
    this.getData = function () {
        return data;
    };
});

app.controller('styleController', function($scope) {
    $scope.dark = false;
    $scope.darkModeText = "Dark Mode";
    $scope.darkModeIcon = "moon-outline";
    $scope.toggleDarkMode = function() {
        $scope.dark = !$scope.dark;
        if ($scope.dark) {
            $scope.darkModeText = "Light Mode";
            $scope.darkModeIcon = "sunny-outline";
        } else {
            $scope.darkModeText = "Dark Mode";
            $scope.darkModeIcon = "moon-outline";
        }
    };
});


app.controller('myController', function($scope, $http, $location, $filter, dataService) {
    dataService.loadData()
        .then(function(response) {
            $scope.items = dataService.getData();
            $scope.filteredCountries = $scope.items;
            $scope.continents = getUniqueContinents($scope.items);
        })
        .catch(function(error) {
            console.error('Erreur lors de la récupération du JSON :', error);
        });


    function compareByName(a, b) {
        return a.name.localeCompare(b.name);
    }

    function compareByPopulation(a, b) {
        return a.population - b.population;
    }

    $scope.filterByRegion = function(country) {
        return !$scope.selectedRegion || country.region === $scope.selectedRegion;
    };

    $scope.filterBySearchTerm = function(country) {
        if (!$scope.searchTerm || $scope.searchTerm.trim() === "") {
            return true;
        }
        const isMatch = country.name.toLowerCase().includes($scope.searchTerm.toLowerCase());
        return isMatch;
    };

    $scope.updateFilteredCountries = function() {
        if ($scope.items && Array.isArray($scope.items)) {
            $scope.filteredCountries = $scope.items.filter(function(country) {
                return $scope.filterByRegion(country) && $scope.filterBySearchTerm(country);
            });
        }
    };

    $scope.$watchGroup(['searchTerm', 'selectedRegion', 'sortOption'], function() {
        $scope.updateFilteredCountries();
    });

    $scope.viewCountry = function(countryCode) {
        const url = '/Country/' + countryCode;
        $location.path(url);
    };

    function getUniqueContinents(items) {
        const continents = [];
        items.forEach(function(country) {
            if (continents.indexOf(country.region) === -1) {
                continents.push(country.region);
            }
        });
        return continents;
    }
});

app.controller('countryController', function ($scope, $routeParams, $http, $location, dataService) {
    const countryCode = $routeParams.countryCode;
    dataService.loadData()
        .then(function (response) {
            $scope.items = dataService.getData();
            $scope.selectedCountry = $scope.items.find(country => country.alpha3Code === countryCode);
        })
        .catch(function (error) {
            console.error('Erreur lors de la récupération du JSON :', error);
        });

    $scope.getCountryName = function (borderCode) {
        const borderCountry = $scope.items.find(item => item.alpha3Code === borderCode);
        return borderCountry ? borderCountry.name : 'Pays inconnu';
    };

    $scope.goToCountry = function (borderCode) {
        const url = '/Country/' + borderCode;
        $location.path(url);
    };
});

app.controller('returnController', function ($scope, $location) {
    $scope.goToHome = function () {
        $location.path('/Countries');
    };
});
