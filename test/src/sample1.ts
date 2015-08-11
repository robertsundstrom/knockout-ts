import ko from "../../dist/index";

class ViewModel {
	firstName = "Robert";
	lastName = "Sundström";
	get fullName() {
		return `${this.firstName } ${this.lastName }`;
	}
	register() {
		if (this.clicks < 5) {
			this.clicks++;
		}
		this.flag = true;
		
		return false;
	}
	clicks = 0;
	link = 'http://www.msn.com/';
	flag = false;
	
	items = [{ name: "Item 1", value: 1 }, { name: "Item 2", value: 2 }, { name: "Item 3", value: 3 }];
	selectedItem = null;
	
	add() {
		let count = this.items.length;
		this.items.push({ name: "Item " + count, value: count })
	}
}

ko.setBindingProvider(new ko.ModernBindingProvider());

let vm = new ViewModel();
ko.applyBindings(vm);

window.vm = vm;