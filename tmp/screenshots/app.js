var app = angular.module('reportingApp', []);

//<editor-fold desc="global helpers">

var isValueAnArray = function (val) {
    return Array.isArray(val);
};

var getSpec = function (str) {
    var describes = str.split('|');
    return describes[describes.length - 1];
};
var checkIfShouldDisplaySpecName = function (prevItem, item) {
    if (!prevItem) {
        item.displaySpecName = true;
    } else if (getSpec(item.description) !== getSpec(prevItem.description)) {
        item.displaySpecName = true;
    }
};

var getParent = function (str) {
    var arr = str.split('|');
    str = "";
    for (var i = arr.length - 2; i > 0; i--) {
        str += arr[i] + " > ";
    }
    return str.slice(0, -3);
};

var getShortDescription = function (str) {
    return str.split('|')[0];
};

var countLogMessages = function (item) {
    if ((!item.logWarnings || !item.logErrors) && item.browserLogs && item.browserLogs.length > 0) {
        item.logWarnings = 0;
        item.logErrors = 0;
        for (var logNumber = 0; logNumber < item.browserLogs.length; logNumber++) {
            var logEntry = item.browserLogs[logNumber];
            if (logEntry.level === 'SEVERE') {
                item.logErrors++;
            }
            if (logEntry.level === 'WARNING') {
                item.logWarnings++;
            }
        }
    }
};

var defaultSortFunction = function sortFunction(a, b) {
    if (a.sessionId < b.sessionId) {
        return -1;
    }
    else if (a.sessionId > b.sessionId) {
        return 1;
    }

    if (a.timestamp < b.timestamp) {
        return -1;
    }
    else if (a.timestamp > b.timestamp) {
        return 1;
    }

    return 0;
};


//</editor-fold>

app.controller('ScreenshotReportController', function ($scope, $http) {
    var that = this;
    var clientDefaults = {};

    $scope.searchSettings = Object.assign({
        description: '',
        allselected: true,
        passed: true,
        failed: true,
        pending: true,
        withLog: true
    }, clientDefaults.searchSettings || {}); // enable customisation of search settings on first page hit

    var initialColumnSettings = clientDefaults.columnSettings; // enable customisation of visible columns on first page hit
    if (initialColumnSettings) {
        if (initialColumnSettings.displayTime !== undefined) {
            // initial settings have be inverted because the html bindings are inverted (e.g. !ctrl.displayTime)
            this.displayTime = !initialColumnSettings.displayTime;
        }
        if (initialColumnSettings.displayBrowser !== undefined) {
            this.displayBrowser = !initialColumnSettings.displayBrowser; // same as above
        }
        if (initialColumnSettings.displaySessionId !== undefined) {
            this.displaySessionId = !initialColumnSettings.displaySessionId; // same as above
        }
        if (initialColumnSettings.displayOS !== undefined) {
            this.displayOS = !initialColumnSettings.displayOS; // same as above
        }
        if (initialColumnSettings.inlineScreenshots !== undefined) {
            this.inlineScreenshots = initialColumnSettings.inlineScreenshots; // this setting does not have to be inverted
        } else {
            this.inlineScreenshots = false;
        }
    }

    this.showSmartStackTraceHighlight = true;

    this.chooseAllTypes = function () {
        var value = true;
        $scope.searchSettings.allselected = !$scope.searchSettings.allselected;
        if (!$scope.searchSettings.allselected) {
            value = false;
        }

        $scope.searchSettings.passed = value;
        $scope.searchSettings.failed = value;
        $scope.searchSettings.pending = value;
        $scope.searchSettings.withLog = value;
    };

    this.isValueAnArray = function (val) {
        return isValueAnArray(val);
    };

    this.getParent = function (str) {
        return getParent(str);
    };

    this.getSpec = function (str) {
        return getSpec(str);
    };

    this.getShortDescription = function (str) {
        return getShortDescription(str);
    };

    this.convertTimestamp = function (timestamp) {
        var d = new Date(timestamp),
            yyyy = d.getFullYear(),
            mm = ('0' + (d.getMonth() + 1)).slice(-2),
            dd = ('0' + d.getDate()).slice(-2),
            hh = d.getHours(),
            h = hh,
            min = ('0' + d.getMinutes()).slice(-2),
            ampm = 'AM',
            time;

        if (hh > 12) {
            h = hh - 12;
            ampm = 'PM';
        } else if (hh === 12) {
            h = 12;
            ampm = 'PM';
        } else if (hh === 0) {
            h = 12;
        }

        // ie: 2013-02-18, 8:35 AM
        time = yyyy + '-' + mm + '-' + dd + ', ' + h + ':' + min + ' ' + ampm;

        return time;
    };


    this.round = function (number, roundVal) {
        return (parseFloat(number) / 1000).toFixed(roundVal);
    };


    this.passCount = function () {
        var passCount = 0;
        for (var i in this.results) {
            var result = this.results[i];
            if (result.passed) {
                passCount++;
            }
        }
        return passCount;
    };


    this.pendingCount = function () {
        var pendingCount = 0;
        for (var i in this.results) {
            var result = this.results[i];
            if (result.pending) {
                pendingCount++;
            }
        }
        return pendingCount;
    };


    this.failCount = function () {
        var failCount = 0;
        for (var i in this.results) {
            var result = this.results[i];
            if (!result.passed && !result.pending) {
                failCount++;
            }
        }
        return failCount;
    };

    this.passPerc = function () {
        return (this.passCount() / this.totalCount()) * 100;
    };
    this.pendingPerc = function () {
        return (this.pendingCount() / this.totalCount()) * 100;
    };
    this.failPerc = function () {
        return (this.failCount() / this.totalCount()) * 100;
    };
    this.totalCount = function () {
        return this.passCount() + this.failCount() + this.pendingCount();
    };

    this.applySmartHighlight = function (line) {
        if (this.showSmartStackTraceHighlight) {
            if (line.indexOf('node_modules') > -1) {
                return 'greyout';
            }
            if (line.indexOf('  at ') === -1) {
                return '';
            }

            return 'highlight';
        }
        return true;
    };

    var results = [
    {
        "description": "should create a productmeat|productTests",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "sessionId": "bca5cabea734d4faf34590c9587fdd76",
        "instanceId": 9644,
        "browser": {
            "name": "chrome",
            "version": "72.0.3626.119"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "007f0087-00ed-0088-0089-0096001800d7.png",
        "timestamp": 1551967930368,
        "duration": 5510
    },
    {
        "description": "should create a productvegetables|productTests",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "sessionId": "bca5cabea734d4faf34590c9587fdd76",
        "instanceId": 9644,
        "browser": {
            "name": "chrome",
            "version": "72.0.3626.119"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "002f0025-00ab-0022-00e8-006f00de00f6.png",
        "timestamp": 1551967937477,
        "duration": 4137
    },
    {
        "description": "should create a productbread|productTests",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "sessionId": "bca5cabea734d4faf34590c9587fdd76",
        "instanceId": 9644,
        "browser": {
            "name": "chrome",
            "version": "72.0.3626.119"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "009a0069-00f4-007e-00ac-00b4009d0027.png",
        "timestamp": 1551967941968,
        "duration": 3486
    },
    {
        "description": "should create a productpasta|productTests",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "sessionId": "bca5cabea734d4faf34590c9587fdd76",
        "instanceId": 9644,
        "browser": {
            "name": "chrome",
            "version": "72.0.3626.119"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00450010-0040-0007-0075-00b400d100e2.png",
        "timestamp": 1551967945767,
        "duration": 3443
    },
    {
        "description": "should create a productmeat|productTests",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "sessionId": "250099f7da558ab44e80b812ad2d2ee2",
        "instanceId": 12964,
        "browser": {
            "name": "chrome",
            "version": "72.0.3626.119"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "008300bf-0093-00b2-0005-00c100f40050.png",
        "timestamp": 1551968271626,
        "duration": 4731
    },
    {
        "description": "should create a productvegetables|productTests",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "sessionId": "250099f7da558ab44e80b812ad2d2ee2",
        "instanceId": 12964,
        "browser": {
            "name": "chrome",
            "version": "72.0.3626.119"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00dd0010-0086-0096-0084-002800230032.png",
        "timestamp": 1551968277258,
        "duration": 3465
    },
    {
        "description": "should create a productbread|productTests",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "sessionId": "250099f7da558ab44e80b812ad2d2ee2",
        "instanceId": 12964,
        "browser": {
            "name": "chrome",
            "version": "72.0.3626.119"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "006800a6-001a-0028-0039-002b00990019.png",
        "timestamp": 1551968281031,
        "duration": 2842
    },
    {
        "description": "should create a productpasta|productTests",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "sessionId": "250099f7da558ab44e80b812ad2d2ee2",
        "instanceId": 12964,
        "browser": {
            "name": "chrome",
            "version": "72.0.3626.119"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00eb00fe-00c2-0018-0084-007a00a400d1.png",
        "timestamp": 1551968284183,
        "duration": 3180
    },
    {
        "description": "should create a productmeat|productTests",
        "passed": true,
        "pending": false,
        "sessionId": "3897f429-9d84-4f53-a27c-41aa9538a4e9",
        "instanceId": 8204,
        "browser": {
            "name": "firefox"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00650014-0032-00aa-00be-001800a5008f.png",
        "timestamp": 1551968409291,
        "duration": 7092
    },
    {
        "description": "should create a productvegetables|productTests",
        "passed": true,
        "pending": false,
        "sessionId": "3897f429-9d84-4f53-a27c-41aa9538a4e9",
        "instanceId": 8204,
        "browser": {
            "name": "firefox"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00ca0039-00cb-00df-008f-007f006400ef.png",
        "timestamp": 1551968417135,
        "duration": 6398
    },
    {
        "description": "should create a productbread|productTests",
        "passed": true,
        "pending": false,
        "sessionId": "3897f429-9d84-4f53-a27c-41aa9538a4e9",
        "instanceId": 8204,
        "browser": {
            "name": "firefox"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "0002009e-0075-0050-00a0-00ed0071005b.png",
        "timestamp": 1551968423671,
        "duration": 6396
    },
    {
        "description": "should create a productpasta|productTests",
        "passed": true,
        "pending": false,
        "sessionId": "3897f429-9d84-4f53-a27c-41aa9538a4e9",
        "instanceId": 8204,
        "browser": {
            "name": "firefox"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00df003e-00b7-00ce-0094-007500410079.png",
        "timestamp": 1551968430201,
        "duration": 6818
    },
    {
        "description": "should create a productmeat|productTests",
        "passed": true,
        "pending": false,
        "sessionId": "8c61a4cf-91fd-41f5-a698-65bbc639bb88",
        "instanceId": 17648,
        "browser": {
            "name": "firefox"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00840092-00d6-0048-002d-001800d40054.png",
        "timestamp": 1551968548178,
        "duration": 6625
    },
    {
        "description": "should create a productvegetables|productTests",
        "passed": true,
        "pending": false,
        "sessionId": "8c61a4cf-91fd-41f5-a698-65bbc639bb88",
        "instanceId": 17648,
        "browser": {
            "name": "firefox"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "004e009d-00d4-00bd-003a-0062003400fb.png",
        "timestamp": 1551968555667,
        "duration": 6446
    },
    {
        "description": "should create a productbread|productTests",
        "passed": true,
        "pending": false,
        "sessionId": "8c61a4cf-91fd-41f5-a698-65bbc639bb88",
        "instanceId": 17648,
        "browser": {
            "name": "firefox"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00f900f8-0034-007e-00ad-00cc00f60060.png",
        "timestamp": 1551968562245,
        "duration": 5795
    },
    {
        "description": "should create a productpasta|productTests",
        "passed": true,
        "pending": false,
        "sessionId": "8c61a4cf-91fd-41f5-a698-65bbc639bb88",
        "instanceId": 17648,
        "browser": {
            "name": "firefox"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "002c00bf-00ee-00b4-00ad-003b00dc006a.png",
        "timestamp": 1551968568165,
        "duration": 6417
    },
    {
        "description": "should create a productmeat|productTests",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "sessionId": "6120a3e9e413e8e6a8aef72d886550c4",
        "instanceId": 18420,
        "browser": {
            "name": "chrome",
            "version": "72.0.3626.119"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00de00bc-00e6-002f-0038-008600d300d4.png",
        "timestamp": 1551968761011,
        "duration": 6169
    },
    {
        "description": "should create a productmeat|productTests",
        "passed": true,
        "pending": false,
        "sessionId": "448587f9-300a-4647-ae0b-d1609cb4f431",
        "instanceId": 18240,
        "browser": {
            "name": "firefox"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "0014007a-0077-0007-000d-006b001600ed.png",
        "timestamp": 1551968765169,
        "duration": 7393
    },
    {
        "description": "should create a productvegetables|productTests",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "sessionId": "6120a3e9e413e8e6a8aef72d886550c4",
        "instanceId": 18420,
        "browser": {
            "name": "chrome",
            "version": "72.0.3626.119"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "0077003a-00db-00ae-00b0-00be00d000f4.png",
        "timestamp": 1551968768165,
        "duration": 4481
    },
    {
        "description": "should create a productbread|productTests",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "sessionId": "6120a3e9e413e8e6a8aef72d886550c4",
        "instanceId": 18420,
        "browser": {
            "name": "chrome",
            "version": "72.0.3626.119"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "004200a7-00ec-0086-003c-0048009d009c.png",
        "timestamp": 1551968772961,
        "duration": 3565
    },
    {
        "description": "should create a productvegetables|productTests",
        "passed": true,
        "pending": false,
        "sessionId": "448587f9-300a-4647-ae0b-d1609cb4f431",
        "instanceId": 18240,
        "browser": {
            "name": "firefox"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00d6009c-009c-002b-00af-002d008400bc.png",
        "timestamp": 1551968773332,
        "duration": 7177
    },
    {
        "description": "should create a productpasta|productTests",
        "passed": true,
        "pending": false,
        "os": "Windows NT",
        "sessionId": "6120a3e9e413e8e6a8aef72d886550c4",
        "instanceId": 18420,
        "browser": {
            "name": "chrome",
            "version": "72.0.3626.119"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "005900d2-0050-007d-00cb-007200d70083.png",
        "timestamp": 1551968776866,
        "duration": 3756
    },
    {
        "description": "should create a productbread|productTests",
        "passed": true,
        "pending": false,
        "sessionId": "448587f9-300a-4647-ae0b-d1609cb4f431",
        "instanceId": 18240,
        "browser": {
            "name": "firefox"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00e00066-002c-00b6-00bf-0094006b006c.png",
        "timestamp": 1551968780659,
        "duration": 6065
    },
    {
        "description": "should create a productpasta|productTests",
        "passed": true,
        "pending": false,
        "sessionId": "448587f9-300a-4647-ae0b-d1609cb4f431",
        "instanceId": 18240,
        "browser": {
            "name": "firefox"
        },
        "message": "Passed.",
        "trace": "",
        "browserLogs": [],
        "screenShotFile": "00f400d8-00ab-00be-00c7-003f001500cc.png",
        "timestamp": 1551968786854,
        "duration": 6789
    }
];

    this.sortSpecs = function () {
        this.results = results.sort(function sortFunction(a, b) {
    if (a.sessionId < b.sessionId) return -1;else if (a.sessionId > b.sessionId) return 1;

    if (a.timestamp < b.timestamp) return -1;else if (a.timestamp > b.timestamp) return 1;

    return 0;
});
    };

    this.loadResultsViaAjax = function () {

        $http({
            url: './combined.json',
            method: 'GET'
        }).then(function (response) {
                var data = null;
                if (response && response.data) {
                    if (typeof response.data === 'object') {
                        data = response.data;
                    } else if (response.data[0] === '"') { //detect super escaped file (from circular json)
                        data = CircularJSON.parse(response.data); //the file is escaped in a weird way (with circular json)
                    }
                    else
                    {
                        data = JSON.parse(response.data);
                    }
                }
                if (data) {
                    results = data;
                    that.sortSpecs();
                }
            },
            function (error) {
                console.error(error);
            });
    };


    if (clientDefaults.useAjax) {
        this.loadResultsViaAjax();
    } else {
        this.sortSpecs();
    }


});

app.filter('bySearchSettings', function () {
    return function (items, searchSettings) {
        var filtered = [];
        if (!items) {
            return filtered; // to avoid crashing in where results might be empty
        }
        var prevItem = null;

        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            item.displaySpecName = false;

            var isHit = false; //is set to true if any of the search criteria matched
            countLogMessages(item); // modifies item contents

            var hasLog = searchSettings.withLog && item.browserLogs && item.browserLogs.length > 0;
            if (searchSettings.description === '' ||
                (item.description && item.description.toLowerCase().indexOf(searchSettings.description.toLowerCase()) > -1)) {

                if (searchSettings.passed && item.passed || hasLog) {
                    isHit = true;
                } else if (searchSettings.failed && !item.passed && !item.pending || hasLog) {
                    isHit = true;
                } else if (searchSettings.pending && item.pending || hasLog) {
                    isHit = true;
                }
            }
            if (isHit) {
                checkIfShouldDisplaySpecName(prevItem, item);

                filtered.push(item);
                prevItem = item;
            }
        }

        return filtered;
    };
});

