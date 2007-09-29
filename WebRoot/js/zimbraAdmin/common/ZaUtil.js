/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2006 Zimbra, Inc.
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

/**
* Utility Class for the Admin Console. 
* @class ZaUtil
* 
**/

function ZaUtil () {};

/*
 * @param v: all the valid life time value is end with smhd
 */
ZaUtil.getLifeTimeInSeconds =
function (v){
	if (AjxUtil.isLifeTime(v)) {
		var len = v.length ;
		var d = v.substr (0, len -1);
		var p = v.substr (len - 1, len);
		
		if (p == "s"){
			return d;
		}else if ( p == "m") {
			return d*60 ;
		}else if (p == "h"){
			return d*3600 ;
		}else if (p == "d") {
			return d*216000;
		}
	}else{
		throw (new AjxException(AjxMessageFormat.format(ZaMsg.UTIL_INVALID_LIFETIME,[v])));
	}
}

ZaUtil.findValueInObjArrByPropertyName =
function (arr, value, property){
	if (!property) property = "name" ; //for ZaAccountMemberOfListView 
	   
	for(var i=0; i<arr.length; i++) {
		if (arr[i][property] == value){
			return i ;
		}
	}	
	return -1;
}

ZaUtil.findValueInArray =
function (arr, value){
	for(var i=0; i<arr.length; i++) {
		if (arr[i] == value){
			return i ;
		}
	}	
	return -1;
}

/**
 * remove the duplicate elements from an array
 */
ZaUtil.getUniqueArrayElements =
function (arr) {
	var uniqueArr = [] ;
	for (var i=0; i < arr.length; i++) {
		if (ZaUtil.findValueInArray(uniqueArr, arr[i]) < 0) {
			uniqueArr.push(arr[i]);
		}
	}
	
	return uniqueArr ;
}
