export declare class KeyBinding {
    eventCodes: string[];
    isPressed: boolean;
    justPressed: boolean;
    justReleased: boolean;
    constructor(...code: string[]);
    static CreateKeyBinding(code: string): KeyBinding;
    static CreateMouseBinding(code: number): KeyBinding;
}
