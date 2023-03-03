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
                var oModel = new JSONModel({
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
                jQuery.ajax({
                    type: "GET",
                    contentType: "application/json",
                    url: "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=LEVI&apikey=OCV4IKN7H0A0BM12",
                    dataType: "json",
                    async: false,
                    success: function (data, textStatus, jqXHR) {
                        var sLabel = "";
                        var akeys = Object.keys(data['Time Series (Daily)']);
                        var aMonth = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                        var aLabels = [],
                            aValues = [],
                            iVol = "",
                            iHigh = parseFloat(data['Time Series (Daily)'][akeys[0]]['2. high']),
                            iLow = parseFloat(data['Time Series (Daily)'][akeys[0]]['3. low']),
                            sTrend = parseFloat(data['Time Series (Daily)'][akeys[0]]['1. open']) > parseFloat(data['Time Series (Daily)'][akeys[1]]['1. open']) ? 'sap-icon://trend-up' : 'sap-icon://trend-down',
                            iTrendValue = Math.abs(parseFloat(data['Time Series (Daily)'][akeys[0]]['1. open']) - parseFloat(data['Time Series (Daily)'][akeys[1]]['1. open'])).toFixed(2),
                            iTrendSymbol = parseFloat(data['Time Series (Daily)'][akeys[0]]['1. open']) > parseFloat(data['Time Series (Daily)'][akeys[1]]['1. open']) ? '+' : '-',
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
                            sPercentageChange = ((parseFloat(data['Time Series (Daily)'][akeys[0]]['1. open']) - parseFloat(data['Time Series (Daily)'][akeys[1]]['1. open'])) / parseFloat(data['Time Series (Daily)'][akeys[1]]['1. open'])) * 100;
                        } else {
                            sPercentageChange = ((parseFloat(data['Time Series (Daily)'][akeys[1]]['1. open']) - parseFloat(data['Time Series (Daily)'][akeys[0]]['1. open'])) / parseFloat(data['Time Series (Daily)'][akeys[1]]['1. open'])) * 100;
                        }
                        oViewModel.setProperty("/Open", data['Time Series (Daily)'][akeys[0]]['1. open']);
                        oViewModel.setProperty("/Close", data['Time Series (Daily)'][akeys[0]]['4. close']);
                        oViewModel.setProperty("/High", iHigh);
                        oViewModel.setProperty("/Low", iLow);
                        oViewModel.setProperty("/Volume", iVol);
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
                        var ctx = document.getElementById('myChart').getContext('2d');
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
                                }
                            }
                        });
                    }.bind(this)
                });
            },
            onMenuPress: function () {
                if (!this._oMenuDlg) {
                    this._oMenuDlg = sap.ui.xmlfragment("idMenuDlg", "com.levi.businesshealthcheck.view.fragments.Menu", this);
                    this.getView().addDependent(this._oMenuDlg);
                }
                this._oMenuDlg.open();
            },
            onHomePress: function () {
                var oNavContainer = this.getView().byId("idNavContainer");
                oNavContainer.back();
            },
            onDailySalesPress: function () {

            },
            onDailyOrdersPress: function () {
                var oNavContainer = this.getView().byId("idNavContainer");
                oNavContainer.to(this.getView().byId("idDailyOrders"), "baseSlide");
                var oViewModel = this.getOwnerComponent().getModel("ViewModel");
                jQuery.ajax({
                    type: "GET",
                    contentType: "application/json",
                    url: "https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=LEVI&apikey=OCV4IKN7H0A0BM12",
                    dataType: "json",
                    async: false,
                    success: function (data, textStatus, jqXHR) {
                        var sLabel = "";
                        var akeys = Object.keys(data['Time Series (Daily)']);
                        var aMonth = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                        var aLabels = [],
                            aValues = [];
                        for (var i = 0; i < 7; i++) {
                            aLabels.push(akeys[i].split("-")[2] + " " + aMonth[parseFloat(akeys[i].split("-")[1])]);
                            // aLabels.push(akeys[i]);
                            aValues.push(parseFloat(data['Time Series (Daily)'][akeys[i]]['6. volume']));
                        }
                        // var aData = Object.keys(data['Time Series (Daily)']).map((key) => data['Time Series (Daily)'][key]);
                        var ctx = document.getElementById('myChart2').getContext('2d');
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
                                }
                            }
                        });
                    }.bind(this)
                });
            },
            onRightMenuPress: function(oEvt) {
                if (!this._oOptionDlg) {
                    this._oOptionDlg = sap.ui.xmlfragment("idMenuDlg", "com.levi.businesshealthcheck.view.fragments.Options", this);
                    this.getView().addDependent(this._oOptionDlg);
                }
                this._oOptionDlg.openBy(oEvt.getSource());
            }
        });
    });
