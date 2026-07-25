// Everything here gets reassigned by more than one module, which is why it's
// not just a handful of top-level `let`s in whichever file happens to use it
// first. Mutate properties on this object (state.x = y), never destructure
// and reassign the destructured copy - that'll silently stop working.
export const state = {
    settings: null,
    toggleBtn: null,
    panel: null,
    observer: null,
    safetyPassTimer: null,
    playbackScanInterval: null,
};
