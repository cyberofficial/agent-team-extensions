/** Browser entry registering the grouped subagent-session catalog action. */
import type { Context as ClientContext } from '@deepseek-ai/cordis';
/** Required browser services for navigation, slots, locale, and the right Sidebar. */
export declare const inject: string[];
export type { SessionsCatalogKey } from './locales.ts';
/**
 * Register the sessions locale dictionaries, the sidebar chat registration, and
 * the grouped catalog action on the Client Context.
 * @param ctx - Client Context with the declared `inject` services available.
 */
export declare function apply(ctx: ClientContext): void;
