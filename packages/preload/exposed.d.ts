interface Window {
    readonly openExternalURL: (url: string) => void;
    readonly uuid: () => string;
    readonly maximize: () => void;
    readonly unmaximize: () => void;
    readonly minimize: () => void;
}
