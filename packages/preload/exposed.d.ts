interface Window {
    readonly dialog: { showError: (title: string, message: string) => Promise<void>; };
    readonly openExternalURL: (url: string) => void;
    readonly uuid: () => string;
    readonly maximize: () => void;
    readonly unmaximize: () => void;
    readonly minimize: () => void;
}
