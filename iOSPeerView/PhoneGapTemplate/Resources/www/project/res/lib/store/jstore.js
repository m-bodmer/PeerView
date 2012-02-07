(function($, undefined) {

    $.store = function(driver, serializers) {
        var that = this;

        if (typeof driver == 'string') {
            if ($.store.drivers[driver]) this.driver = $.store.drivers[driver];
            else throw new Error('Unknown driver ' + driver);
        }

        this.driver.init();

        if (!serializers) serializers = $.store.serializers;

        this.serializers = {};
        $.each(serializers,
        function(key, serializer) {
            if (!$.isFunction(this.init)) return true; 
            that.serializers[key] = this;
            that.serializers[key].init(that.encoders, that.decoders);
        });
    };

    $.extend($.store.prototype, {
        get: function(key) {
            var value = this.driver.get(key);
            return this.driver.encodes ? value: this.unserialize(value);
        },
        set: function(key, value) {
            this.driver.set(key, this.driver.encodes ? value: this.serialize(value));
        },
        del: function(key) {
            this.driver.del(key);
        },
        flush: function() {
            this.driver.flush();
        },
        driver: undefined,
        encoders: [],
        decoders: [],
        serialize: function(value) {
            var that = this;

            $.each(this.encoders,
            function() {
                var serializer = that.serializers[this + ""];
                if (!serializer || !serializer.encode) return true;
                value = serializer.encode(value);
            });

            return value;
        },
        unserialize: function(value) {
            var that = this;
            if (!value) return value;

            $.each(this.decoders,
            function() {
                var serializer = that.serializers[this + ""];
                if (!serializer || !serializer.decode) return true;
                value = serializer.decode(value);
            });

            return value;
        }
    });

    $.store.drivers = {

        'windowName': {
            cache: {},
            encodes: true,
            available: function() {
                return true;
            },
			
			getWindow: function(){
				if (window.top != window.self){
					return window.top;
				} else{
					return window;
				}
			},

            init: function() {
                this.load();
            },
            save: function() {
                this.getWindow().name = $.store.serializers.json.encode(this.cache);
            },
            load: function() {
                try {
                    this.cache = $.store.serializers.json.decode(this.getWindow().name + "");
                    if (typeof this.cache != "object") this.cache = {};
                } catch(e) {
                    this.cache = {};
                    this.getWindow().name = "{}";
                }
            },
            get: function(key) {
                return this.cache[key];
            },
            set: function(key, value) {
                this.cache[key] = value;
                this.save();
            },
            del: function(key) {
                try {
                    delete this.cache[key];
                } catch(e) {
                    this.cache[key] = undefined;
                }

                this.save();
            },
            flush: function() {
                this.getWindow().name = "{}";
            }
        }
    };

    $.store.serializers = {
        'json': {
            ident: "$.store.serializers.json",
            init: function(encoders, decoders) {
                encoders.push("json");
                decoders.push("json");
            },
            encode: JSON.stringify,
            decode: JSON.parse
        }
    };

})(jQuery);

$.storage = new $.store('windowName');

function setVariable(key, value){
	$.storage.set(key, value)
}

function getVariable(key){
	if (!key) return key;
	var re = $.storage.get(key);
	return re;
}

function setAttribute(id, attr, key){
	$(document).find('[id='+id+']').attr(attr, getVariable(key));
}

function setCssProperty(id, attr, key){
	$(document).find('[id='+id+']').css(attr, getVariable(key));
}
