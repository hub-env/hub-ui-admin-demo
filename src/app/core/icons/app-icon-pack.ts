import { classPack } from 'ng-hub-ui-icons';

/**
 * Points `<hub-icon>` at the app's own mask-drawn classes (src/styles/app-icons.scss),
 * so a glyph is written the same way whether it is rendered by hub-icon or handed
 * to hub-nav as a class string.
 */
export const appIconPack = classPack({
	template: (name: string) => `app-icon app-icon--${name}`
});

/** What hub-nav expects in `HubNavItem.icon`. */
export function navIcon(name: string): string {
	return `app-icon app-icon--${name}`;
}
