import * as ko from "knockout";

class ViewModel {
    text = "Bob";
	people = [
         { name: 'Franklin', credits: 250 },
         { name: 'Mario', credits: 5800 }]

    add() {
        let a: any = ko.resolveObservable(this, this.people)
        a.push({ name: this.text, credits: 10000 });
    }
}

ko.setBindingProvider(new ko.ModernBindingProvider());

let vm = new ViewModel();
ko.applyBindings(vm);

window.vm = vm;