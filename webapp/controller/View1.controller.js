sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "../utils/formatter",
    "com/levi/businesshealthcheck/utils/Chart.min"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, Filter, FilterOperator, formatter) {
        "use strict";

        return Controller.extend("com.levi.businesshealthcheck.controller.View1", {
            formatter: formatter,
            onInit: function () {
                var oRootPath = jQuery.sap.getModulePath("com.levi.businesshealthcheck", "/img/levi.gif");
                var oImageModel = new JSONModel({
                    path: oRootPath,
                });
                this.getView().setModel(oImageModel, "imageModel");
                this.oBusyDailog = new sap.m.BusyDialog({ customIcon: this.getView().getModel("imageModel").getData().path, customIconRotationSpeed: 0, customIconWidth: '120px', customIconHeight: '45px' }).addStyleClass("sapUiPopupWithoutPadding");
                var oModel = new JSONModel({
                    "OptionIcon": "sap-icon://drill-up",
                    "Amount": "17.61",
                    "Currency": "USD",
                    "Trend": "",
                    "TrendOrders": "sap-icon://trend-up",
                    "TrendValue": "",
                    "TrendValueOrders": "23",
                    "TrendPercentage": "",
                    "TrendPercentageOrders": "(12%)",
                    "TrendSymbol": "",
                    "TrendSymbolOrders": "+",
                    "High": "",
                    "Low": "",
                    "OpenOrders": "3254",
                    "CloseOrders": "3280",
                    "HighOrders": "1338",
                    "LowOrders": "1239",
                    "VolumeOrders": "1.72M",
                    "MarketSummary": "https://www.google.com/finance/?rlz=1C1GCEA_enIN919IN919&oq=Levi+share&aqs=chrome..69i57j0i512l3j0i22i30i625j69i65l2j69i60.4272j0j7&sourceid=chrome&ie=UTF-8&sa=X&ved=2ahUKEwiNg_PMvrf9AhWEIH0KHbDvDqwQ6M8CegQIKhAI"
                });
                this.getOwnerComponent().setModel(oModel, "ViewModel");
            },
            onRender: function () {
                var oViewModel = this.getOwnerComponent().getModel("ViewModel");
                this.oBusyDailog.open();
                jQuery.ajax({
                    type: "GET",
                    contentType: "application/json",
                    url: "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=LEVI&apikey=OCV4IKN7H0A0BM12",
                    dataType: "json",
                    async: false,
                    success: function (data, textStatus, jqXHR) {
                        if (data['Time Series (Daily)'] === undefined || data['Time Series (Daily)'] === null || data['Time Series (Daily)'] === "") {
                            this.oBusyDailog.close();
                            this._somethingWentWrong("Home", data.Note);
                            return;
                        }
                        var sLabel = "";
                        var akeys = Object.keys(data['Time Series (Daily)']);
                        var aMonth = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                        var aLabels = [],
                            aValues = [],
                            iHigh = parseFloat(data['Time Series (Daily)'][akeys[0]]['2. high']),
                            iLow = parseFloat(data['Time Series (Daily)'][akeys[0]]['3. low']),
                            sTrend = parseFloat(data['Time Series (Daily)'][akeys[0]]['1. open']) > parseFloat(data['Time Series (Daily)'][akeys[1]]['1. open']) ? 'sap-icon://trend-up' : 'sap-icon://trend-down',
                            iTrendValue = Math.abs(parseFloat(data['Time Series (Daily)'][akeys[0]]['1. open']) - parseFloat(data['Time Series (Daily)'][akeys[1]]['1. open'])).toFixed(2),
                            iTrendSymbol = parseFloat(data['Time Series (Daily)'][akeys[0]]['1. open']) > parseFloat(data['Time Series (Daily)'][akeys[1]]['1. open']) ? '+' : '-',
                            sPercentageChange = "";
                        if (iTrendSymbol === "+") {
                            sPercentageChange = ((parseFloat(data['Time Series (Daily)'][akeys[0]]['1. open']) - parseFloat(data['Time Series (Daily)'][akeys[1]]['1. open'])) / parseFloat(data['Time Series (Daily)'][akeys[1]]['1. open'])) * 100;
                        } else {
                            sPercentageChange = ((parseFloat(data['Time Series (Daily)'][akeys[1]]['1. open']) - parseFloat(data['Time Series (Daily)'][akeys[0]]['1. open'])) / parseFloat(data['Time Series (Daily)'][akeys[1]]['1. open'])) * 100;
                        }
                        oViewModel.setProperty("/High", iHigh);
                        oViewModel.setProperty("/Low", iLow);
                        oViewModel.setProperty("/Trend", sTrend);
                        oViewModel.setProperty("/TrendValue", iTrendValue);
                        oViewModel.setProperty("/TrendSymbol", iTrendSymbol);
                        oViewModel.setProperty("/TrendPercentage", "(" + sPercentageChange.toFixed(2) + "%)");
                        for (var i = 0; i < 7; i++) {
                            aLabels.push(akeys[i].split("-")[2] + " " + aMonth[parseFloat(akeys[i].split("-")[1])]);
                            // aLabels.push(akeys[i]);
                            aValues.push(parseFloat(data['Time Series (Daily)'][akeys[i]]['1. open']));
                        }
                        // var aData = Object.keys(data['Time Series (Daily)']).map((key) => data['Time Series (Daily)'][key]);
                        var ctx = document.getElementById('HomePageTrendChart').getContext('2d');
                        Chart.defaults.global.defaultFontColor = '#ffffff';
                        this.trendChart = new Chart(ctx, {
                            type: 'line',
                            data: {
                                labels: aLabels,
                                datasets: [{
                                    label: sLabel,
                                    data: aValues,
                                    backgroundColor: [
                                        // 'transparent'
                                        // 'rgba(255, 99, 132, 0.2)'
                                        // 'rgba(54, 162, 235, 0.2)'
                                        // 'rgba(255, 206, 86, 0.2)'
                                        // 'rgba(75, 192, 192, 0.2)'
                                        'rgba(153, 102, 255, 0.2)'
                                        // 'rgba(255, 159, 64, 0.2)'
                                    ],
                                    borderColor: [
                                        '#ffffff'
                                        // 'rgba(255, 99, 132, 1)',
                                        // 'rgba(54, 162, 235, 1)',
                                        // 'rgba(255, 206, 86, 1)',
                                        // 'rgba(75, 192, 192, 1)',
                                        // 'rgba(153, 102, 255, 1)',
                                        // 'rgba(255, 159, 64, 1)'
                                    ],
                                    borderWidth: 2
                                }]
                            },
                            options: {
                                scales: {
                                    y: {
                                        beginAtZero: true
                                    }
                                },
                                legend: { display: 0, position: "right" }
                            }
                        });

                        this.oBusyDailog.close();
                    }.bind(this)
                });
            },
            onMenuPress: function (oEvt) {
                if (!this._oMenuDlg) {
                    this._oMenuDlg = sap.ui.xmlfragment("idMenuDlg", "com.levi.businesshealthcheck.view.fragments.Menu", this);
                    this.getView().addDependent(this._oMenuDlg);
                }
                this._oMenuDlg.openBy(oEvt.getSource());
            },
            onSelectMenuItem: function (oEvt) {
                var sKey = oEvt.getParameter("listItem").getCustomData()[0].getValue();
                if (sKey === "Home") {
                    this.onHomePress();
                } else if (sKey === "Sales") {
                    this.onDailySalesPress();
                } else if (sKey === "Orders") {
                    this.onDailyOrdersPress();
                }
                this._oMenuDlg.close();
                //  else if (sKey === "MarketSummary") {

                // } else if (sKey === "Newsletter") {

                // }
            },
            onHomePress: function () {
                var oNavContainer = this.getView().byId("idNavContainer");
                oNavContainer.to(this.getView().byId("idHomePage"), "slide");
            },
            onDailySalesPress: function () {
                var oNavContainer = this.getView().byId("idNavContainer");
                oNavContainer.to(this.getView().byId("idDailySales"), "slide");
                this.onRenderDailySalesChart1();
                this.onRenderDailySalesChart2();
            },
            onDailyOrdersPress: function () {
                var oNavContainer = this.getView().byId("idNavContainer");
                oNavContainer.to(this.getView().byId("idDailyOrders"), "slide");
                this.onRenderDailyOrdersChart1();
                this.onRenderDailyOrdersChart2();
            },
            onRenderDailyOrdersChart1: function () {
                var ctx = document.getElementById('DailyOrdersDoughnutChart').getContext('2d');
                Chart.defaults.global.defaultFontColor = '#000000';
                this.dailyOrdersChart1 = new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: ["LSA", "LSE", "AMA"],
                        datasets: [{
                            label: "By Channel",
                            data: [45, 60, 30],
                            backgroundColor: [
                                'rgba(255, 99, 132, 0.8)',
                                'rgba(54, 162, 235, 0.8)',
                                'rgba(255, 206, 86, 0.8)'
                            ],
                            borderColor: [
                                '#e5e5e5'
                            ],
                            borderWidth: 2
                        }]
                    },
                    options: {
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        },
                        legend: { display: !0, position: "right" }
                    }
                });
            },
            onRenderDailyOrdersChart2: function () {
                var ctx = document.getElementById('DailyOrdersLineChart').getContext('2d');
                Chart.defaults.global.defaultFontColor = '#000000';
                this.dailyOrdersChart1 = new Chart(ctx, {
                    type: 'line',
                    data: {
                        datasets: [{
                            label: 'LSA',
                            data: [20, 35, 15, 45, 55],
                            type: 'line',
                            backgroundColor: [
                                'transparent'
                                // 'rgba(255, 99, 132, 0.8)'
                            ],
                            borderColor: [
                                'rgba(255, 99, 132, 0.8)'
                            ],
                            borderWidth: 1
                        }, {
                            label: 'LSE',
                            data: [45, 15, 30, 35, 10],
                            type: 'line',
                            backgroundColor: [
                                'transparent'
                                // 'rgba(54, 162, 235, 0.8)'
                            ],
                            borderColor: [
                                'rgba(54, 162, 235, 0.8)'
                            ],
                            borderWidth: 1
                        }, {
                            label: 'AMA',
                            data: [10, 15, 40, 25, 35],
                            type: 'line',
                            backgroundColor: [
                                'transparent'
                                // 'rgba(255, 206, 86, 0.8)'
                            ],
                            borderColor: [
                                'rgba(255, 206, 86, 0.8)'
                            ],
                            borderWidth: 1
                        }
                        ],
                        labels: ['Day-4', 'Day-3', 'Day-2', 'Day-1', 'Day-0']
                    },
                    options: {
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        },
                        legend: { display: !0, position: "bottom" }
                    }
                });
            },
            onRenderDailySalesChart1: function () {
                var ctx = document.getElementById('DailySalesBarChart').getContext('2d');
                Chart.defaults.global.defaultFontColor = '#000000';
                this.dailySalesChart1 = new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: ["LSA", "LSE", "AMA"],
                        datasets: [{
                            label: "By Market",
                            data: [45, 25, 30],
                            backgroundColor: [
                                'rgba(255, 99, 132, 0.8)',
                                'rgba(54, 162, 235, 0.8)',
                                'rgba(255, 206, 86, 0.8)'
                            ],
                            borderColor: [
                                '#e5e5e5'
                            ],
                            borderWidth: 2
                        }]
                    },
                    options: {
                        scales: {
                            // x: {
                            //     beginAtZero: true
                            // },
                            y: {
                                beginAtZero: true,
                                min: 0
                            }
                        },

                        legend: { display: !0, position: "right" }
                    }

                });
            },
            onRenderDailySalesChart2: function () {
                var ctx = document.getElementById('DailySalesLineChart').getContext('2d');
                Chart.defaults.global.defaultFontColor = '#000000';
                this.dailySalesChart2 = new Chart(ctx, {
                    type: 'line',
                    data: {
                        datasets: [{
                            label: 'LSA',
                            data: [20, 35, 15, 45, 55],
                            type: 'line',
                            backgroundColor: [
                                'transparent'
                            ],
                            borderColor: [
                                'rgba(255, 99, 132, 0.8)'
                            ],
                            borderWidth: 1
                        }, {
                            label: 'LSE',
                            data: [45, 15, 30, 35, 10],
                            type: 'line',
                            backgroundColor: [
                                'transparent'
                            ],
                            borderColor: [
                                'rgba(54, 162, 235, 0.8)'
                            ],
                            borderWidth: 1
                        }, {
                            label: 'AMA',
                            data: [10, 15, 40, 25, 35],
                            type: 'line',
                            backgroundColor: [
                                'transparent'
                            ],
                            borderColor: [
                                'rgba(255, 206, 86, 0.8)'
                            ],
                            borderWidth: 1
                        }
                        ],
                        labels: ['Day-4', 'Day-3', 'Day-2', 'Day-1', 'Day-0']
                    },
                    options: {
                        scales: {
                            yAxes: [{
                                ticks: {
                                    beginAtZero: true
                                }
                            }],
                            xAxes: [{
                                ticks: {
                                    beginAtZero: true
                                }
                            }]
                        },
                        legend: { display: !0, position: "bottom" }
                    }
                });
            },
            _setTrendStyleClass: function (sVBoxId, sTrend) {
                if (sTrend === "Up") {
                    this.getView().byId(sVBoxId).removeStyleClass("vboxOrdersDown")
                    this.getView().byId(sVBoxId).addStyleClass("vboxOrdersUp")
                } else {
                    this.getView().byId(sVBoxId).removeStyleClass("vboxOrdersUp")
                    this.getView().byId(sVBoxId).addStyleClass("vboxOrdersDown")
                }
            },
            onFilterIconPress: function (oEvt) {
                if (!this._oFilterDlg) {
                    this._oFilterDlg = sap.ui.xmlfragment("idFilterDlg", "com.levi.businesshealthcheck.view.fragments.Filter", this);
                    this.getView().addDependent(this._oFilterDlg);
                }
                this._oFilterDlg.open();

            },
            onAfterFilterOpen: function (oEvt) {
                var oSelect = sap.ui.core.Fragment.byId("idFilterDlg", "idSelectCriteria2");
                var sKey = sap.ui.core.Fragment.byId("idFilterDlg", "idSelectCriteria1").getSelectedKey();
                var oFilter = new Filter("Type", FilterOperator.EQ, sKey);
                oSelect.getBinding("items").filter(oFilter);
            },
            onOption1Change: function (oEvt) {
                var oSelect = sap.ui.core.Fragment.byId("idFilterDlg", "idSelectCriteria2"),
                    oFilter = new Filter("Type", FilterOperator.EQ, oEvt.getSource().getSelectedKey());
                oSelect.getBinding("items").filter(oFilter);
            },
            onApplyFilter: function (oEvt) {
                var sSelectCriteria1 = sap.ui.core.Fragment.byId("idFilterDlg", "idSelectCriteria1").getSelectedItem().getText();
                if (sap.ui.core.Fragment.byId("idFilterDlg", "idSelectCriteria2").getSelectedKey() === '') {
                    this._refreshDailySalesChart("ByMarketOnly");
                    this.getOwnerComponent().getModel("ApplicationModel").setProperty("/DailySalesBreadCrumbs", {
                        "CurrentLocation": sSelectCriteria1,
                        "Links": [{
                            "Name": "Daily Sales"
                        }]
                    });
                } else {
                    this._refreshDailySalesChart("ByMarketCompleteSelection");
                    var sSelectCriteria2 = sap.ui.core.Fragment.byId("idFilterDlg", "idSelectCriteria2").getSelectedItem().getText();
                    this.getOwnerComponent().getModel("ApplicationModel").setProperty("/DailySalesBreadCrumbs", {
                        "CurrentLocation": "By Region",
                        "Links": [{
                            "Name": "Daily Sales"
                        }, {
                            "Name": sSelectCriteria1
                        }, {
                            "Name": sSelectCriteria2
                        }]
                    });
                }
                this._oFilterDlg.close();
            },
            onFilterCancel: function (oEvt) {
                this._oFilterDlg.close();
            },
            onSelectOption: function (oEvt) {
                var sTitle = oEvt.getSource().getTitle();
                // this._oOptionDlg.close();
                // this.oBusyDailog.open();
                var oNavContainer = sap.ui.core.Fragment.byId("idOptionDlg", "idOptionsNavContainer");
                if (sTitle === "By Markets") {
                    oNavContainer.to(sap.ui.core.Fragment.byId("idOptionDlg", "idOptionByMarket"), "flip");
                } else {
                    oNavContainer.to(sap.ui.core.Fragment.byId("idOptionDlg", "idOptionByChannels"), "flip");
                }
                // jQuery.sap.delayedCall(3000, this, function () {
                //     this.getView().byId("idOptionSales").setText("Showing: " + sTitle);
                //     this.getView().byId("idOptionOrders").setText("Showing: " + sTitle);
                //     this.oBusyDailog.close();
                // });
            },
            onNavBackToSelectOption: function () {
                var oNavContainer = sap.ui.core.Fragment.byId("idOptionDlg", "idOptionsNavContainer");
                oNavContainer.back();
            },
            onSelectOptionByMarket: function (oEvt) {
                var sTitle = oEvt.getSource().getTitle();
                this._oOptionDlg.close();
                this.oBusyDailog.open();
                jQuery.sap.delayedCall(3000, this, function () {
                    this.getView().byId("idOptionSales").setText("Showing: " + sTitle);
                    this.getView().byId("idOptionOrders").setText("Showing: " + sTitle);
                    this.oBusyDailog.close();
                });
            },
            _somethingWentWrong: function (sPage, sErrorText) {
                if (!this._oIssuePopup) {
                    this._oIssuePopup = sap.ui.xmlfragment("idIssuePopup", "com.levi.businesshealthcheck.view.fragments.IssuePopup", this);
                    this.getView().addDependent(this._oIssuePopup);
                }
                this._oIssuePopup.data("Key", sPage);
                this.getOwnerComponent().getModel("ViewModel").setProperty("/SomethingWentWrong", sErrorText);
                this._oIssuePopup.open();
            },
            onRefreshChartData: function (oEvt) {
                this._oIssuePopup.close();
                if (this._oIssuePopup.data("Key") === "Home") {
                    this.onRender();
                } else if (this._oIssuePopup.data("Key") === "DailyOrdersChart1") {
                    this.onRenderDailyOrdersChart1();
                } else if (this._oIssuePopup.data("Key") === "DailyOrdersChart2") {
                    this.onRenderDailyOrdersChart2();
                } else if (this._oIssuePopup.data("Key") === "DailySalesChart1") {
                    this.onRenderDailySalesChart1();
                } else if (this._oIssuePopup.data("Key") === "DailySalesChart2") {
                    this.onRenderDailySalesChart2();
                }
            },
            _refreshDailySalesChart: function (sParam) {
                if (sParam === "ByMarketOnly") {
                    // Filter selection is By Market only
                    // for bar chart to doughnut - Upper Chart
                    this.dailySalesChart1.data.labels = [];
                    this.dailySalesChart1.data.datasets = [];
                    this.dailySalesChart1.data.labels = ["LSA", "LSE", "AMA"];
                    this.dailySalesChart1.data.datasets.push({
                        label: "By Market",
                        data: [45, 25, 30],
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.8)',
                            'rgba(54, 162, 235, 0.8)',
                            'rgba(255, 206, 86, 0.8)',
                            'rgba(215, 14, 18, 0.8)',
                            'rgba(38, 167, 67, 0.8)'
                        ],
                        borderColor: [
                            '#e5e5e5'
                        ],
                        borderWidth: 2
                    });
                    this.dailySalesChart1.config.type = 'doughnut';
                    delete this.dailySalesChart1.config.options.scales.yAxes;
                    delete this.dailySalesChart1.config.options.scales.xAxes;

                    // For line chart - Lower Chart
                    this.dailySalesChart2.data.datasets = [];
                    this.dailySalesChart2.data.datasets = [{
                        label: 'LSA',
                        data: [20, 35, 15, 45, 55],
                        type: 'line',
                        backgroundColor: [
                            'transparent'
                        ],
                        borderColor: [
                            'rgba(255, 99, 132, 0.8)'
                        ],
                        borderWidth: 1
                    }, {
                        label: 'LSE',
                        data: [45, 15, 30, 35, 10],
                        type: 'line',
                        backgroundColor: [
                            'transparent'
                        ],
                        borderColor: [
                            'rgba(54, 162, 235, 0.8)'
                        ],
                        borderWidth: 1
                    }, {
                        label: 'AMA',
                        data: [10, 15, 40, 25, 35],
                        type: 'line',
                        backgroundColor: [
                            'transparent'
                        ],
                        borderColor: [
                            'rgba(255, 206, 86, 0.8)'
                        ],
                        borderWidth: 1
                    }];


                } else {
                    // for doughnut chart to bar -  Upper Chart
                    this.dailySalesChart1.data.labels = [];
                    this.dailySalesChart1.data.datasets = [];
                    this.dailySalesChart1.data.labels = ["East", "West", "North", "South", "Central"];
                    this.dailySalesChart1.data.datasets.push({
                        label: "By Market",
                        data: [40, 25, 35, 50, 10],
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.8)',
                            'rgba(54, 162, 235, 0.8)',
                            'rgba(255, 206, 86, 0.8)',
                            'rgba(215, 14, 18, 0.8)',
                            'rgba(38, 167, 67, 0.8)'
                        ],
                        borderColor: [
                            '#e5e5e5'
                        ],
                        borderWidth: 2
                    });
                    this.dailySalesChart1.config.type = 'bar';
                    this.dailySalesChart1.config.options.scales.yAxes = [{
                        ticks: {
                            beginAtZero: true
                        }
                    }];


                    // For line chart -  Lower Chart
                    this.dailySalesChart2.data.datasets = [];
                    this.dailySalesChart2.data.datasets = [{
                        label: 'East',
                        data: [20, 35, 15, 45, 55],
                        type: 'line',
                        backgroundColor: [
                            'transparent'
                        ],
                        borderColor: [
                            'rgba(255, 99, 132, 0.8)'
                        ],
                        borderWidth: 1
                    }, {
                        label: 'West',
                        data: [45, 15, 30, 35, 10],
                        type: 'line',
                        backgroundColor: [
                            'transparent'
                        ],
                        borderColor: [
                            'rgba(54, 162, 235, 0.8)'
                        ],
                        borderWidth: 1
                    }, {
                        label: 'North',
                        data: [10, 15, 40, 25, 35],
                        type: 'line',
                        backgroundColor: [
                            'transparent'
                        ],
                        borderColor: [
                            'rgba(255, 206, 86, 0.8)'
                        ],
                        borderWidth: 1
                    }, {
                        label: 'South',
                        data: [35, 18, 27, 10, 30],
                        type: 'line',
                        backgroundColor: [
                            'transparent'
                        ],
                        borderColor: [
                            'rgba(215, 14, 18, 0.8)'
                        ],
                        borderWidth: 1
                    }, {
                        label: 'Central',
                        data: [55, 25, 36, 30, 15],
                        type: 'line',
                        backgroundColor: [
                            'transparent'
                        ],
                        borderColor: [
                            'rgba(38, 167, 67, 0.8)'
                        ],
                        borderWidth: 1
                    }];
                }
                this.dailySalesChart1.update();
                this.dailySalesChart2.update();
            }
        });
    });
