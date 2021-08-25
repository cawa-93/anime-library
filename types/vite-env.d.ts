/// <reference types="vite/client" />

/**
 * Describes all existing environment variables and their types.
 * Assists in autocomplete and typechecking
 *
 * @see https://github.com/vitejs/vite/blob/eef51cb37db98a1ad9a541bdd3cd74736ff8488d/packages/vite/types/importMeta.d.ts#L62-L69 Base Interface
 */

interface ImportMetaEnv {
  VITE_SHIKI_CLIENT_ID:  string | undefined;
  VITE_SHIKI_CLIENT_SECRET:  string | undefined;
  VITE_UA_TRACK_ID:  string | undefined;
  VITE_DEV_SERVER_URL: string | undefined;
  VITE_APP_VERSION: string | undefined;
}
