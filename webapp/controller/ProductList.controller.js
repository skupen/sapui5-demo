sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (Controller, JSONModel, Filter, FilterOperator) {
	"use strict";

	return Controller.extend("sap.ui.demo.walkthrough.controller.ProductList", {
		onFilterProducts : function (oEvent) {

			// build filter array
			var aFilter = [];
			var sValue = oEvent.getParameter("newValue");
			if (sValue) {
				aFilter.push(new Filter("Name", FilterOperator.Contains, sValue));
			}

			// filter binding
			var oList = this.byId("productList");
			var oBinding = oList.getBinding("items");
			oBinding.filter(aFilter);
		},

		onPress: function (oEvent) {
			var oItem = oEvent.getSource();
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("detail", {
				productPath: window.encodeURIComponent(oItem.getBindingContext("product").getPath().substr(1))
			});
		}

	});
});