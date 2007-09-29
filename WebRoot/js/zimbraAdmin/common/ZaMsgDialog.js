/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2005, 2006 Zimbra, Inc.
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
* Creates a new message dialog.
* @constructor
* @class
* This class represents a reusable message dialog box. Messages can be informational, warning, or
* critical.
*/
function ZaMsgDialog(parent, className, buttons, app) {
	this._app = app;
 	DwtMessageDialog.call(this, parent, className, buttons);
}

ZaMsgDialog.prototype = new DwtMessageDialog;
ZaMsgDialog.prototype.constructor = ZaMsgDialog;

ZaMsgDialog.prototype.setApp = 
function(app) {
	this._app=app;
}

