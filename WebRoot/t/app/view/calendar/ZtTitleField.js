/*
 * ***** BEGIN LICENSE BLOCK *****
 * Zimbra Collaboration Suite Web Client
 * Copyright (C) 2013 Zimbra Software, LLC.
 *
 * The contents of this file are subject to the Zimbra Public License
 * Version 1.4 ("License"); you may not use this file except in
 * compliance with the License.  You may obtain a copy of the License at
 * http://www.zimbra.com/license.
 *
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * ***** END LICENSE BLOCK *****
 */

/**
 * This class displays the title field on the create appointment form.
 *
 * @author Komal Kakani <kkakani@zimbra.com>
 */
Ext.define('ZCS.view.calendar.ZtTitleField', {

    extend: 'Ext.Container',

    xtype: 'titlecontainer',
    config: {
        items: [
            {
                xtype:       'textfield',
                name:        'title',
                placeHolder:  ZtMsg.titleLabel,
                cls: 'create-appt-margin first'
            },
            {
                xtype:       'textfield',
                name:        'location',
                placeHolder:  ZtMsg.locationLabel,
                cls: 'create-appt-margin last'
            }
        ]
    }
});
