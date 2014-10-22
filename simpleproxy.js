(function(undefined){
	function SimpleProxy() {
		this.signed = false;
		this.error = false;
		this.events = [];
		this.count = 0;
		this.callback = undefined;
	}
	SimpleProxy.prototype.sign = function(events, callback) {
		var isArray = (Object.prototype.toString.call(events) === "[object Array]"), 
			args = [].slice.call(arguments),
			events = isArray ? events : args.slice(0,args.length - 1), 
			count = events.length;

		for ( var i = 0; i < count; i++) {
			this.events.push({
				key : events[i],
				value : undefined
			});
		}
		this.count = count;
		this.callback = isArray ? callback : args[args.length - 1];
		this.signed = true;
	};
	SimpleProxy.prototype.emit = function(event, data) {
		var signed = this.signed,
			error = this.error,
			events = this.events, 
			callback = this.callback, 
			count = events.length,
			isFunction = Object.prototype.toString.call(callback) === '[object Function]';
			
		if (!signed) {
			throw 'error: proxy need to be signed first.';
		}
		if(error){
			return;
		}
		if(event === 'err' || event === 'error'){
			this.error = true;
			if (isFunction) {
				return callback.call(this, data);
			}else{
				throw 'error: ' + data;
			}
		}
		for ( var i = 0; i < count; i++) {
			if (event == events[i].key) {
				events[i].value = data;
			}
		}
		this.count--;
		if (this.count == 0) {
			var values = [undefined];
			for ( var i = 0; i < count; i++) {
				values.push(events[i].value);
			}
			if (isFunction) {
				callback.apply(this, values);
			}
		}
	};
	SimpleProxy.prototype.err = function(err){
		this.emit('err',err);
	};
	
	if (typeof module !== 'undefined' && module
			&& typeof module.exports !== 'undefined') {
		module.exports = SimpleProxy;
	} else {
		this.SimpleProxy = SimpleProxy;
	}
})();
