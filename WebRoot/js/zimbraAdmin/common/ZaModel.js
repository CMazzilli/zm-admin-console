/*
 * ***** BEGIN LICENSE BLOCK *****
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
 * ***** END LICENSE BLOCK *****
 */


function ZaModel(init) {
 	if (arguments.length == 0) return;
	this._evtMgr = new AjxEventMgr();
}


ZaModel.BOOLEAN_CHOICES= [{value:"TRUE", label:ZaMsg.Yes}, {value:"FALSE", label:ZaMsg.No}, {value:null, label:ZaMsg.No}];
ZaModel.BOOLEAN_CHOICES1= [{value:1, label:ZaMsg.Yes}, {value:0, label:ZaMsg.No}, {value:null, label:ZaMsg.No}];

ZaModel.COMPOSE_FORMAT_CHOICES = [{value:"text", label:ZaMsg.Text}, {value:"html", label:ZaMsg.HTML}];
ZaModel.GROUP_MAIL_BY_CHOICES = [{value:"conversation", label:ZaMsg.Conversation}, {value:"message", label:ZaMsg.Message}];
ZaModel.SIGNATURE_STYLE_CHOICES = [{value:"outlook", label:ZaMsg.No}, {value:"internet", label:ZaMsg.Yes}];
ZaModel.REMINDER_CHOICES = [{value:"0",label:ZaMsg.never},{value:1,label:"1"},{value:5,label:"5"},{value:10,label:"10"},{value:15,label:"15"},{value:20,label:"20"},{value:25,label:"25"},{value:30,label:"30"},{value:45,label:"45"},{value:50,label:"50"},{value:55,label:"55"},{value:60,label:"60"}];
ZaModel.ErrorCode = "code";
ZaModel.ErrorMessage = "error_message";
ZaModel.currentStep = "currentStep";
ZaModel.currentTab = "currentTab";


ZaModel.prototype.toString = 
function() {
	return "ZaModel";
}

ZaModel.prototype.addChangeListener = 
function(listener) {
	return this._evtMgr.addListener(ZaEvent.L_MODIFY, listener);
}

ZaModel.prototype.removeChangeListener = 
function(listener) {
	return this._evtMgr.removeListener(ZaEvent.L_MODIFY, listener);    	
}

ZaModel.getTimeZoneChoices = function () {
	var choices = [] ;
	var serverId ;
	for (var i=0; i < AjxTimezoneData.TIMEZONE_RULES.length; i ++){
		serverId = AjxTimezoneData.TIMEZONE_RULES[i].serverId ;
		choices.push({value: serverId, label: serverId}) ;
	}
	return choices ;
}
ZaModel.TIME_ZONE_CHOICES = ZaModel.getTimeZoneChoices() ;

ZaModel.setUnrecoganizedTimezone = function (tz) {
	var new_tz = "Unrecognized";
	for (var i=0; i < ZaModel.TIME_ZONE_CHOICES.length; i ++) {
		if (tz == ZaModel.TIME_ZONE_CHOICES[i].value) {
			new_tz = tz ;
			break ;
		}	
	}
	return new_tz ;
}