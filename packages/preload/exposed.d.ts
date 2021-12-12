interface Window {
    readonly colorScheme: { set: (scheme: "system" | "light" | "dark") => Promise<any>; get: () => Promise<"system" | "light" | "dark">; };
    readonly dialog: { showError: (title: string, message: string) => Promise<void>; };
    readonly openExternalURL: (url: string) => Promise<void>;
    readonly uuid: () => string;
    readonly maximize: () => void;
    readonly unmaximize: () => void;
    readonly minimize: () => void;
}
