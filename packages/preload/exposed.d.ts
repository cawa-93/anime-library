interface Window {
    readonly colorScheme: { set: (scheme: "system" | "light" | "dark") => Promise<void>; get: () => Promise<"system" | "light" | "dark">; };
    readonly dialog: { showError: (title: string, message: string) => Promise<void>; };
    readonly hardwareAcceleration: { set: (v: boolean) => Promise<void>; get: () => Promise<boolean>; };
    readonly openExternalURL: (url: string) => Promise<void>;
    readonly uuid: () => string;
    readonly maximize: () => void;
    readonly unmaximize: () => void;
    readonly minimize: () => void;
}
