export let extenders = {};

extenders.track = function(target, option) {
	/*  target.subscribe(function(newValue) {
		 track(newValue);
	  }); */
    return target;
};
