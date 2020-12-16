sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/Fragment",
	"sap/ui/model/resource/ResourceModel",
	"sap/m/MessageToast"
], function (Controller, Filter, FilterOperator, Fragment, ResourceModel, MessageToast) {
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
		},

		onPressAdd: function() {
			var oModel = this.getOwnerComponent().getModel("product");
			// create an entry of the Products collection with the specified properties and values
			oModel.create("/Products", { 
					ID:98, 
					Name:"Test", 
					Description:"new Product", 
					ReleaseDate:new Date(), 
					Price:"10.1", 
					Rating:1,
					Category: {__metadata: {uri: "/Categories(0)"}},
					Supplier: {__metadata: {uri: "/Suppliers(0)"}}
				});
			// submit the changes (creates entity at the backend)
			oModel.submitChanges();
		},

		handleDelete: function(oEvent) {
			var oModel = this.getOwnerComponent().getModel("product"),
				oItem = oEvent.getParameter("listItem"),
				sPath = oItem.getBindingContext("product").getPath();

			oModel.remove(sPath);
		},
		
		onOpenDialog: function () {
			var oView = this.getView();

			// create dialog lazily
			if (!this.pDialog) {
				this.pDialog = Fragment.load({
					id: oView.getId(),
					name: "sap.ui.demo.walkthrough.view.fragment.AddProduct",
					controller: this
				}).then(function (oDialog) {
					// connect dialog to the root view of this component (models, lifecycle)
					oView.addDependent(oDialog);
					return oDialog;
				});
			} 
			this.pDialog.then(function(oDialog) {
				oDialog.open();
			});
		},


		onDialogAddPress: function() {
			var productNameInput = this.getView().byId("productName").getProperty("value");
			var categoryInput = this.getView().byId("categoryName").getSelectedItem().getBindingContext("product").getPath();
			var supplierInput = this.getView().byId("supplierName").getSelectedItem().getBindingContext("product").getPath();
			
			var oModel = this.getOwnerComponent().getModel("product");
			var oBindings = oModel.bindList("/Products");

			// create an entry of the Products collection with the specified properties and values
			oModel.create("/Products", { 
					ID:oBindings.oModel.aBindings[0].aKeys.length,
					Name:productNameInput, 
					Description:"new Product", 
					ReleaseDate:new Date(), 
					Price:undefined, 
					Rating:undefined,
					Category: {__metadata: {uri: categoryInput}},
					Supplier: {__metadata: {uri: supplierInput}}
				
				}, function(){
					console.log("Product created unsuccessfully");
				});
			// submit the changes (creates entity at the backend)
			oModel.submitChanges({ success : function(oData, response, model) {

				console.log("Product added successfully!");
				// read msg from i18n model
				var oBundle = this.getView().getModel("i18n").getResourceBundle();
				var sMsg = oBundle.getText("addMsg");
				// show message
				MessageToast.show(sMsg);
				
				},
				
				error : function(oError) {
				
				console.log("Product addition failed!");
				
				}});
			
			
			
		},

		onDialogCancelPress: function() {
			this.byId("dialog").close();
		}

		
		
	});
});