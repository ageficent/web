odoo.define('web_clock.systray', function (require) {
    "use strict";

    var config = require('web.config');
    var core = require('web.core');
    var session = require('web.session');
    var SystrayMenu = require('web.SystrayMenu');
    var Widget = require('web.Widget');

    var QWeb = core.qweb;

    var Clock = Widget.extend({
        template:'web.Clock',
        events: {
            "click": "_onClockClick",
        },
        init: function () {
            this._super.apply(this, arguments);
            this.user_timezone = 0;
        },
        start: function () {
            var self = this;
            this._getTimeZone().then(function (){
                self._showTime();
            });
        },
        /**
         * _getTimeZone() gets timezone from user preferences
         * @private
         */
        _getTimeZone: function () {
            var self = this;
            return this._rpc({
                model: 'res.users',
                method: 'get_timezone',
                args: [, ],
            })
            .then(function (result) {
                var offset = parseInt(result);
                if (offset != 0) {
                    var offset_h = parseInt(offset/100);
                    var offset_m = (offset%(offset_h*100))/60;
                    self.user_timezone = offset_h + offset_m;
                }
            });
        },
        /**
         * _showTime() displays the current time in the clock
         * @private
         */
        _showTime: async function () {
            // Take into account user preferences timezone
            var nd = new Date();
            var utc = nd.getTime() + (nd.getTimezoneOffset() * 60000);
            var today = new Date(utc + (3600000*this.user_timezone));

            var hours = today.getHours();
            var minutes = today.getMinutes();
            var seconds = today.getSeconds();
            if (minutes < 10) {minutes = "0" + minutes};  // add zero in front of numbers < 10
            if (seconds < 10) {seconds = "0" + seconds};  // add zero in front of numbers < 10

            // render value
            document.getElementById('MyClockDisplay').innerHTML = hours + ":" + minutes + ":" + seconds;

            // wait for 1s
            await this._sleep(1000);

            // Do it again
            this._showTime();
        },
        /**
         * _sleep(ms) pauses execution for a certain period of time in ms
         * @private
         */
        _sleep: function (ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        },
        _onClockClick: function () {
            var self = this;
            var session = this.getSession();
            this.trigger_up('clear_uncommitted_changes', {
                callback: function () {
                    self._rpc({
                            route: "/web/action/load",
                            params: {
                                action_id: "base.action_res_users_my",
                            },
                        })
                        .done(function (result) {
                            result.res_id = session.uid;
                            self.do_action(result);
                        });
                },
            });
        },

    });

    Clock.prototype.sequence = 10;
    SystrayMenu.Items.push(Clock);

    // to test activity menu in unit test in case we need it
    return {
        Clock: Clock,
    };
});