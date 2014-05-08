
Ext.define('ZCS.controller.calendar.ZtNewAppointmentController', {

    extend: 'ZCS.controller.ZtItemController',

    requires: [
        'ZCS.view.calendar.ZtNewAppointment',
        'ZCS.common.ZtUtil',
        'Ext.ux.TouchCalendarView'
    ],

    config: {

        refs: {
            //event handlers
            newApptPanel: 'newapptpanel',

            //other
            newApptForm: 'newapptpanel formpanel'
        },

        control: {
            newApptPanel: {
                cancel: 'doCancel',
                create: 'doSave',
                multiAddRemove: 'doMultiAddRemove'
            }
        },

        models: ['ZCS.model.mail.ZtInvite'],

        stores: ['ZCS.store.calendar.ZtCalendarStore'],

        composeMode:    null,

        msg:  null,

        event: null,

        inviteId: null,

        action: null
    },

    /**
     * Displays the appointment form to either create a new appointment or edit an existing one.
     */
    showNewApptForm: function(mode, msg, event) {
        var me = this,
            panel = this.getNewApptPanel(),
            isEdit = (mode === ZCS.constant.OP_EDIT);

        this.setComposeMode(mode);
        panel.resetForm();

        Ext.fly(this.getEditor()).addCls('zcs-fully-editable');

        // Set the title of the form
        panel.down('titlebar').setTitle(isEdit ? ZtMsg.editAppointment : ZtMsg.createAppointment);

        // Fill in form fields if we're handed a contact
        if (isEdit) {
            this.setMsg(msg);
            this.setInviteId(event.get('invId'));
            this.populateForm(event);
        }

        me.unhideAppointmentForm();
    },

    populateForm: function(event) {
        var	panel = this.getNewApptPanel(),
            form = panel.down('formpanel'),
            value, formField,
            msg = this.getMsg(),
            invite = msg.get('invite'),
	        isSeries = ZCS.app.getCalendarController().getIsSeries();

        // Create and populate the simple attrs
        Ext.each(ZCS.constant.CALENDAR_FIELDS, function(attr) {
            value = invite.get(attr);
            if (value) {
                formField = form.down('field[name=' + attr + ']');

	            if (formField) {
		            if (attr == 'start' || attr == 'end') {

			            var dateValue = isSeries ? invite.get(attr) : event.get(attr);
			            //Set the date picker
			            formField.setValue(dateValue);

			            //Set the time picker
			            formField = form.down('field[name=' + attr + 'Time]');
			            if (formField) {
				            formField.setValue(dateValue);
			            }
		            }
		            else if (attr !== 'repeat') {
                        formField.setValue(value);
		            }
	            }
            }
        }, this);

        // Create as many fields as we need for each multiple-occurring attribute (at least one will be added)
        var data = invite.get('attendees'),
            formField,
            at = [],
            container = panel.down('attendeecontainer');
        Ext.each(data, function(field, index) {
            if (field.get('type') === ZCS.constant.CUTYPE_INDIVIDUAL) {
                container.addField();
                at.push(field);
            }
        }, this);

        formField = container.query('contactfield[name=attendee]');
        Ext.each(formField, function(item, index) {
                item.addBubble(at[index]);
        }, this);

        if (invite.get('recurrence')) {
            formField = form.down('field[name=recurrence]');
            if (formField) {
                formField.setValue(invite.get('recurrence'));
                formField.setHidden(false);
                var repeatField = form.down('field[name=repeat]');
                repeatField.setHidden(true);
            }
        }

        var description = invite.get('notes');
        if (description) {
            var editor = this.getEditor();
            editor.innerHTML = description;
        }
    },

    unhideAppointmentForm: function () {
        if (Ext.os.deviceType === "Phone") {
            this.getNewApptPanel().element.dom.style.removeProperty('display');
        } else {
            this.getNewApptPanel().show({
                type: 'fadeIn',
                duration: 250
            });
        }
    },

    /**
     * Hides the contact form.
     */
    hideAppointmentForm: function() {
        var panel = this.getNewApptPanel();

        if (Ext.os.deviceType === "Phone") {
            panel.element.dom.style.setProperty('display', 'none');
        } else {
            panel.hide({
                type: 'fadeOut',
                duration: 250
            });
        }

        panel.resetForm();
        this.setComposeMode(null);
    },

    getNewApptPanel: function() {
        if (!this.newApptPanel) {
            this.newApptPanel = Ext.create('ZCS.view.calendar.ZtNewAppointment');
            Ext.Viewport.add(this.newApptPanel);
        }

        return this.newApptPanel;
    },

    /**
     * @private
     */
    doCancel: function() {
        this.hideAppointmentForm();
    },

    doSave: function() {
        var newAppt = this.getCalendarModel(),
            mode = this.getComposeMode();
        if (newAppt) {
            if (mode === ZCS.constant.OP_EDIT) {
                var msg = this.getMsg(),
                    invite = msg.get('invite'),
                    me = this;
                Ext.each(ZCS.constant.CALENDAR_FIELDS, function(attr){
                    invite.set(attr, newAppt.get(attr));
                });
                var att = this.setAttendees(invite.get('attendees'), newAppt.get('attendee'));
                invite.set('attendees', att);
                invite.set('startTime', newAppt.get('startTime'));
                invite.set('endTime', newAppt.get('endTime'));
                if (this.isValidAppt(invite)) {
                    this.modifyAppt(invite);
                }
            } else {
                if (this.isValidAppt(newAppt)) {
                    this.createAppt(newAppt);
                }
            }
        }
    },

    setAttendees: function(oldAttendees, newAttendees) {

        var attendees = [];
        if (newAttendees) {
            for(var i = 0, len = newAttendees.length; i< len; i++){
                var newAttendee = newAttendees[i];
                var oldAttendeeInstance = findAttendee(newAttendee.get('email'));
                if (oldAttendeeInstance) {
                    newAttendee.ptst = oldAttendeeInstance.ptst || ZCS.constant.PSTATUS_UNKNOWN;
                    newAttendee.set('type', (oldAttendeeInstance.get('type') || ZCS.constant.CUTYPE_INDIVIDUAL));
                } else {
                    newAttendee.ptst = ZCS.constant.PSTATUS_UNKNOWN;
                    newAttendee.set('type', ZCS.constant.CUTYPE_INDIVIDUAL);
                }
                attendees.push(newAttendee);
            }
        }
        return attendees;

        function findAttendee(emailId){
            if (oldAttendees) {
                for(var i = 0, len = oldAttendees.length; i < len; i++){
                    var oldAttendeeInstance = oldAttendees[i]
                    if(oldAttendeeInstance.get('email') === emailId){
                        var attendee = oldAttendees.splice(i,1);
                        return attendee[0];
                    }
                }
            }
        }
    },

    isValidAppt: function(newAppt) {
        if (!newAppt.get('subject')) {
            Ext.Msg.alert(ZtMsg.error, ZtMsg.errorMissingSubject);
        } else if (!this.isValidTime(newAppt)) {
            Ext.Msg.alert(ZtMsg.error, ZtMsg.errorInvalidApptEndBeforeStart);
        } else {
            return true;
        }
        return false;
    },

    /**
     * @private
     */
    createAppt: function(appt, callback, scope) {
        var folder = ZCS.session.getCurrentSearchOrganizer(),
            me = this;

        appt.save({
            folderId: folder ? folder.get('zcsId') : null,
            success: function() {
                me.hideAppointmentForm();
                ZCS.app.fireEvent('showToast', ZtMsg.appointmentCreated);
                if (callback) {
                    callback.apply(scope);
                }
                me.reloadCalendar(false);
            },
            failure: function() {
                ZCS.app.fireEvent('showToast', ZtMsg.errorCreateAppt);
            }
        }, this);
    },

    modifyAppt: function(invite) {
        var me = this,
            data = {
	            op:         'modify',
	            id:         this.getInviteId()
            },
	        calController = ZCS.app.getCalendarController(),
	        event = calController.getEvent(),
	        isInstance = event.get('isRecur') && !calController.getIsSeries(),
	        isException = invite.get('isException');

	    if (isInstance && !isException) {
		    data.createException = true;
	    }

	    this.performOp(invite, data, function() {
		    me.reloadCalendar(true, invite); // Reload to show newly updated state of the appointment
		    Ext.Function.defer(function() {
			    me.hideAppointmentForm();
		    }, 100);
		    ZCS.app.fireEvent('showToast', ZtMsg.appointmentEdited);
	    });
    },

    reloadCalendar: function(isEdit, invite) {
        var msg = this.getMsg();
        if (isEdit) {
            msg.set('invite', invite);
            ZCS.app.getCalendarController().showItem(msg, isEdit);
        }
		ZCS.app.getCalendarController().loadCalendar();
    },

    getCalendarModel: function() {
        var appt = Ext.create('ZCS.model.mail.ZtInvite'),
            values = this.getNewApptForm().getValues(),
            editor = this.getEditor();

        ZCS.util.setFields(values, appt, ZCS.constant.CALENDAR_FIELDS);
        appt.set('startTime', values['startTime']);
        appt.set('endTime', values['endTime']);
        appt.set('notes', editor.innerHTML);

        return appt;
    },

    doMultiAddRemove: function(button) {
        var idParams = ZCS.util.getIdParams(button.getItemId()),
            type = idParams.type,
            action = idParams.action,
            container = this.getNewApptPanel().down(type + 'container');


        if (container && action === 'remove') {
            container.removeField(idParams.fieldId);
            return;
        }
        if (container && action === 'add') {
            container.addField();
        }
    },

    // Resets the form back to its initial state
    resetForm: function () {
        this.down('titlebar').setTitle(ZtMsg.appointmentCreated);
        this.down('.formpanel').reset();
        this.down('attendeecontainer').reset();
    },

    getEditor: function() {
        var panel = this.getNewApptPanel(),
            form = panel.down('formpanel'),
            bodyFld = form.down('#body'),
            editor = bodyFld.element.query('.zcs-editable')[0];

        return editor;
    },

    /**
     * Checks if the start time is greater than the end time.
     * @param newAppt
     * @returns {boolean}
     */
    isValidTime: function(newAppt) {
        var startDate = newAppt.get('start'),
            endDate = newAppt.get('end'),
            startTime = newAppt.get('startTime'),
            endTime = newAppt.get('endTime');

        startDate.setHours(startTime.getHours());
        startDate.setMinutes(startTime.getMinutes());

        endDate.setHours(endTime.getHours());
        endDate.setMinutes(endTime.getMinutes());

        if (startDate > endDate) {
            return false;
        }
        return true;
    }
});