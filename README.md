# knockout-ts
This is an experimental re-implementation of Knockout written in TypeScript.

Written for personal education and amusement.

(This project is not meant as an infringement on Knockout. The Knockout community and anyone else are free to contribute and/or reuse the code that has been written and knowledge gained in this project.)

Scroll down for a sample on how to use Knockout-TS.

## Features

To mention a few...

* Auto-observables - plain properties turn into observables by default. (Can be turned off)
* Binding namespaces - with "ko" as the pre-set default namespace. Write "ko.text" or just "text".

These have not been implemented yet...

* All the bindings
* Template Engine
* Component-support
* Full extensibility support

## The Project

Assuming this will lead somewhere...

### Background

Knockout-TS came out of the need for a modern MV* framework. 

The Knockout of today has up till now served the web well, but we have reached a point where the technologies of the web are evolving in an ever rapid pace - as experienced with HTLM 5 and new versions of JavaScript. 

The current official framework has certainly not been written with ES6 in mind. It has, in fact, not even catched up with ES5 - the first real modern JavaScript version, because of the backwards compatibility is offers with ES6. You need to declare explicit obeservables because there are no ES5 properties supported. Yes, you can use the Knockout-ES5 plugin but then you can't easily use plugins, like Knockout-Validation, without introducing complexity - when you really desire the simplicity. Other frameworks do not have these problems. 

Knockout is an excellent library in its own way - being easy to learn - but there is a need for a new implementation starting from ES6, with compatibily downwards to ES5, that can grow as JavaScript evolves.

This is what this project aims at exploring.

### Design goals

Knockout-TS should be:

1. Simple to learn and use.
2. Familiar to both new and existing users of Knockout. (* to users coming from other frameworks)
3. Extensible at its core.

### Description (with Ideas)

A single core library upon which to build fantastic apps and plugins.

The goal is to build a modern MV* library that is easy and fun to learn - learning from other popular libraries. A library that is familiar to existing users of Knockout.

However, the goal is NOT to be fully compatible with the  official Knockout library. Features will be re-designed and simplified. Some will certainly be removed. But there will be a high degree of concept compatibility.

The minimum supported JavaScript version is ECMAScript 5.

Because of that, functionality similar to the Knockout-ES5 plugin will be included and enabled by default. That means that programmers will not use observables unless they really need or want to. They are mostly an implementation detail.

The library is ECMAScript 6 first. Built with TypeScript for ES6, now ES2015. That means classes and arrow functions and so on. Documentation and samples written in ES2015.

Web components. Aligned with the standard proposals.

Stressing "extensibility". Not much will be integrated in the core but will rather be provided as plugins. There will be a new plugin model with improved extension points. Great documentation.

Plugin wishlist: Validation. Dependency service.

The code base will be clean, maintainable and easily debuggable because it is written in TypeScript and ES6.

## Sample

This sample shows how to use Knockout-TS with auto-observables in ECMAScript 2015 (ES6).

### View

```HTML
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8">
		<title>Document</title>
	</head>
	<body>
		<form data-bind="submit: register">
			<h1 data-bind="text: fullName + ' (' + clicks + ' clicks)'"></h1>
			<input type="text" data-bind="value: firstName" required></input>
			<input type="text" data-bind="value: lastName" required></input>
			<button type="submit">Register</button>
			<input type="text" data-bind="value: link"></input>
			<button data-bind="href: link">Navigate</button>
			<a data-bind="href: 'http://www.msn.com/'">MSN.com</a>
		</form>
		<script data-main="../src/test" src="require.js"></script>
	</body>
</html>
```

In addition to the existing ''data-bind'' syntax there is also a new attribute syntax (in a custom binding provider):

```HTML
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8">
		<title>Document</title>
	</head>
	<body>
		<form ko.submit="register">
			<h1 ko.text="fullName + ' (' + clicks + ' clicks)'"></h1>
			<input type="text" ko.text-input="firstName" required></input>
			<input type="text" ko.text-input="lastName" required></input>
			<button type="submit">Register</button>
			<input type="text" ko.value="link"></input>
			<button ko.href="link">Navigate</button>
		</form>
		<script data-main="../src/test" src="require.js"></script>
	</body>

</html>
```

### View Model

```ES6
import * as ko from "knockout";

class ViewModel {
	firstName = "Robert";
	lastName = "Sundström";
	get fullName() {
		return `${this.firstName } ${this.lastName }`;
	}
	register() {
		this.clicks++;
		alert(this.fullName);
	}
	clicks = 0;
	link = 'http://www.msn.com/';
}
    
var vm = new ViewModel();
ko.applyBindings(vm);
```

This is what happens:

* Instance variables are turned into ES5 properties backed by observables.
* Plain getters are turned into computed observables.
* Functions are left as they are.

Explicitly declared observables are, of course, still supported.

## Build

Make sure that the [currently] latest TypeScript compiler is installed on your computer.

    npm install -g typescript@next
  
Run the compiler in the project root.

    tsc
    
(This will compile with the configuration in tsconfig.json.)
  
## Develop
  
Run the watcher when developing.

    tsc --watch

I recommend using Visual Studio Code as code editor.

(DISCLAIMER: The "watch"-command only works on Windows 10 at the moment)
