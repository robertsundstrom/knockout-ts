import ko from "../../dist/index";

ko.config({
	autoTrack: false
});

var vm = {
	firstName: ko.observable("Robert"),
	lastName: ko.observable("Sundström"),
	fullName: ko.computed(function() {
		return vm.firstName() + " " + vm.lastName();
	}),
	register: function() {
		if (this.clicks() < 5) {
			this.clicks(this.clicks() + 1);
		}
		this.flag(true);
	},
	clicks: ko.observable(0),
	link: ko.observable('http://www.msn.com/'),
	flag: ko.observable(false)
}

window.vm = vm;

ko.applyBindings(vm);