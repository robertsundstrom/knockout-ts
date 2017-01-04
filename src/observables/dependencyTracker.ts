import { Subscribable } from "observable";

interface DependencyFrame {
	onDependencyDetected: (subscribable: Subscribable<any>) => void;
	parent: DependencyFrame;
}

export class DependencyTracker {
	private static _frame: DependencyFrame = undefined;

	static begin(onDetected: (subscribable: Subscribable<any>) => void): void {
		DependencyTracker._frame = {
			onDependencyDetected: onDetected,
			parent: DependencyTracker._frame
		};
	}

	static end(): void {
		DependencyTracker._frame = DependencyTracker._frame.parent;
	}

	static get isTracking() {
		return DependencyTracker._frame !== undefined;
	}

	static registerDependency(subscribable: Subscribable<any>): void {
		DependencyTracker._frame.onDependencyDetected(subscribable);
	}
}