export type ModalName = "none" | "paywall" | "measurement" | "settings";

export interface UiState {
  activeModal: ModalName;
  isCommandMenuOpen: boolean;
}

export const initialUiState: UiState = {
  activeModal: "none",
  isCommandMenuOpen: false
};
