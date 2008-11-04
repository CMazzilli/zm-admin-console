/*
 * ***** BEGIN LICENSE BLOCK *****
 * 
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006, 2007 Zimbra, Inc.
 * 
 * The contents of this file are subject to the Yahoo! Public License
 * Version 1.0 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 * 
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * 
 * ***** END LICENSE BLOCK *****
 */

/**
* @class MoveAliasXDialog
* @contructor MoveAliasXDialog
* @author Greg Solovyev
* @param parent
* param app
**/
MoveAliasXDialog = function(parent,   w, h) {
	if (arguments.length == 0) return;

	this._standardButtons = [DwtDialog.CANCEL_BUTTON];
	var helpButton = new DwtDialog_ButtonDescriptor(ZaXWizardDialog.HELP_BUTTON, ZaMsg.TBB_Help, DwtDialog.ALIGN_LEFT, new AjxCallback(this, this._helpButtonListener));
	var moveButton = new DwtDialog_ButtonDescriptor(MoveAliasXDialog.MOVE_BUTTON, ZaMsg._move, DwtDialog.ALIGN_RIGHT, new AjxCallback(this, this.doMove));	
	var closeButton = new DwtDialog_ButtonDescriptor(MoveAliasXDialog.CLOSE_BUTTON, AjxMsg._close, DwtDialog.ALIGN_RIGHT, new AjxCallback(this, this.closeMe));		
	this._extraButtons = [helpButton,moveButton,closeButton];	
	ZaXDialog.call(this, parent,  null, ZaMsg.MoveAlias_Title, w, h,"MoveAliasXDialog");
	if (this._button[MoveAliasXDialog.MOVE_BUTTON]) {
		this._button[MoveAliasXDialog.MOVE_BUTTON].setEnabled (false);
	}
	this._containedObject = new ZaSearch();
	this.initForm(ZaSearch.myXModel,this.getMyXForm());
}

MoveAliasXDialog.prototype = new ZaXDialog;
MoveAliasXDialog.prototype.constructor = MoveAliasXDialog;
MoveAliasXDialog.resultChoices = new XFormChoices([], XFormChoices.OBJECT_REFERENCE_LIST, null, "name");
MoveAliasXDialog.MOVE_BUTTON= ++DwtDialog.LAST_BUTTON;
MoveAliasXDialog.CLOSE_BUTTON = ++DwtDialog.LAST_BUTTON;

MoveAliasXDialog.prototype.popup = 
function (loc) {
	this._containedObject[ZaModel.currentStep] = 1;	
	this._localXForm.setInstance(this._containedObject);
	ZaXWizardDialog.prototype.popup.call(this, loc);
	this._button[MoveAliasXDialog.CLOSE_BUTTON].setEnabled(false);	
	
	//reset choices
	var dynItem = this._localXForm.getItemsById(ZaSearch.A_selected)[0];
	if (dynItem) {
		dynItem.resetChoices();
	}
}


MoveAliasXDialog.prototype.closeMe = 
function() {
	this.popdown();	
}

MoveAliasXDialog.prototype.doMove =
function () {
	this._button[MoveAliasXDialog.MOVE_BUTTON].setEnabled(false);
	this._button[MoveAliasXDialog.CLOSE_BUTTON].setEnabled(true);
	if(this.moveAlias())
		this.goPage(2);
}

MoveAliasXDialog.prototype.goPage = 
function(pageKey) {
	this._containedObject[ZaModel.currentStep] = pageKey;
	this._localXForm.refresh(); //run update script
}

MoveAliasXDialog.prototype.setAlias = 
function (alias) {
	this._alias=alias;
}

MoveAliasXDialog.prototype.moveAlias = 
function() {
	//remove alias
	var name;
	try {
		if(this._containedObject[ZaSearch.A_selected] && this._containedObject[ZaSearch.A_selected].addAlias!=null) {	
			try {
				name = this._alias.name;
				ZaAlias.prototype.remove.call(this._alias);
			} catch (ex) {
				ZaApp.getInstance().getCurrentController()._handleException(ex, "MoveAliasXDialog.prototype.moveAlias:_alias.remove", null, false);
				return false;
			}
			if(name) {
				this._containedObject[ZaSearch.A_selected].addAlias(name);
			} else {
				//throw	
				throw (new AjxException(ZaMsg.FAILED_MOVE_ALIAS, AjxException.UNKNOWN_ERROR, "MoveAliasXDialog.prototype.moveAlias", "Alias name is not available"));
			}
			ZaApp.getInstance().getAccountListController().show();	
			this._containedObject.resultMsg = String(ZaMsg.Alias_Moved_To).replace("{0}",name).replace("{1}",this._containedObject[ZaSearch.A_selected].name); 
			return true;							
		}else{
			ZaApp.getInstance().getCurrentController().popupErrorDialog( AjxMessageFormat.format(ZaMsg.WARNING_ALIASES_TARGET_NON_EXIST,[this._containedObject[ZaSearch.A_selected]]));
		}
	} catch (ex) {
		ZaApp.getInstance().getCurrentController()._handleException(ex, "MoveAliasXDialog.prototype.moveAlias", null, false);
		return false;
	}
	return false;
}


MoveAliasXDialog.prototype.getMyXForm = 
function() {	
	var xFormObject = {
		numCols:2,
		items:[
			{type: _SWITCH_,
				items: [
					{type:_CASE_, relevant:"instance[ZaModel.currentStep] == 1", relevantBehavior:_HIDE_,
						items: [
							{type:_DWT_ALERT_,
								content:null,ref:"name",
								getDisplayValue: function (itemVal) {
									return AjxMessageFormat.format(ZaMsg.MoveAlias_HelpMsg,this.getForm().parent._alias.name);
								},
								iconVisible: false,
								align:_CENTER_,				
								style: DwtAlert.INFORMATION
							},						
							{type:_DYNSELECT_, ref:ZaSearch.A_selected, dataFetcherClass:ZaSearch, 
								dataFetcherMethod:ZaSearch.prototype.dynSelectSearchAccounts,
								width:"200px", inputSize:30, editable:true, forceUpdate:true,
								choices:new XFormChoices([], XFormChoices.OBJECT_REFERENCE_LIST, "name", "name"),
								onChange: function(value, event, form){
									if ((( value instanceof ZaAccount) || value instanceof ZaDistributionList) 
											&& (value.id)){ 
										//an account or DL is selected
										form.parent._button[MoveAliasXDialog.MOVE_BUTTON].setEnabled(true);
									}
									this.setInstanceValue(value);	
								}									
							}	
						]
					}, 
					{type:_CASE_, relevant:"instance[ZaModel.currentStep] == 2", relevantBehavior:_HIDE_,
						items :[
							{ type: _DWT_ALERT_,
								  style: DwtAlert.INFORMATION,
								  iconVisible: false, 
								  content: null,
								  ref:"resultMsg",align:_CENTER_, valign:_MIDDLE_,
								  relevant:"instance.resultMsg !=null"
							}
						]
					}
/*					{type:_CASE_, relevant:"instance[ZaModel.currentStep] == 1", relevantBehavior:_HIDE_,
						items: [
							{type:_OUTPUT_, value:ZaMsg.MoveAlias_SelectTitle},
							{type:_SPACER_},
							{type:_TEXTFIELD_, ref:ZaSearch.A_query, width:"350px",containerCssStyle:"padding-left:2px;padding-right:2px;", label:null, 
								elementChanged: function(elementValue,instanceValue, event) {
									var charCode = event.charCode;
									if (charCode == 13 || charCode == 3) {
									   this.getForm().parent.searchAccounts();
									} else {
										this.getForm().itemChanged(this, elementValue, event);
									}
								}
							},
							{type:_DWT_BUTTON_, label:ZaMsg.search, toolTipContent:ZaMsg.searchForAccounts, icon:ZaMsg.search, onActivate:MoveAliasXDialog.srchButtonHndlr},
							{type:_OSELECT_,width:"450px",height:"300px", colSpan:2,ref:ZaSearch.A_selected, 
									choices:MoveAliasXDialog.resultChoices, label:null,multiple:false,
									onChange: function(value, event, form){
										DBG.println(AjxDebug.DBG1, "event happens. value = " + value );
										if (( value instanceof ZaAccount)  && (value.id)){ //an account is selected
											form.parent._button[MoveAliasXDialog.MOVE_BUTTON].setEnabled(true);
										}
										this.setInstanceValue(value);	
									}									
							}
						]
					},
					{type:_CASE_, relevant:"instance[ZaModel.currentStep] == 2", relevantBehaviorBehavior:_HIDE_,
						items: [
							{ type: _DWT_ALERT_,
								  style: DwtAlert.WARNING,
								  iconVisible: false, 
								  content: null,
								  colSpan:"*",
								  ref:"resultMsg",align:_CENTER_, valign:_MIDDLE_
							}						
						]						
					}*/
				]
			}
		]		
	}
	return xFormObject;
}
