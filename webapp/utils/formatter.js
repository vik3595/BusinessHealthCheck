sap.ui.define(function () {
	"use strict";

	var fomatter = {

		getVolumeWithoutUnit: function(sValue) {
            if(sValue) {
                return sValue.toString().slice(0, sValue.toString().length - 1);
            }
        }
		
	};

	return fomatter;

}, true);