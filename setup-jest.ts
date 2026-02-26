import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
	setupZoneTestEnv();
}
