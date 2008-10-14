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
* @class ZaDomainXFormView
* @contructor
* @param parent
* @param app
* @author Greg Solovyev
**/
ZaDomainXFormView = function(parent, app) {
	ZaTabView.call(this, parent, app,"ZaDomainXFormView");	
	this.GALModes = [
		{label:ZaMsg.GALMode_internal, value:ZaDomain.GAL_Mode_internal},
		{label:ZaMsg.GALMode_external, value:ZaDomain.GAL_Mode_external}, 
		{label:ZaMsg.GALMode_both, value:ZaDomain.GAL_Mode_both}
  	];
  	this.GALServerTypes = [
		{label:ZaMsg.GALServerType_ldap, value:ZaDomain.GAL_ServerType_ldap},
		{label:ZaMsg.GALServerType_ad, value:ZaDomain.GAL_ServerType_ad} 
	];	
	
	this.AuthMechs = [
		{label:ZaMsg.AuthMech_zimbra, value:ZaDomain.AuthMech_zimbra},
		{label:ZaMsg.AuthMech_ldap, value:ZaDomain.AuthMech_ldap},
		{label:ZaMsg.AuthMech_ad, value:ZaDomain.AuthMech_ad}		
	];
	this.cosChoices = new XFormChoices([], XFormChoices.OBJECT_LIST, "id", "name");
	this.initForm(ZaDomain.myXModel,this.getMyXForm());
}

ZaDomainXFormView.prototype = new ZaTabView();
ZaDomainXFormView.prototype.constructor = ZaDomainXFormView;
ZaTabView.XFormModifiers["ZaDomainXFormView"] = new Array();

ZaDomainXFormView.zimletChoices = new XFormChoices([], XFormChoices.SIMPLE_LIST);

ZaDomainXFormView.onRepeatRemove = 
function (index, form) {
	var list = this.getInstanceValue();
	if (list == null || typeof(list) == "string" || index >= list.length || index<0) return;
	list.splice(index, 1);
	form.parent.setDirty(true);
}
/**
* @method setObject sets the object contained in the view
* @param entry - ZaDomain object to display
**/
ZaDomainXFormView.prototype.setObject =
function(entry) {
	this._containedObject = new Object();
	this._containedObject.attrs = new Object();
	this._containedObject.cos = entry.cos;
	this._containedObject.name = entry.name;
	this._containedObject.id = entry.id;
	this._containedObject.type = entry.type ;
	
	for (var a in entry.attrs) {
		if(entry.attrs[a] instanceof Array) {
			this._containedObject.attrs[a] = new Array();
			var cnt = entry.attrs[a].length;
			for(var ix = 0; ix < cnt; ix++) {
				this._containedObject.attrs[a][ix]=entry.attrs[a][ix];
			}
		} else {
			this._containedObject.attrs[a] = entry.attrs[a];
		}
	}
	if(!this._containedObject.attrs[ZaDomain.A_zimbraDomainStatus]) {
		this._containedObject.attrs[ZaDomain.A_zimbraDomainStatus] = ZaDomain.DOMAIN_STATUS_ACTIVE;
	}
	this._containedObject[ZaDomain.A_AuthUseBindPassword] = entry[ZaDomain.A_AuthUseBindPassword];
	
	if(!entry[ZaModel.currentTab])
		this._containedObject[ZaModel.currentTab] = "1";
	else
		this._containedObject[ZaModel.currentTab] = entry[ZaModel.currentTab];

	this._containedObject[ZaDomain.A_NotebookTemplateFolder]=entry[ZaDomain.A_NotebookTemplateFolder];
	this._containedObject[ZaDomain.A_NotebookTemplateDir]=entry[ZaDomain.A_NotebookTemplateDir];	


	this._containedObject[ZaDomain.A_allNotebookACLS] = [];
	if(entry[ZaDomain.A_allNotebookACLS])	{
		this._containedObject[ZaDomain.A_allNotebookACLS]._version=entry[ZaDomain.A_allNotebookACLS]._version ? entry[ZaDomain.A_allNotebookACLS]._version : 1;		
		var cnt = entry[ZaDomain.A_allNotebookACLS].length;
		for(var i = 0; i < cnt; i++) {
			var aclObj = entry[ZaDomain.A_allNotebookACLS][i];
			var _newAclObj = {};
			_newAclObj.gt=aclObj.gt;
			_newAclObj.name = aclObj.name;
			_newAclObj.acl = {r:0,w:0,i:0,d:0,a:0,x:0};
			for (var a in aclObj.acl) {
				_newAclObj.acl[a] = aclObj.acl[a];
			}					
			this._containedObject[ZaDomain.A_allNotebookACLS][i] = _newAclObj;
		}	
	}

    if(ZaSettings.ZIMLETS_ENABLED) {
		var zimlets = entry.attrs[ZaDomain.A_zimbraZimletDomainAvailableZimlets];
		if(zimlets != null && zimlets != "") {
			if (AjxUtil.isString(zimlets))	 {
				zimlets = [zimlets];
			}
			this._containedObject.attrs[ZaAccount.A_zimbraZimletAvailableZimlets] = zimlets;
		} else
			this._containedObject.attrs[ZaAccount.A_zimbraZimletAvailableZimlets] = null;


		//get sll Zimlets
		var allZimlets = ZaZimlet.getAll(this._app, "extension");
		if(allZimlets == null) {
			allZimlets = [];
		}

		if(allZimlets instanceof ZaItemList || allZimlets instanceof AjxVector)
			allZimlets = allZimlets.getArray();

		//convert objects to strings
		var cnt = allZimlets.length;
		var _tmpZimlets = [];
		for(var i=0; i<cnt; i++) {
			var zimlet = allZimlets[i];
			_tmpZimlets.push(zimlet.name);
		}
		ZaDomainXFormView.zimletChoices.setChoices(_tmpZimlets);
		ZaDomainXFormView.zimletChoices.dirtyChoices();
	}

    //set the catchAllChoices
    var isCatchAllEnabled = this._containedObject.attrs[ZaDomain.A_zimbraAdminConsoleCatchAllAddressEnabled]
            || this._containedObject.cos.attrs[ZaDomain.A_zimbraAdminConsoleCatchAllAddressEnabled] ;
    if (isCatchAllEnabled && isCatchAllEnabled == "TRUE") {
        var catchAllItem = this._localXForm.getItemsById("zimbraMailCatchAllAddress")[0] ;
        catchAllItem.setChoices (ZaAccount.getCatchAllChoices(entry.name)) ;
        this._containedObject[ZaAccount.A_zimbraMailCatchAllAddress] = entry [ZaAccount.A_zimbraMailCatchAllAddress] ;
    }
    
 	if(ZaSettings.COSES_ENABLED) {	
		if(this._containedObject.attrs[ZaDomain.A_domainDefaultCOSId]) {	
			var cos = ZaCos.getCosById(this._containedObject.attrs[ZaDomain.A_domainDefaultCOSId], this._app);
			this.cosChoices.setChoices([cos]);
			this.cosChoices.dirtyChoices();
		}
	}
    
    this._localXForm.setInstance(this._containedObject);        
	this.updateTab();
}

ZaDomainXFormView.isCatchAllEnabled = function () {
    var form = this;
    var instance = form.getInstance () ;
    var isCatchAllEnabled = instance.attrs[ZaDomain.A_zimbraAdminConsoleCatchAllAddressEnabled]
               || instance.cos.attrs[ZaDomain.A_zimbraAdminConsoleCatchAllAddressEnabled] ;

    return (isCatchAllEnabled == "TRUE" ? true : false) ;
}

ZaDomainXFormView.aclSelectionListener = 
function (ev) {
	var instance = this.getInstance();

	var arr = this.widget.getSelection();	
	if(arr && arr.length)
		instance.acl_selection_cache = arr;
	else 
		instance.acl_selection_cache = null;
		
	this.getForm().refresh();
	if (ev.detail == DwtListView.ITEM_DBL_CLICKED) {
		ZaDomainXFormView.editButtonListener.call(this);
	}	
}

ZaDomainXFormView.isDeleteAclEnabled = function () {
	var retVal = true;
	if (this.instance.acl_selection_cache != null && this.instance.acl_selection_cache.length>0) {
		var cnt = this.instance.acl_selection_cache.length;
		for(var i=0; i<cnt;i++) {
			if(this.instance.acl_selection_cache[i].gt==ZaDomain.A_NotebookPublicACLs || 
				this.instance.acl_selection_cache[i].gt==ZaDomain.A_NotebookAllACLs || 
				this.instance.acl_selection_cache[i].gt ==ZaDomain.A_NotebookGuestACLs) {		
				retVal = false;
				break;
			}
		}
	} else {
		retVal = false;
	}
	
	return retVal;
}

ZaDomainXFormView.isEditAclEnabled = function () {
	return (this.instance.acl_selection_cache != null && this.instance.acl_selection_cache.length==1);
}

ZaDomainXFormView.hasACEName = function () {
	return (this.instance.attrs[ZaDomain.A_domainName] != this.instance.name);
}

ZaDomainXFormView.addButtonListener =
function () {
	var formPage = this.getForm().parent;
	if(!formPage.addAclDlg) {
		formPage.addAclDlg = new ZaAddDomainAclXDialog(formPage._app.getAppCtxt().getShell(), formPage._app,"550px", "150px");
		formPage.addAclDlg.registerCallback(DwtDialog.OK_BUTTON, ZaDomainXFormView.addAcl, this.getForm(), null);						
	}
	var obj = {};
	obj.gt = ZaDomain.A_NotebookUserACLs;
	obj.name = "";
	obj.acl = {r:0,w:0,i:0,d:0,a:0,x:0};	
	formPage.addAclDlg.setObject(obj);
	formPage.addAclDlg.popup();
}

ZaDomainXFormView.addAcl = 
function () {
	if(this.parent.addAclDlg) {
		this.parent.addAclDlg.popdown();
		var obj = this.parent.addAclDlg.getObject();
		var aclsArr = this.getInstance()[ZaDomain.A_allNotebookACLS];
		var cnt = aclsArr.length;
		var foundObj = false;
		for(var i = 0; i < cnt; i++) {
			if(aclsArr[i].name == obj.name && aclsArr[i].gt == obj.gt) {
				for(var a in obj.acl) {
					if(obj.acl[a]) {
						aclsArr[i].acl[a] = obj.acl[a];
					}
				}
				foundObj = true;
				break;
			}
		}
		if(!foundObj) {
			aclsArr.push(obj);
		}
		aclsArr._version++;
		this.refresh();
		this.parent.setDirty(true);	
	}	
}

ZaDomainXFormView.editButtonListener =
function () {
	var instance = this.getInstance();
	if(instance.acl_selection_cache && instance.acl_selection_cache[0]) {	
		var formPage = this.getForm().parent;
		if(!formPage.editAclDlg) {
			formPage.editAclDlg = new ZaEditDomainAclXDialog(formPage._app.getAppCtxt().getShell(), formPage._app,"550px", "150px");
			formPage.editAclDlg.registerCallback(DwtDialog.OK_BUTTON, ZaDomainXFormView.updateAcl, this.getForm(), null);						
		}
		var obj = {};
		obj.gt = instance.acl_selection_cache[0].gt;
		obj.name = instance.acl_selection_cache[0].name;
		obj.acl = {r:0,w:0,i:0,d:0,a:0,x:0};
		for(var a in instance.acl_selection_cache[0].acl) {
			obj.acl[a] = instance.acl_selection_cache[0].acl[a];
		}
		formPage.editAclDlg.setObject(obj);
		formPage.editAclDlg.popup();		
	}
}


ZaDomainXFormView.updateAcl = 
function () {
	if(this.parent.editAclDlg) {
		this.parent.editAclDlg.popdown();
		var obj = this.parent.editAclDlg.getObject();
		var dirty = false;
		if(obj.name != this.getInstance().acl_selection_cache[0].name) {
			dirty = true;
		} else {
			for(var a in obj.acl) {
				if(obj.acl[a] != this.getInstance().acl_selection_cache[0].acl[a]) {
					dirty = true;
					break;
				}
			}
		}
		if(dirty) {
			this.getInstance().acl_selection_cache[0].acl = obj.acl;
			this.getInstance().acl_selection_cache[0].name = obj.name;			
			this.getInstance()[ZaDomain.A_allNotebookACLS]._version++;
			this.refresh();
			this.parent.setDirty(true);	
		}		
	}
}

ZaDomainXFormView.deleteButtonListener = 
function () {
	var instance = this.getInstance();
	if(instance.acl_selection_cache) {
		var cnt = instance.acl_selection_cache.length;
		for(var i=0; i<cnt;i++) {
			if(instance.acl_selection_cache[i].name && (instance.acl_selection_cache[i].gt==ZaDomain.A_NotebookGroupACLs ||
			 instance.acl_selection_cache[i].gt==ZaDomain.A_NotebookUserACLs ||
			 instance.acl_selection_cache[i].gt==ZaDomain.A_NotebookDomainACLs)) {
				var cnt2 = instance[ZaDomain.A_allNotebookACLS].length-1;
				for(var j=cnt2; j >= 0; j--) {
					if(instance[ZaDomain.A_allNotebookACLS][j].name == instance.acl_selection_cache[i].name) {
						instance[ZaDomain.A_allNotebookACLS].splice(j,1);
						break;
					}
				}
			} else if (instance.acl_selection_cache[i].gt) {
				var cnt2 = instance[ZaDomain.A_allNotebookACLS].length-1;
				for(var j=cnt2; j >= 0; j--) {
					if(instance[ZaDomain.A_allNotebookACLS][j].gt == instance.acl_selection_cache[i].gt) {
						instance[ZaDomain.A_allNotebookACLS][j].acl = {r:0,w:0,i:0,d:0,a:0,x:0};
						break;
					}
				}
			}
		}
	}
	instance[ZaDomain.A_allNotebookACLS]._version++; 
	this.getForm().refresh();
	this.getForm().parent.setDirty(true);	
}

ZaDomainXFormView.onFormFieldChanged = 
function (value, event, form) {
	var instance = this.getInstance();
	if(instance.attrs[ZaDomain.A_zimbraDomainStatus] && (instance.attrs[ZaDomain.A_zimbraDomainStatus]==ZaDomain.DOMAIN_STATUS_SHUTDOWN)) {
		var oldVal = this.getInstanceValue();
		return oldVal;
	} else {
		this.setInstanceValue(value);
		return value;
	}
}

ZaDomainXFormView.onCOSChanged = 
function(value, event, form) {
	form.parent.setDirty(true);
	if(ZaItem.ID_PATTERN.test(value))  {
		this.setInstanceValue(value);
	} else {
		var cos = ZaCos.getCosByName(value, form.parent._app);
		if(cos) {
			//value = form.getInstance().cos.id;
			value = cos.id;
		} 
	}
	this.setInstanceValue(value);
	return value;
}

ZaDomainXFormView.myXFormModifier = function(xFormObject) {	
	xFormObject.tableCssStyle="width:100%;overflow:auto;";
	
	var headerList = new Array();
	headerList[0] = new ZaListHeaderItem("gt", ZaMsg.Domain_Notebook_type_col, null, "150px", false, null, false, true);
	headerList[1] = new ZaListHeaderItem("name", ZaMsg.Domain_Notebook_name_col, null,"200px", false, null, false, true);
	headerList[2] = new ZaListHeaderItem("acl", ZaMsg.Domain_Notebook_perms_col, null, "200px", null, null, false, true);							



    xFormObject.items = [ ];
	
	xFormObject.items.push({type:_GROUP_, cssClass:"ZmSelectedHeaderBg", colSpan: "*", id:"xform_header", 
			items: [
				{type:_GROUP_,	numCols:4,colSizes:["32px","350px","100px","250px"],
					items: [
						{type:_AJX_IMAGE_, src:"Domain_32", label:null},
						{type:_OUTPUT_, ref:"name", label:null,cssClass:"AdminTitle", rowSpan:2},				
						{type:_OUTPUT_, ref:ZaItem.A_zimbraId, label:ZaMsg.NAD_ZimbraID}
					]
				}
			],
			cssStyle:"padding-top:5px; padding-left:2px; padding-bottom:5px"
	});	
	var tabIx = 0;
	var tabBar = {type:_TAB_BAR_,  ref:ZaModel.currentTab,choices:[],cssClass:"ZaTabBar", id:"xform_tabbar"};
	tabIx++;
	tabBar.choices.push({value:tabIx, label:ZaMsg.TABT_GeneralPage});
	var switchGroup = {type:_SWITCH_, items:[]};
	var case1 = {type:_ZATABCASE_, relevant:("instance[ZaModel.currentTab] == " + tabIx), 
		colSizes:["275px","*"],
		items:[
			{ type: _DWT_ALERT_,
				relevantBehavior:_HIDE_,
				relevant:"(instance.attrs[ZaDomain.A_zimbraDomainStatus] && (instance.attrs[ZaDomain.A_zimbraDomainStatus]==ZaDomain.DOMAIN_STATUS_SHUTDOWN))",
				containerCssStyle: "padding-bottom:0px",
				style: DwtAlert.WARNING,
				iconVisible: true, 
				content: ZaMsg.Domain_Locked_Note,
				colSpan:"*"
			},
			{ ref: "name", type:_OUTPUT_, 
			  label:ZaMsg.Domain_DomainName                        
			},
            {ref:ZaAccount.A_zimbraMailCatchAllAddress, id: ZaAccount.A_zimbraMailCatchAllAddress, type:_OSELECT1_,
               // relevant: "((instance.attrs[ZaDomain.A_zimbraAdminConsoleCatchAllAddressEnabled] == 'TRUE') " +
               //           "|| ((instance.attrs[ZaDomain.A_zimbraAdminConsoleCatchAllAddressEnabled] == null) && (instance.cos.attrs[ZaDomain.A_zimbraAdminConsoleCatchAllAddressEnabled] == 'TRUE')))" ,
                relevant: "ZaDomainXFormView.isCatchAllEnabled.call(this)" ,
                relevantBehavior: _HIDE_,
                label:ZaMsg.L_catchAll, labelLocation:_LEFT_,
                //choices:ZaAccount.getCatchAllChoices(ZaSettings.myDomainName),
                onChange:ZaDomainXFormView.onFormFieldChanged
            },

			{ ref: ZaDomain.A_domainName, type:_OUTPUT_,
			  label:ZaMsg.Domain_ACEName+":",relevant:"ZaDomainXFormView.hasACEName.call(this)", relevantBehavior:_HIDE_
			}
			
		 ]
	};
	if(ZaSettings.CAN_CHANGE_DOMAIN_SERVICE_HOSTNAME) {
		case1.items.push({ ref: ZaDomain.A_zimbraPublicServiceHostname, type:_TEXTFIELD_, 
			  label:ZaMsg.Domain_zimbraPublicServiceHostname, width:250,
			  onChange:ZaDomainXFormView.onFormFieldChanged
		  	});
	}
	if(ZaSettings.DOMAIN_MX_RECORD_CHECK_ENABLED) {
		if(!ZaSettings.DOMAINS_ARE_READONLY && ZaSettings.GLOBAL_CONFIG_ENABLED) {
			var group = {type:_GROUP_,colSpan:"2", id:"dns_check_group",items: [], width:"100%"};
			case1.items.push({ type: _DWT_ALERT_,
			containerCssStyle: "padding-bottom:0px",
			style: DwtAlert.INFO,
			iconVisible: true, 
			content: ZaMsg.Domain_InboundSMTPNote,
			colSpan:"2"});
			group.items.push({ref: ZaDomain.A_zimbraDNSCheckHostname, type:_SUPER_TEXTFIELD_, colSpan:2,
	 			txtBoxLabel:ZaMsg.Domain_zimbraDNSCheckHostname, onChange:ZaDomainXFormView.onFormFieldChanged,resetToSuperLabel:ZaMsg.NAD_ResetToGlobal});
	 		case1.items.push(group);
		} else {
			case1.items.push({ type: _DWT_ALERT_,
			containerCssStyle: "padding-bottom:0px",
			style: DwtAlert.INFO,
			iconVisible: true, 
			content: ZaMsg.Domain_InboundSMTPNote,
			colSpan:"2"});
			case1.items.push({ref: ZaDomain.A_zimbraDNSCheckHostname, colSpan:2, type:(ZaSettings.DOMAINS_ARE_READONLY ? _OUTPUT_ : _TEXTFIELD_), 
	 			label:ZaMsg.Domain_zimbraDNSCheckHostname, onChange:ZaDomainXFormView.onFormFieldChanged});
		}
	}
		
	if(ZaSettings.CAN_CHANGE_DOMAIN_DESCRIPTION) {
		case1.items.push({ ref: ZaDomain.A_description, type: _INPUT_, 
		  label:ZaMsg.NAD_Description, width:250,
		  onChange:ZaDomainXFormView.onFormFieldChanged});
	}


    if(ZaSettings.COSES_ENABLED) {
		case1.items.push(
			{ref:ZaDomain.A_domainDefaultCOSId, type:_DYNSELECT_, 
				label:ZaMsg.Domain_DefaultCOS, labelLocation:_LEFT_, 
				onChange:ZaDomainXFormView.onCOSChanged,
				dataFetcherMethod:ZaSearch.prototype.dynSelectSearchCoses,
				choices:this.cosChoices,
				dataFetcherClass:ZaSearch,
				editable:true,
				getDisplayValue:function(newValue) {
					// dereference through the choices array, if provided
					//newValue = this.getChoiceLabel(newValue);
					if(ZaItem.ID_PATTERN.test(newValue)) {
						var cos = ZaCos.getCosById(newValue, this.getForm().parent._app);
						if(cos)
							newValue = cos.name;
					} 
					if (newValue == null) {
						newValue = "";
					} else {
						newValue = "" + newValue;
					}
					return newValue;
				}
			});
	}
	if(ZaSettings.CAN_CHANGE_DOMAIN_STATUS) {
		case1.items.push({ref:ZaDomain.A_zimbraDomainStatus, type:_OSELECT1_, msgName:ZaMsg.Domain_zimbraDomainStatus,
				label:ZaMsg.Domain_zimbraDomainStatus+":", 
				labelLocation:_LEFT_, choices:ZaDomain.domainStatusChoices, onChange:ZaDomainXFormView.onFormFieldChanged});
	}
	if(ZaSettings.CAN_CHANGE_DOMAIN_NOTES) {
		case1.items.push({ ref: ZaDomain.A_notes, type:_TEXTAREA_, 
				  label:ZaMsg.NAD_Notes, labelCssStyle:"vertical-align:top", width:250,
				  onChange:ZaDomainXFormView.onFormFieldChanged});
	}
	
			
	switchGroup.items.push(case1);
	
	if(ZaSettings.DOMAIN_GAL_WIZ_ENABLED) {	
		tabIx++;
		tabBar.choices.push({value:tabIx, label:ZaMsg.Domain_Tab_GAL});
		var case2 = {type:_ZATABCASE_, relevant:("instance[ZaModel.currentTab] == " + tabIx), 
			colSizes:["300px","*"],
			items: [
				{ type: _DWT_ALERT_,
					relevantBehavior:_HIDE_,
					relevant:"(instance.attrs[ZaDomain.A_zimbraDomainStatus] && (instance.attrs[ZaDomain.A_zimbraDomainStatus]==ZaDomain.DOMAIN_STATUS_SHUTDOWN))",
					containerCssStyle: "padding-bottom:0px",
					style: DwtAlert.WARNING,
					iconVisible: true, 
					content: ZaMsg.Domain_Locked_Note,
					colSpan:"*"
				},
				{ref:ZaDomain.A_GalMode, type:_OUTPUT_, label:ZaMsg.Domain_GalMode, choices:this.GALModes},
				{ref:ZaDomain.A_GalMaxResults, type:_OUTPUT_, label:ZaMsg.NAD_GalMaxResults, autoSaveValue:true},
				{type:_GROUP_, relevant:"instance.attrs[ZaDomain.A_GalMode]!=ZaDomain.GAL_Mode_internal", relevantBehavior:_HIDE_,useParentTable:true, colSpan:"*",
					items: [
						{ref:ZaDomain.A_GALServerType, type:_OUTPUT_, label:ZaMsg.Domain_GALServerType, choices:this.GALServerTypes, labelLocation:_LEFT_},
						{ref:ZaDomain.A_GalLdapFilter, type:_OUTPUT_, label:ZaMsg.Domain_GalLdapFilter, labelLocation:_LEFT_, relevant:"instance.attrs[ZaDomain.A_GALServerType] == ZaDomain.GAL_ServerType_ldap", relevantBehavior:_HIDE_},
						{ref:ZaDomain.A_zimbraGalAutoCompleteLdapFilter, type:_OUTPUT_, label:ZaMsg.Domain_zimbraGalAutoCompleteLdapFilter, labelLocation:_LEFT_, relevant:"instance.attrs[ZaDomain.A_GALServerType] == ZaDomain.GAL_ServerType_ldap", relevantBehavior:_HIDE_},								
						{ref:ZaDomain.A_GalLdapSearchBase, type:_OUTPUT_, label:ZaMsg.Domain_GalLdapSearchBase, labelLocation:_LEFT_},
						{ref:ZaDomain.A_GalLdapURL, type:_REPEAT_, label:ZaMsg.Domain_GalLdapURL+":", labelLocation:_LEFT_,showAddButton:false, showRemoveButton:false,
							items:[
								{type:_OUTPUT_, ref:".", label:null,labelLocation:_NONE_}
							]
						},								
						{ref:ZaDomain.A_GalLdapBindDn, type:_OUTPUT_, label:ZaMsg.Domain_GalLdapBindDn, labelLocation:_LEFT_, relevant:"instance[ZaDomain.A_UseBindPassword] == 'TRUE'", relevantBehavior:_DISABLE_}
					]
				}
			]						
		};
		switchGroup.items.push(case2);
	}
	if(ZaSettings.DOMAIN_AUTH_WIZ_ENABLED)	{
		tabIx++;
		tabBar.choices.push({value:tabIx, label:ZaMsg.Domain_Tab_Authentication});
		var case3 = {type:_ZATABCASE_, relevant:("instance[ZaModel.currentTab] == " + tabIx), 
			colSizes:["300px","*"],
			items: [
				{ type: _DWT_ALERT_,
					relevantBehavior:_HIDE_,
					relevant:"(instance.attrs[ZaDomain.A_zimbraDomainStatus] && (instance.attrs[ZaDomain.A_zimbraDomainStatus]==ZaDomain.DOMAIN_STATUS_SHUTDOWN))",
					containerCssStyle: "padding-bottom:0px",
					style: DwtAlert.WARNING,
					iconVisible: true, 
					content: ZaMsg.Domain_Locked_Note,
					colSpan:"*"
				},
				{ref:ZaDomain.A_AuthMech, type:_OUTPUT_, label:ZaMsg.Domain_AuthMech, choices:this.AuthMechs},
				{type:_GROUP_,useParentTable:true, colSpan:"*", relevant:"instance.attrs[ZaDomain.A_AuthMech]==ZaDomain.AuthMech_ad",
					items:[
						{ref:ZaDomain.A_AuthLdapUserDn, type:_OUTPUT_, label:ZaMsg.Domain_AuthLdapUserDn, labelLocation:_LEFT_},
						{ref:ZaDomain.A_AuthLdapURL, type:_REPEAT_, label:ZaMsg.Domain_AuthLdapURL, labelLocation:_LEFT_,showAddButton:false, showRemoveButton:false,
							items:[
								{type:_OUTPUT_, ref:".", label:null,labelLocation:_NONE_}
							]
						}										
					]
				},
				{type:_GROUP_,useParentTable:true, colSpan:"*", relevant:"instance.attrs[ZaDomain.A_AuthMech]==ZaDomain.AuthMech_ldap",
					items:[
						{ref:ZaDomain.A_AuthLdapUserDn, type:_OUTPUT_, label:ZaMsg.Domain_AuthLdapUserDn, labelLocation:_LEFT_},
						{ref:ZaDomain.A_AuthLdapURL, type:_REPEAT_, label:ZaMsg.Domain_AuthLdapURL, labelLocation:_LEFT_,showAddButton:false, showRemoveButton:false,
							items:[
								{type:_OUTPUT_, ref:".", label:null,labelLocation:_NONE_}
							]
						},
						{ref:ZaDomain.A_AuthLdapSearchFilter, type:_OUTPUT_, label:ZaMsg.Domain_AuthLdapFilter, labelLocation:_LEFT_},
						{ref:ZaDomain.A_AuthLdapSearchBase, type:_OUTPUT_, label:ZaMsg.Domain_AuthLdapSearchBase, labelLocation:_LEFT_},
						{ref:ZaDomain.A_AuthUseBindPassword, type:_OUTPUT_, label:ZaMsg.Domain_AuthUseBindPassword, labelLocation:_LEFT_,choices:ZaModel.BOOLEAN_CHOICES},											
						{ref:ZaDomain.A_AuthLdapSearchBindDn, type:_INPUT_, label:ZaMsg.Domain_AuthLdapBindDn, labelLocation:_LEFT_, relevant:"instance[ZaDomain.A_AuthUseBindPassword] == 'TRUE'", relevantBehavior:_HIDE_}											
					]
				}
			]
		};
		switchGroup.items.push(case3);	
	}
	if(ZaSettings.DOMAIN_VIRTUAL_HOST_ENABLED)	{
		tabIx++;
		tabBar.choices.push({value:tabIx, label:ZaMsg.Domain_Tab_VirtualHost});
		var case4 = {type:_ZATABCASE_, relevant:("instance[ZaModel.currentTab] == " + tabIx),
			cssStyle:"padding-left:10px",
			items:[
				{ type: _DWT_ALERT_,
					relevantBehavior:_HIDE_,
					relevant:"(instance.attrs[ZaDomain.A_zimbraDomainStatus] && (instance.attrs[ZaDomain.A_zimbraDomainStatus]==ZaDomain.DOMAIN_STATUS_SHUTDOWN))",
					containerCssStyle: "padding-bottom:0px",
					style: DwtAlert.WARNING,
					iconVisible: true, 
					content: ZaMsg.Domain_Locked_Note,
					colSpan:"*"
				},					
				{type:_DWT_ALERT_,content:null,ref:ZaDomain.A_domainName,
					getDisplayValue: function (itemVal) {
						return AjxMessageFormat.format(ZaMsg.Domain_VH_Explanation,itemVal);
					},
					colSpan:"*",
					iconVisible: false,
					align:_CENTER_,				
					style: DwtAlert.INFORMATION
				},
				{ref:ZaDomain.A_zimbraVirtualHostname, type:_REPEAT_, label:null, repeatInstance:"", showAddButton:true, showRemoveButton:true, 
						addButtonLabel:ZaMsg.NAD_AddVirtualHost, 
						showAddOnNextRow:true,
						removeButtonLabel:ZaMsg.NAD_RemoveVirtualHost,
						items: [
							{ref:".", type:_TEXTFIELD_, label:null, onChange:ZaDomainXFormView.onFormFieldChanged}
						],
						onRemove:ZaDomainXFormView.onRepeatRemove
				}
			]
		};
		switchGroup.items.push(case4);	
	}
	if(ZaSettings.DOMAIN_WIKI_ENABLED) {
		tabIx++;
		tabBar.choices.push({value:tabIx, label:ZaMsg.Domain_Tab_Notebook});
		var case5 = {type:_ZATABCASE_, relevant:("instance[ZaModel.currentTab] == " + tabIx),cssStyle:"padding-left:10px",
			items : [
				{ type: _DWT_ALERT_,
					relevantBehavior:_HIDE_,
					relevant:"(instance.attrs[ZaDomain.A_zimbraDomainStatus] && (instance.attrs[ZaDomain.A_zimbraDomainStatus]==ZaDomain.DOMAIN_STATUS_SHUTDOWN))",
					containerCssStyle: "padding-bottom:0px",
					style: DwtAlert.WARNING,
					iconVisible: true, 
					content: ZaMsg.Domain_Locked_Note,
					colSpan:"*"
				},
				{type: _DWT_ALERT_,
				  containerCssStyle: "padding-bottom:0px",
				  style: DwtAlert.WARNING,
				  iconVisible: true, 
				  content: ZaMsg.Alert_NotebookNotInitialized,
				  relevant:"instance.attrs[ZaDomain.A_zimbraNotebookAccount] == null",
				  relevantBehavior:_HIDE_
				},
				{type:_GROUP_,  numCols:2,
					relevant:"instance.attrs[ZaDomain.A_zimbraNotebookAccount] != null",
					relevantBehavior:_HIDE_,
					items: [
						{ref:ZaDomain.A_zimbraNotebookAccount, type:_EMAILADDR_, 
							label:ZaMsg.Domain_NotebookAccountName, labelLocation:_LEFT_,
							width:250,onChange:ZaDomainXFormView.onFormFieldChanged
						},	
						{type:_SPACER_, height:10},							
						{ref:ZaDomain.A_allNotebookACLS, colSpan:"*", type:_DWT_LIST_, height:"250", width:"100%", 
						 	forceUpdate: true, preserveSelection:true, multiselect:true,cssClass: "DLSource", 
						 	onSelection:ZaDomainXFormView.aclSelectionListener, headerList:headerList, 
							widgetClass:ZaNotebookACLListView
						},	
						{type:_SPACER_, height:10},															
						{type:_GROUP_, numCols:5, colSpan:"*",  tableCssClass:"search_field_tableCssClass", cssClass:"qsearch_field_bar", width:"95%", 
							items: [
								{type:_DWT_BUTTON_, label:ZaMsg.TBB_Delete,
									onActivate:"ZaDomainXFormView.deleteButtonListener.call(this);",
									relevant:"ZaDomainXFormView.isDeleteAclEnabled.call(this)", relevantBehavior:_DISABLE_
								},
								{type:_CELLSPACER_},
								{type:_DWT_BUTTON_, label:ZaMsg.TBB_Edit,
									onActivate:"ZaDomainXFormView.editButtonListener.call(this);",
									relevant:"ZaDomainXFormView.isEditAclEnabled.call(this)", relevantBehavior:_DISABLE_
								},
								{type:_CELLSPACER_},
								{type:_DWT_BUTTON_, label:ZaMsg.NAD_Add,
									onActivate:"ZaDomainXFormView.addButtonListener.call(this);"
								}
							]
						 }
					]
				}
			]
		};
		switchGroup.items.push(case5);
	}
	
	if(ZaSettings.DOMAIN_INTEROP_ENABLED) {	
        tabIx++;
        tabBar.choices.push({value:tabIx, label:ZaMsg.TABT_Interop});
        var case6 = {type: _ZATABCASE_, relevant:("instance[ZaModel.currentTab] == " + tabIx),
			colSizes:["auto"],numCols:1,id:"global_interop_tab",
		 	items: [
				{type:_ZA_TOP_GROUPER_, label:ZaMsg.NAD_Exchange_Settings,
					items: [
						{ ref: ZaDomain.A_zimbraFreebusyExchangeURL,
                             type: _TEXTFIELD_, width: "30em" ,
                             onChange: ZaDomainXFormView.onFormFieldChanged ,
                             label: ZaMsg.NAD_Exchange_URL
						},
						{ ref: ZaDomain.A_zimbraFreebusyExchangeAuthScheme, label: ZaMsg.NAD_Exchange_Auth_Schema,
							type: _OSELECT1_,
					    	onChange: ZaDomainXFormView.onFormFieldChanged
        	           	},
						{ ref: ZaDomain.A_zimbraFreebusyExchangeAuthUsername,
				  	  		type: _TEXTFIELD_, width: "20em",
                         	label: ZaMsg.NAD_Exchange_Auth_User,
					  		onChange: ZaDomainXFormView.onFormFieldChanged
				  		},
					  	{ ref: ZaDomain.A_zimbraFreebusyExchangeAuthPassword, type: _PASSWORD_,
					  	  label: ZaMsg.NAD_Exchange_Auth_Password, width: "20em",
						  onChange: ZaDomainXFormView.onFormFieldChanged
					  	},
                        { ref: ZaDomain.A_zimbraFreebusyExchangeUserOrg, type: _TEXTFIELD_ ,
					  	  label: ZaMsg.NAD_ExchangeUserGroup, width: "30em",
						  onChange: ZaDomainXFormView.onFormFieldChanged
					  	},
                        {type: _GROUP_, colSpan:2, numCols:3, colSizes: ["150px", "*", "auto" ], 
                        	items :[
                            	{type:_CELLSPACER_ },
                              	{
                                  type: _DWT_BUTTON_ , colSpan: 2, label: ZaMsg.Check_Settings, width: "15em",
                                  onActivate: ZaItem.checkInteropSettings
                              	},
                              	{type:_CELLSPACER_}
                             ]
                        }
					]
				}
			]
		};
		switchGroup.items.push(case6);	
	}   
	
	if(ZaSettings.ZIMLETS_ENABLED) {
		tabIx++;
		tabBar.choices.push({value:tabIx, label:ZaMsg.TABT_Zimlets});
       	var case7 = {type:_ZATABCASE_, id:"account_form_zimlets_tab", numCols:1,
        	relevant:("instance[ZaModel.currentTab] == " + tabIx),
			items:[
            	{type:_ZAGROUP_, numCols:1,colSizes:["auto"],
					items: [
                    	{type: _OUTPUT_, value: ZaMsg.NAD_LimitZimletsToDomain, cssStyle:"margin-left: 275px;" },
                    	{type:_ZIMLET_SELECT_,
                            selectRef:ZaDomain.A_zimbraZimletDomainAvailableZimlets,
							ref:ZaDomain.A_zimbraZimletDomainAvailableZimlets,
							choices:ZaDomainXFormView.zimletChoices
						}
					]
				}
			]
		};
    	switchGroup.items.push(case7);
	}
    //domain skin properties
    if(ZaSettings.DOMAIN_SKIN_ENABLED) {
		tabIx++;
		tabBar.choices.push({value:tabIx, label:ZaMsg.TABT_Skin});
       	var case8 = {type:_ZATABCASE_, id:"domain_form_skin_tab", colSizes:["auto"],numCols:1,
        	relevant:("instance[ZaModel.currentTab] == " + tabIx),
			items:[
            	{type:_ZA_TOP_GROUPER_,  label:ZaMsg.NAD_Skin_Color_Settings,//colSizes:["175px","*"],
					items: [
                    	{ref:ZaDomain.A_zimbraSkinForegroundColor,
                            type:_SUPER_DWT_COLORPICKER_,
//                            labelCssStyle:"width:175px", colSizes:["375px","190px"],
                            //msgName:ZaMsg.NAD_zimbraPrefHtmlEditorDefaultFontColor,
                            label:ZaMsg.NAD_zimbraSkinForegroundColor,
                            labelLocation:_LEFT_,
                            resetToSuperLabel:ZaMsg.NAD_ResetToGlobal,
                            onChange:ZaTabView.onFormFieldChanged
                        }  ,
                        {ref:ZaDomain.A_zimbraSkinBackgroundColor,
                            type:_SUPER_DWT_COLORPICKER_,
                            label:ZaMsg.NAD_zimbraSkinBackgroundColor,
                            labelLocation:_LEFT_,  resetToSuperLabel:ZaMsg.NAD_ResetToGlobal,
                            onChange:ZaTabView.onFormFieldChanged
                        }  ,
                        {ref:ZaDomain.A_zimbraSkinSecondaryColor,
                            type:_SUPER_DWT_COLORPICKER_, resetToSuperLabel:ZaMsg.NAD_ResetToGlobal,
                            label:ZaMsg.NAD_zimbraSkinSecondaryColor,
                            labelLocation:_LEFT_,
                            onChange:ZaTabView.onFormFieldChanged
                        },
                        {ref:ZaDomain.A_zimbraSkinSelectionColor,
                            type:_SUPER_DWT_COLORPICKER_,
                            label:ZaMsg.NAD_zimbraSkinSelectionColor,
                            labelLocation:_LEFT_, resetToSuperLabel:ZaMsg.NAD_ResetToGlobal,
                            onChange:ZaTabView.onFormFieldChanged
                        }
					]
				},
                    
                {type:_ZA_TOP_GROUPER_,  label:ZaMsg.NAD_Skin_Logo_Settings,//colSizes:["175px","*"],
					items: [
                       {ref:ZaDomain.A_zimbraSkinLogoURL,
                            type:_SUPER_TEXTFIELD_,  textFieldWidth: "200px",
                            label:ZaMsg.NAD_zimbraSkinLogoURL,
                            labelLocation:_LEFT_, resetToSuperLabel:ZaMsg.NAD_ResetToGlobal,
                            onChange:ZaTabView.onFormFieldChanged
                        },
                        {ref:ZaDomain.A_zimbraSkinLogoAppBanner,
                            type:_SUPER_TEXTFIELD_,  textFieldWidth: "200px",
                            label:ZaMsg.NAD_zimbraSkinLogoAppBanner,
                            labelLocation:_LEFT_, resetToSuperLabel:ZaMsg.NAD_ResetToGlobal,
                            onChange: ZaDomainXFormView.onAppLogoURLChange
//                            onChange:ZaTabView.onFormFieldChanged
                        },
                        { type:_SPACER_, height: 5 },
                        {type:_OUTPUT_, id:ZaDomainXFormView.LogoAppBannerPreviewId,
                            label:ZaMsg.NAD_zimbraLogoAppBannerPreview,
                            getDisplayValue: ZaDomainXFormView.getAppLogoPreview,
                            labelLocation:_LEFT_
                        },
                        { type:_SPACER_, height: 5 },
                        {ref:ZaDomain.A_zimbraSkinLogoLoginBanner,
                            type:_SUPER_TEXTFIELD_,  textFieldWidth: "200px",
                            label:ZaMsg.NAD_zimbraSkinLogoLoginBanner,
                            labelLocation:_LEFT_, resetToSuperLabel:ZaMsg.NAD_ResetToGlobal,
                            onChange: ZaDomainXFormView.onLoginLogoURLChange
                        },
                        { type:_SPACER_, height: 5 },                            
                        {type:_OUTPUT_, id:ZaDomainXFormView.LogoLoginBannerPreviewId,
                            label:ZaMsg.NAD_zimbraLogoLoginBannerPreview,
                            getDisplayValue: ZaDomainXFormView.getLoginLogoPreview,
                            labelLocation:_LEFT_
                        }
                    ]
                }
            ]
		};
    	switchGroup.items.push(case8);
	}
    
    xFormObject.items.push(tabBar);
	xFormObject.items.push(switchGroup);
}

ZaTabView.XFormModifiers["ZaDomainXFormView"].push(ZaDomainXFormView.myXFormModifier);

ZaDomainXFormView.LogoAppBannerPreviewId = Dwt.getNextId() ;

ZaDomainXFormView.onAppLogoURLChange = function (value, event, form) {
    ZaTabView.onFormFieldChanged.call (this, value, event, form) ;

    var appBannerPreviewItem = form.getItemsById (ZaDomainXFormView.LogoAppBannerPreviewId) [0];
    appBannerPreviewItem.updateElement(ZaDomainXFormView.getAppLogoPreview.call(this)) ;
}

ZaDomainXFormView.getAppLogoPreview = function () {
    var width =  120 ;
    var height = 35 ;
    var form = this.getForm ();
    var instance = form.getInstance () ;
    var src = instance.attrs [ZaDomain.A_zimbraSkinLogoAppBanner] ;

    if (src == null && instance.cos != null)
         var src = instance.cos.attrs [ZaDomain.A_zimbraSkinLogoAppBanner];

    var out = AjxBuffer.concat ("<img width=", width, " height=", height,
				" alt='", ZaMsg.AppBannerAlt , "' src=\"", src, "\"",
			">")

    return out ;
}

ZaDomainXFormView.LogoLoginBannerPreviewId = Dwt.getNextId() ;

ZaDomainXFormView.onLoginLogoURLChange = function (value, event, form) {
    ZaTabView.onFormFieldChanged.call (this, value, event, form) ;

    var loginBannerPreviewItem = form.getItemsById (ZaDomainXFormView.LogoLoginBannerPreviewId) [0];
    loginBannerPreviewItem.updateElement(ZaDomainXFormView.getLoginLogoPreview.call(this)) ;
}

ZaDomainXFormView.getLoginLogoPreview = function () {
    var width =  450 ;
    var height = 100 ;
    var form = this.getForm ();
    var instance = form.getInstance () ;
    var src = instance.attrs [ZaDomain.A_zimbraSkinLogoLoginBanner]  ;
    if (src == null && instance.cos != null)
             var src =  instance.cos.attrs [ZaDomain.A_zimbraSkinLogoLoginBanner];

    var out = AjxBuffer.concat ("<img width=", width, " height=", height,
				" alt='", ZaMsg.LoginBannerAlt , "' src=\"", src, "\"",
			">")

    return out ;
}


ZaAccMiniListView = function(parent, className, posStyle, headerList) {
	if (arguments.length == 0) return;
	ZaListView.call(this, parent, className, posStyle, headerList);
	this.hideHeader = true;
}

ZaAccMiniListView.prototype = new ZaListView;
ZaAccMiniListView.prototype.constructor = ZaAccMiniListView;

ZaAccMiniListView.prototype.toString = function() {
	return "ZaAccMiniListView";
};

ZaAccMiniListView.prototype.createHeaderHtml = function (defaultColumnSort) {
	if(!this.hideHeader) {
		DwtListView.prototype.createHeaderHtml.call(this,defaultColumnSort);
	}
}

//-------------------------------------------------------------------------------------------------------
//List View for the zimbraDomainCOSMaxAccounts

ZaDomainCOSMaxAccountsListView = function(parent, className, posStyle, headerList) {
	if (arguments.length == 0) return;
	ZaListView.call(this, parent, className, posStyle, headerList);
	this.hideHeader = true;
    this._app = this.parent.parent._app ;
    
}

ZaDomainCOSMaxAccountsListView.prototype = new ZaListView;
ZaDomainCOSMaxAccountsListView.prototype.constructor = ZaDomainCOSMaxAccountsListView;

ZaDomainCOSMaxAccountsListView.prototype.toString = function() {
	return "ZaDomainCOSMaxAccountsListView";
};

ZaDomainCOSMaxAccountsListView.prototype.createHeaderHtml = function (defaultColumnSort) {
	if(!this.hideHeader) {
		DwtListView.prototype.createHeaderHtml.call(this,defaultColumnSort);
	}
}


ZaDomainCOSMaxAccountsListView.prototype._createItemHtml =
function(item) {
	var html = new Array(50);
	var	div = document.createElement("div");
	div[DwtListView._STYLE_CLASS] = "Row";
	div[DwtListView._SELECTED_STYLE_CLASS] = div[DwtListView._STYLE_CLASS] + "-" + DwtCssStyle.SELECTED;
	div.className = div[DwtListView._STYLE_CLASS];
	this.associateItemWithElement(item, div, DwtListView.TYPE_LIST_ITEM);

    var itemArr = item.split(":");
    var cosId = itemArr [0];
    var cos = ZaCos.getCosById(cosId, this._app) ;
    var cosDisplayValue ;
    
    if (cos) {
        cosDisplayValue = cos.name ;

        if (ZaSettings.isDomainAdmin) {
            var cosDescription = cos.attrs[ZaCos.A_description] ;
            if (cosDescription)
                cosDisplayValue = cosDescription ;
        }
    } else {
        cosDisplayValue = AjxMessageFormat.format (ZaMsg.ERROR_INVALID_COS_VALUE, [cosId]) ;
    }

    var limits = itemArr [1] ;

    var idx = 0;
	html[idx++] = "<table width='100%' cellspacing='2' cellpadding='0'>";

	html[idx++] = "<tr>";
    //cos
    html[idx++] = "<td width=" + this._headerList[0]._width + ">";
    html[idx++] = AjxStringUtil.htmlEncode(cosDisplayValue);
    html[idx++] = "</td>";

    // limits
    html[idx++] = "<td align='left' width=" + this._headerList[1]._width + "><nobr>";
    html[idx++] = AjxStringUtil.htmlEncode(limits);
    html[idx++] = "</nobr></td>";

	html[idx++] = "</tr></table>";
	div.innerHTML = html.join("");
	return div;
}


ZaDomainCOSMaxAccountsListView.prototype._setNoResultsHtml = function() {
	var buffer = new AjxBuffer();
	var	div = document.createElement("div");

	buffer.append("<table width='100%' cellspacing='0' cellpadding='1'>",
				  "<tr><td class='NoResults'><br />",
                  ZaMsg.NO_LIMITS, 
                  "</td></tr></table>");

	div.innerHTML = buffer.toString();
	this._addRow(div);
};
