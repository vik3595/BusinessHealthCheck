sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "../utils/formatter",
    "com/levi/businesshealthcheck/utils/Chart.min"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, formatter) {
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
                    "TrendValue": "",
                    "TrendPercentage": "",
                    "TrendSymbol": "",
                    "High": "",
                    "Low": "",
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
                        this.myChart = new Chart(ctx, {
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
                            this._somethingWentWrong("DailyOrdersChart1", data.Note);
                            return;
                        }
                        var sLabel = "";
                        var akeys = Object.keys(data['Time Series (Daily)']);
                        var aMonth = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                        var aLabels = [],
                            aValues = [],
                            iVol = "",
                            iHigh = parseFloat(data['Time Series (Daily)'][akeys[0]]['2. high']),
                            iLow = parseFloat(data['Time Series (Daily)'][akeys[0]]['3. low']),
                            sTrend = parseFloat(data['Time Series (Daily)'][akeys[0]]['6. volume']) > parseFloat(data['Time Series (Daily)'][akeys[1]]['6. volume']) ? 'sap-icon://trend-up' : 'sap-icon://trend-down',
                            iTrendValue = Math.abs(parseFloat(data['Time Series (Daily)'][akeys[0]]['6. volume']) - parseFloat(data['Time Series (Daily)'][akeys[1]]['6. volume'])).toFixed(2),
                            iTrendSymbol = parseFloat(data['Time Series (Daily)'][akeys[0]]['6. volume']) > parseFloat(data['Time Series (Daily)'][akeys[1]]['6. volume']) ? '+' : '-',
                            sPercentageChange = "";
                        if (data['Time Series (Daily)'][akeys[0]]['6. volume'].length > 6) {
                            var getNumber = function (num) {
                                var units = ["M", "B", "T", "Q"]
                                var unit = Math.floor((num / 1.0e+1).toFixed(0).toString().length)
                                var r = unit % 3
                                var x = Math.abs(Number(num)) / Number('1.0e+' + (unit - r)).toFixed(2)
                                return x.toFixed(2) + units[Math.floor(unit / 3) - 2]
                            };
                            iVol = getNumber(parseFloat(data['Time Series (Daily)'][akeys[0]]['6. volume']));
                        } else {
                            iVol = '0.' + int.slice(0, 2) + 'M';
                        }
                        if (iTrendSymbol === "+") {
                            sPercentageChange = ((parseFloat(data['Time Series (Daily)'][akeys[0]]['6. volume']) - parseFloat(data['Time Series (Daily)'][akeys[1]]['6. volume'])) / parseFloat(data['Time Series (Daily)'][akeys[1]]['6. volume'])) * 100;
                            this._setTrendStyleClass("idOrderTrendVBox", "Up");
                        } else {
                            sPercentageChange = ((parseFloat(data['Time Series (Daily)'][akeys[1]]['6. volume']) - parseFloat(data['Time Series (Daily)'][akeys[0]]['6. volume'])) / parseFloat(data['Time Series (Daily)'][akeys[1]]['6. volume'])) * 100;
                            this._setTrendStyleClass("idOrderTrendVBox", "Down");
                        }
                        oViewModel.setProperty("/OpenOrders", data['Time Series (Daily)'][akeys[0]]['1. open']);
                        oViewModel.setProperty("/CloseOrders", data['Time Series (Daily)'][akeys[0]]['4. close']);
                        oViewModel.setProperty("/HighOrders", iHigh);
                        oViewModel.setProperty("/LowOrders", iLow);
                        oViewModel.setProperty("/VolumeOrders", iVol);
                        oViewModel.setProperty("/TrendOrders", sTrend);
                        oViewModel.setProperty("/TrendValueOrders", iTrendValue);
                        oViewModel.setProperty("/TrendSymbolOrders", iTrendSymbol);
                        oViewModel.setProperty("/TrendPercentageOrders", "(" + sPercentageChange.toFixed(2) + "%)");
                        for (var i = 0; i < 7; i++) {
                            aLabels.push(akeys[i].split("-")[2] + " " + aMonth[parseFloat(akeys[i].split("-")[1])]);
                            // aLabels.push(akeys[i]);
                            aValues.push(parseFloat(data['Time Series (Daily)'][akeys[i]]['6. volume']));
                        }
                        // var aData = Object.keys(data['Time Series (Daily)']).map((key) => data['Time Series (Daily)'][key]);
                        var ctx = document.getElementById('DailyOrdersDoughnutChart').getContext('2d');
                        Chart.defaults.global.defaultFontColor = '#000000';
                        this.myChart = new Chart(ctx, {
                            type: 'doughnut',
                            data: {
                                labels: aLabels,
                                datasets: [{
                                    label: sLabel,
                                    data: aValues,
                                    backgroundColor: [
                                        'rgba(255, 99, 132, 0.8)',
                                        'rgba(54, 162, 235, 0.8)',
                                        'rgba(255, 206, 86, 0.8)',
                                        'rgba(75, 192, 192, 0.8)',
                                        'rgba(153, 102, 255, 0.8)',
                                        'rgba(255, 159, 64, 0.8)',
                                        'rgba(62, 214, 106, 0.8)'
                                    ],
                                    borderColor: [
                                        '#e5e5e5'
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
                                legend: { display: !0, position: "right" }
                            }
                        });
                        this.oBusyDailog.close();
                    }.bind(this)
                });
            },
            onRenderDailyOrdersChart2: function () {
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
                            this._somethingWentWrong("DailyOrdersChart2", data.Note);
                            return;
                        }
                        var sLabel = "";
                        var akeys = Object.keys(data['Time Series (Daily)']);
                        var aMonth = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                        var aLabels = [],
                            aValues = [],
                            iVol = "",
                            iHigh = parseFloat(data['Time Series (Daily)'][akeys[0]]['2. high']),
                            iLow = parseFloat(data['Time Series (Daily)'][akeys[0]]['3. low']),
                            sTrend = parseFloat(data['Time Series (Daily)'][akeys[0]]['6. volume']) > parseFloat(data['Time Series (Daily)'][akeys[1]]['6. volume']) ? 'sap-icon://trend-up' : 'sap-icon://trend-down',
                            iTrendValue = Math.abs(parseFloat(data['Time Series (Daily)'][akeys[0]]['6. volume']) - parseFloat(data['Time Series (Daily)'][akeys[1]]['6. volume'])).toFixed(2),
                            iTrendSymbol = parseFloat(data['Time Series (Daily)'][akeys[0]]['6. volume']) > parseFloat(data['Time Series (Daily)'][akeys[1]]['6. volume']) ? '+' : '-',
                            sPercentageChange = "";
                        if (data['Time Series (Daily)'][akeys[0]]['6. volume'].length > 6) {
                            var getNumber = function (num) {
                                var units = ["M", "B", "T", "Q"]
                                var unit = Math.floor((num / 1.0e+1).toFixed(0).toString().length)
                                var r = unit % 3
                                var x = Math.abs(Number(num)) / Number('1.0e+' + (unit - r)).toFixed(2)
                                return x.toFixed(2) + units[Math.floor(unit / 3) - 2]
                            };
                            iVol = getNumber(parseFloat(data['Time Series (Daily)'][akeys[0]]['6. volume']));
                        } else {
                            iVol = '0.' + int.slice(0, 2) + 'M';
                        }
                        if (iTrendSymbol === "+") {
                            sPercentageChange = ((parseFloat(data['Time Series (Daily)'][akeys[0]]['6. volume']) - parseFloat(data['Time Series (Daily)'][akeys[1]]['6. volume'])) / parseFloat(data['Time Series (Daily)'][akeys[1]]['6. volume'])) * 100;
                            this._setTrendStyleClass("idOrderTrendVBox", "Up");
                        } else {
                            sPercentageChange = ((parseFloat(data['Time Series (Daily)'][akeys[1]]['6. volume']) - parseFloat(data['Time Series (Daily)'][akeys[0]]['6. volume'])) / parseFloat(data['Time Series (Daily)'][akeys[1]]['6. volume'])) * 100;
                            this._setTrendStyleClass("idOrderTrendVBox", "Down");
                        }
                        oViewModel.setProperty("/OpenOrders", data['Time Series (Daily)'][akeys[0]]['1. open']);
                        oViewModel.setProperty("/CloseOrders", data['Time Series (Daily)'][akeys[0]]['4. close']);
                        oViewModel.setProperty("/HighOrders", iHigh);
                        oViewModel.setProperty("/LowOrders", iLow);
                        oViewModel.setProperty("/VolumeOrders", iVol);
                        oViewModel.setProperty("/TrendOrders", sTrend);
                        oViewModel.setProperty("/TrendValueOrders", iTrendValue);
                        oViewModel.setProperty("/TrendSymbolOrders", iTrendSymbol);
                        oViewModel.setProperty("/TrendPercentageOrders", "(" + sPercentageChange.toFixed(2) + "%)");
                        for (var i = 0; i < 7; i++) {
                            aLabels.push(akeys[i].split("-")[2] + " " + aMonth[parseFloat(akeys[i].split("-")[1])]);
                            // aLabels.push(akeys[i]);
                            aValues.push(parseFloat(data['Time Series (Daily)'][akeys[i]]['6. volume']));
                        }
                        // var aData = Object.keys(data['Time Series (Daily)']).map((key) => data['Time Series (Daily)'][key]);
                        var ctx = document.getElementById('DailyOrdersLineChart').getContext('2d');
                        Chart.defaults.global.defaultFontColor = '#000000';
                        this.myChart = new Chart(ctx, {
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
                                        'rgba(75, 192, 192, 0.2)'
                                        // 'rgba(153, 102, 255, 0.2)'
                                        // 'rgba(255, 159, 64, 0.2)'
                                    ],
                                    borderColor: [
                                        '#e5e5e5'
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
            onRenderDailySalesChart1: function () {
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
                            this._somethingWentWrong("DailySalesChart1", data.Note);
                            return;
                        }
                        var sLabel = "";
                        var akeys = Object.keys(data['Time Series (Daily)']);
                        var aMonth = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                        var aLabels = [],
                            aValues = [],
                            iVol = "",
                            iHigh = parseFloat(data['Time Series (Daily)'][akeys[0]]['2. high']),
                            iLow = parseFloat(data['Time Series (Daily)'][akeys[0]]['3. low']),
                            sTrend = parseFloat(data['Time Series (Daily)'][akeys[0]]['6. volume']) > parseFloat(data['Time Series (Daily)'][akeys[1]]['6. volume']) ? 'sap-icon://trend-up' : 'sap-icon://trend-down',
                            iTrendValue = Math.abs(parseFloat(data['Time Series (Daily)'][akeys[0]]['6. volume']) - parseFloat(data['Time Series (Daily)'][akeys[1]]['6. volume'])).toFixed(2),
                            iTrendSymbol = parseFloat(data['Time Series (Daily)'][akeys[0]]['6. volume']) > parseFloat(data['Time Series (Daily)'][akeys[1]]['6. volume']) ? '+' : '-',
                            sPercentageChange = "";
                        if (data['Time Series (Daily)'][akeys[0]]['6. volume'].length > 6) {
                            var getNumber = function (num) {
                                var units = ["M", "B", "T", "Q"]
                                var unit = Math.floor((num / 1.0e+1).toFixed(0).toString().length)
                                var r = unit % 3
                                var x = Math.abs(Number(num)) / Number('1.0e+' + (unit - r)).toFixed(2)
                                return x.toFixed(2) + units[Math.floor(unit / 3) - 2]
                            };
                            iVol = getNumber(parseFloat(data['Time Series (Daily)'][akeys[0]]['6. volume']));
                        } else {
                            iVol = '0.' + int.slice(0, 2) + 'M';
                        }
                        if (iTrendSymbol === "+") {
                            sPercentageChange = ((parseFloat(data['Time Series (Daily)'][akeys[0]]['6. volume']) - parseFloat(data['Time Series (Daily)'][akeys[1]]['6. volume'])) / parseFloat(data['Time Series (Daily)'][akeys[1]]['6. volume'])) * 100;
                            this._setTrendStyleClass("idSalesTrendVBox", "Up");
                        } else {
                            sPercentageChange = ((parseFloat(data['Time Series (Daily)'][akeys[1]]['6. volume']) - parseFloat(data['Time Series (Daily)'][akeys[0]]['6. volume'])) / parseFloat(data['Time Series (Daily)'][akeys[1]]['6. volume'])) * 100;
                            this._setTrendStyleClass("idSalesTrendVBox", "Down");
                        }
                        oViewModel.setProperty("/OpenOrders", data['Time Series (Daily)'][akeys[0]]['1. open']);
                        oViewModel.setProperty("/CloseOrders", data['Time Series (Daily)'][akeys[0]]['4. close']);
                        oViewModel.setProperty("/HighOrders", iHigh);
                        oViewModel.setProperty("/LowOrders", iLow);
                        oViewModel.setProperty("/VolumeOrders", iVol);
                        oViewModel.setProperty("/TrendOrders", sTrend);
                        oViewModel.setProperty("/TrendValueOrders", iTrendValue);
                        oViewModel.setProperty("/TrendSymbolOrders", iTrendSymbol);
                        oViewModel.setProperty("/TrendPercentageOrders", "(" + sPercentageChange.toFixed(2) + "%)");
                        for (var i = 0; i < 7; i++) {
                            aLabels.push(akeys[i].split("-")[2] + " " + aMonth[parseFloat(akeys[i].split("-")[1])]);
                            // aLabels.push(akeys[i]);
                            aValues.push(parseFloat(data['Time Series (Daily)'][akeys[i]]['6. volume']));
                        }
                        // var aData = Object.keys(data['Time Series (Daily)']).map((key) => data['Time Series (Daily)'][key]);
                        var ctx = document.getElementById('DailySalesBarChart').getContext('2d');
                        Chart.defaults.global.defaultFontColor = '#000000';
                        this.myChart = new Chart(ctx, {
                            type: 'bar',
                            data: {
                                labels: aLabels,
                                datasets: [{
                                    label: sLabel,
                                    data: aValues,
                                    backgroundColor: [
                                        'rgba(255, 99, 132, 0.8)',
                                        'rgba(54, 162, 235, 0.8)',
                                        'rgba(255, 206, 86, 0.8)',
                                        'rgba(75, 192, 192, 0.8)',
                                        'rgba(153, 102, 255, 0.8)',
                                        'rgba(255, 159, 64, 0.8)',
                                        'rgba(62, 214, 106, 0.8)'
                                    ],
                                    borderColor: [
                                        '#e5e5e5'
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
            onRenderDailySalesChart2: function () {
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
                            this._somethingWentWrong("DailySalesChart2", data.Note);
                            return;
                        }
                        var sLabel = "";
                        var akeys = Object.keys(data['Time Series (Daily)']);
                        var aMonth = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                        var aLabels = [],
                            aValues = [],
                            iVol = "",
                            iHigh = parseFloat(data['Time Series (Daily)'][akeys[0]]['2. high']),
                            iLow = parseFloat(data['Time Series (Daily)'][akeys[0]]['3. low']),
                            sTrend = parseFloat(data['Time Series (Daily)'][akeys[0]]['6. volume']) > parseFloat(data['Time Series (Daily)'][akeys[1]]['6. volume']) ? 'sap-icon://trend-up' : 'sap-icon://trend-down',
                            iTrendValue = Math.abs(parseFloat(data['Time Series (Daily)'][akeys[0]]['6. volume']) - parseFloat(data['Time Series (Daily)'][akeys[1]]['6. volume'])).toFixed(2),
                            iTrendSymbol = parseFloat(data['Time Series (Daily)'][akeys[0]]['6. volume']) > parseFloat(data['Time Series (Daily)'][akeys[1]]['6. volume']) ? '+' : '-',
                            sPercentageChange = "";
                        if (data['Time Series (Daily)'][akeys[0]]['6. volume'].length > 6) {
                            var getNumber = function (num) {
                                var units = ["M", "B", "T", "Q"]
                                var unit = Math.floor((num / 1.0e+1).toFixed(0).toString().length)
                                var r = unit % 3
                                var x = Math.abs(Number(num)) / Number('1.0e+' + (unit - r)).toFixed(2)
                                return x.toFixed(2) + units[Math.floor(unit / 3) - 2]
                            };
                            iVol = getNumber(parseFloat(data['Time Series (Daily)'][akeys[0]]['6. volume']));
                        } else {
                            iVol = '0.' + int.slice(0, 2) + 'M';
                        }
                        if (iTrendSymbol === "+") {
                            sPercentageChange = ((parseFloat(data['Time Series (Daily)'][akeys[0]]['6. volume']) - parseFloat(data['Time Series (Daily)'][akeys[1]]['6. volume'])) / parseFloat(data['Time Series (Daily)'][akeys[1]]['6. volume'])) * 100;
                            this._setTrendStyleClass("idSalesTrendVBox", "Up");
                        } else {
                            sPercentageChange = ((parseFloat(data['Time Series (Daily)'][akeys[1]]['6. volume']) - parseFloat(data['Time Series (Daily)'][akeys[0]]['6. volume'])) / parseFloat(data['Time Series (Daily)'][akeys[1]]['6. volume'])) * 100;
                            this._setTrendStyleClass("idSalesTrendVBox", "Down");
                        }
                        oViewModel.setProperty("/OpenOrders", data['Time Series (Daily)'][akeys[0]]['1. open']);
                        oViewModel.setProperty("/CloseOrders", data['Time Series (Daily)'][akeys[0]]['4. close']);
                        oViewModel.setProperty("/HighOrders", iHigh);
                        oViewModel.setProperty("/LowOrders", iLow);
                        oViewModel.setProperty("/VolumeOrders", iVol);
                        oViewModel.setProperty("/TrendOrders", sTrend);
                        oViewModel.setProperty("/TrendValueOrders", iTrendValue);
                        oViewModel.setProperty("/TrendSymbolOrders", iTrendSymbol);
                        oViewModel.setProperty("/TrendPercentageOrders", "(" + sPercentageChange.toFixed(2) + "%)");
                        for (var i = 0; i < 7; i++) {
                            aLabels.push(akeys[i].split("-")[2] + " " + aMonth[parseFloat(akeys[i].split("-")[1])]);
                            // aLabels.push(akeys[i]);
                            aValues.push(parseFloat(data['Time Series (Daily)'][akeys[i]]['6. volume']));
                        }
                        // var aData = Object.keys(data['Time Series (Daily)']).map((key) => data['Time Series (Daily)'][key]);
                        var ctx = document.getElementById('DailySalesLineChart').getContext('2d');
                        Chart.defaults.global.defaultFontColor = '#000000';
                        this.myChart = new Chart(ctx, {
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
                                        'rgba(255, 206, 86, 0.2)'
                                        // 'rgba(75, 192, 192, 0.2)'
                                        // 'rgba(153, 102, 255, 0.2)'
                                        // 'rgba(255, 159, 64, 0.2)'
                                    ],
                                    borderColor: [
                                        '#e5e5e5'
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
            _setTrendStyleClass: function (sVBoxId, sTrend) {
                if (sTrend === "Up") {
                    this.getView().byId(sVBoxId).removeStyleClass("vboxOrdersDown")
                    this.getView().byId(sVBoxId).addStyleClass("vboxOrdersUp")
                } else {
                    this.getView().byId(sVBoxId).removeStyleClass("vboxOrdersUp")
                    this.getView().byId(sVBoxId).addStyleClass("vboxOrdersDown")
                }
            },
            onOptionMenuPress: function (oEvt) {
                if (oEvt.getSource().getSrc() === "sap-icon://decline") {
                    this._oOptionDlg.close();
                } else {
                    if (!this._oOptionDlg) {
                        this._oOptionDlg = sap.ui.xmlfragment("idMenuDlg", "com.levi.businesshealthcheck.view.fragments.Options", this);
                        this.getView().addDependent(this._oOptionDlg);
                    }
                    this._oOptionDlg.openBy(oEvt.getSource());
                }

            },
            onAfterOptionOpen: function (oEvt) {
                this.getOwnerComponent().getModel("ViewModel").setProperty("/OptionIcon", "sap-icon://decline");
            },
            onAfterOptionClose: function (oEvt) {
                this.getOwnerComponent().getModel("ViewModel").setProperty("/OptionIcon", "sap-icon://drill-up");
            },
            onSelectOption: function (oEvt) {
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
            }
        });
    });
