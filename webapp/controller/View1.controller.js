sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "com/levi/businesshealthcheck/utils/Chart.min"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel) {
        "use strict";

        return Controller.extend("com.levi.businesshealthcheck.controller.View1", {
            onInit: function () {
                var oModel = new JSONModel({
                    "Amount": "17.61",
                    "Currency": "USD",
                    "Trend": "",
                    "TrendValue": "",
                    "TrendPercentage": "",
                    "TrendSymbol": "",
                    "High": "",
                    "Low": ""
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
                        var sLabel  = data['Meta Data']['1. Information'];
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
                        if(iTrendSymbol === "+") {
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
            }
        });
    });
