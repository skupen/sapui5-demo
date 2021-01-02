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
			var sQuery = oEvent.getParameter("newValue");
			if (sQuery) {
				var sQueryLower = sQuery.toLowerCase();
				var sQueryUpper = sQuery.toUpperCase();
				var sQueryUpLow = sQuery[0].toUpperCase() + sQuery.substr(1).toLowerCase();
				aFilter.push(new Filter("Name", FilterOperator.Contains, sQuery))
				aFilter.push(new Filter("Name", FilterOperator.Contains, sQueryLower));
				aFilter.push(new Filter("Name", FilterOperator.Contains, sQueryUpper));
				aFilter.push(new Filter("Name", FilterOperator.Contains, sQueryUpLow));
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

		handleDelete: function(oEvent) {
			var oModel = this.getOwnerComponent().getModel("product"),
				oItem = oEvent.getParameter("listItem"),
				sPath = oItem.getBindingContext("product").getPath();

			oModel.remove(sPath);
		},
		
		onPressAddDialog: function () {
			var oView = this.getView();

			// create dialog lazily
			if (!this._addDialog) {
				this._addDialog = Fragment.load({
					id: oView.getId(),
					name: "sap.ui.demo.walkthrough.view.fragment.AddProduct",
					controller: this
				}).then(function (oDialog) {
					// connect dialog to the root view of this component (models, lifecycle)
					oView.addDependent(oDialog);
					return oDialog;
				});
			} 
			this._addDialog.then(function(oDialog) {
				oDialog.open();
			});
		},

		onPressEditDialog: function (oEvent) {
			var oView = this.getView();
			var oItem = oEvent.getSource();
			var oItemSource = oItem.getBindingContext("product");

			// create dialog lazily
			if (!this._editDialog) {
				this._editDialog = Fragment.load({
					id: oView.getId(),
					name: "sap.ui.demo.walkthrough.view.fragment.EditProduct",
					controller: this
				}).then(function (oDialog) {
					// connect dialog to the root view of this component (models, lifecycle)
					oDialog.setBindingContext(oItemSource,"product");
					oView.addDependent(oDialog);
					return oDialog;
				});
			} 
			this._editDialog.then(function(oDialog) {
				oDialog.open();
			});
		},

		onDialogEditPress: function(oEvent) {
			var productNameInput = this.getView().byId("productNameEdit").getProperty("value"),
			categoryInput = this.getView().byId("categoryNameEdit").getSelectedItem().getBindingContext("product").getPath(),
			supplierInput = this.getView().byId("supplierNameEdit").getSelectedItem().getBindingContext("product").getPath();
		

			var oItem = oEvent.getSource();
			var sPath = oItem.getBindingContext("product").getPath();
			var oModel = this.getOwnerComponent().getModel("product");

			// create an entry of the Products collection with the specified properties and values
			oModel.update(sPath, { 
				Name:productNameInput,
				Category: {__metadata: {uri: categoryInput}},
				Supplier: {__metadata: {uri: supplierInput}}
			}, function(){
				console.log("Product edited unsuccessfully");
			});

		// submit the changes (creates entity at the backend)
		oModel.submitChanges({ success : function(oData, response, model) {
			console.log("Product edited successfully!");
			// read msg from i18n model
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var sMsg = oBundle.getText("editMsg");
			// show message
			MessageToast.show(sMsg);
			}.bind(this),		
			error : function(oError) {
			console.log("Product edit failed!");			
			}});

		this.byId("editDialog").close();
		},

		onDialogAddPress: function() {
			var productNameInput = this.getView().byId("productNameAdd").getProperty("value"),
				categoryInput = this.getView().byId("categoryNameAdd").getSelectedItem().getBindingContext("product").getPath(),
				supplierInput = this.getView().byId("supplierNameAdd").getSelectedItem().getBindingContext("product").getPath();
			
			var oModel = this.getOwnerComponent().getModel("product"),
				oBindings = oModel.bindList("/Products");

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
				}.bind(this),				
				error : function(oError) {	
				console.log("Product addition failed!");		
				}});
		},

		onAddDialogCancelPress: function() {
			this.byId("addDialog").close();
		},
		
		onEditDialogCancelPress: function() {
			this.byId("editDialog").close();
			
		},

		dialogEditAfterClose: function() {
			this.byId("editDialog").destroy();
			this._editDialog = undefined;
		 },
		 
		dialogAddAfterClose: function() {
			this.byId("addDialog").destroy();
			this._addDialog = undefined;
		},	
	});
});