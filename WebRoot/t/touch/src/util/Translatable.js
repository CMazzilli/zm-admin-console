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
 * The utility class to abstract different implementations to have the best performance when applying 2D translation
 * on any DOM element.
 *
 * @private
 */
Ext.define('Ext.util.Translatable', {
    requires: [
        'Ext.util.translatable.CssTransform',
        'Ext.util.translatable.ScrollPosition',
        'Ext.util.translatable.CssPosition'
    ],

    constructor: function(config) {
        var namespace = Ext.util.translatable;

        switch (Ext.browser.getPreferredTranslationMethod(config)) {
        case 'scrollposition':
            return new namespace.ScrollPosition(config);
        case 'csstransform':
            return new namespace.CssTransform(config);
        case 'cssposition':
            return new namespace.CssPosition(config);
        }
    }
});
