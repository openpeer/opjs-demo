define(['text!templates/user.html', 'text!templates/user-line.html', 'backbone', '_', 'layoutmanager'],
    function(userHtml, userLineHtml, Backbone, _) {
        'use strict';

        var service;

        var UserSettingsLine = Backbone.Layout.extend({
            tagName: 'li',
            template: _.template(userLineHtml),
            events: {
                'click a.logout': 'logout'
            },
            initialize: function(options){

            },
            serialize: function() {
                return this.model.toJSON();
            },
            logout: function(e){
                e.preventDefault();
                var self = this;
                service.logoutService(this.model.get('provider')).then(function(){
                    if(self.$el.parents('ul.sn').find('li').length == 1){
                        window.location.reload(true);
                    } else {
                        $('.user-menu .login-form a[data-provider="'+ self.model.get('provider') +'"]').show();
                        self.trigger('logout', self.model.get('provider'));
                        self.remove();
                    }
                });
            }
        });

        var UserView = Backbone.Layout.extend({
            className: 'user-view',
            template: _.template(userHtml),
            status: null,
            events: {
                'click a.settings': 'openSettings',
                'click a[data-provider]': 'requestAuth'
            },
            initialize: function(options){
                this.collection = options.collection;
                service = options.service;
            },
            serialize: function() {
                return this.collection.at(0).toJSON();
            },
            setStatus: function(status){
                var el = this.$el.find('span.user-status');

                el.attr('class', 'user-status');
                if(status !== 'offline'){
                    el.addClass(status);
                    this.status = status;
                }
            },
            afterRender: function(){
                var self = this;
                this.collection.each(function(model){
                    var line = new UserSettingsLine({ model: model});
                    self.insertView('.sn', line);
                    line.render();

                    line.on('logout', function(){
                        self.collection.remove(line.model);
                        self.render();
                        if(self.status) self.setStatus(self.status);
                    });

                    self.$el.find('.login-form a[data-provider="'+ model.get('provider') +'"]').hide();
                });

                if(this.collection.length === this.$el.find('.login-form a[data-provider]').length) this.$el.find('.loginForm').hide();
            },
            requestAuth: function(event) {
                event.preventDefault();
                var provider = $(event.target).data('provider');
                service.loginService(provider);
            },
            openSettings: function(){
               this.$el.find('a.settings').toggleClass('active');
               this.$el.find('.user-menu').toggle();
            }
        });

        return UserView;
    });

