var Guma = Guma || {};

console.log('hey');

Guma.Session = (function(){
	var instance;
	function init(){
		var sessionIdKey = "guma-session";

		return {
			set: function(sessionData){
				window.localStorage.setItem(sessionIdKey, JSON.stringify(sessionData));
			},
			get: function(){
				var result = null;
				try{
					result = JSON.parse(window.localStorage.getItem(sessionIdKey));
				} catch(e){}
				return result;
			}
		}
	}

	return {
		getInstance: function(){
			if(!instance){
				instance = init();
			}
			return instance;
		}
	}
})