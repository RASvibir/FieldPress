import type { LeadItem } from "../../components/PostAiTray";
import type { EditionLookId } from "./looks";

export type SharingOption = "fork" | "colab" | "none";

export type EvidenceItem = {
  id: string;
  url: string;
  source: "ai" | "upload" | "url";
  caption?: string;
  timestamp: string;
};

export type PressyoEditorActionId =
  | "rewrite_voice"
  | "expand"
  | "shorten"
  | "headlines"
  | "factcheck_polish"
  | "draft_from_topic"
  | "uplift_angle"
  | "social_thread"
  | "custom_edit"
  | "find_leads"
  | "lede_suggest"
  | "attribution_check"
  | "ap_style_polish"
  | "structure_dispatch"
  | "punchier"
  | "grammar_polish";

export type PostComposerProps = {
  open: boolean;
  isDark: boolean;
  isSubmitting: boolean;
  editingPublishedId: string | null;
  editingDraftId: string | null;
  formError: string | null;
  authSignedIn: boolean;
  authAvatarUrl?: string;
  displayName: string;
  displayHandle: string;
  draftSavedLabel: string | null;
  newTitle: string;
  newContent: string;
  setNewTitle: (v: string) => void;
  setNewContent: (v: string) => void;
  newSourceUrl: string;
  setNewSourceUrl: (v: string) => void;
  newLocation: string;
  setNewLocation: (v: string) => void;
  newCoordinates: string;
  setNewCoordinates: (v: string) => void;
  newCategory: string;
  setNewCategory: (v: string) => void;
  newEditionStyle: EditionLookId | string;
  setNewEditionStyle: (v: EditionLookId | string) => void;
  newSharingOption: SharingOption;
  setNewSharingOption: (v: SharingOption) => void;
  newIsAnonymous: boolean;
  setNewIsAnonymous: (v: boolean) => void;
  newDecoupleLocationPin: boolean;
  setNewDecoupleLocationPin: (v: boolean) => void;
  newImageUrl: string;
  setNewImageUrl: (v: string) => void;
  newImageCaption: string;
  setNewImageCaption: (v: string) => void;
  builderUseThemePhotoFilter: boolean;
  setBuilderUseThemePhotoFilter: (v: boolean) => void;
  evidenceGallery: EvidenceItem[];
  setEvidenceGallery: (value: EvidenceItem[] | ((prev: EvidenceItem[]) => EvidenceItem[])) => void;
  manualImageUrl: string;
  setManualImageUrl: (v: string) => void;
  showUrlInput: boolean;
  setShowUrlInput: (v: boolean) => void;
  isUnfurling: boolean;
  unfurlStatus: string;
  pressyoBusy: boolean;
  pressyoStatus: string | null;
  pressyoLeads: LeadItem[];
  pressyoCanUndo: boolean;
  onPressyoUndo: () => void;
  onPressyoWrite: (action: string) => void;
  onPressyoFindLeads: () => void;
  onPressyoCustom: (text: string) => void;
  onOpenImbrgr: () => void;
  imbrgrHandoffBusy?: boolean;
  onPressyoAdvanced: (action: PressyoEditorActionId, style?: string) => void;
  onGuestSignInPrompt: () => void;
  onCloseRequest: () => void;
  onSaveDraft: () => void;
  onPost: () => void;
  onPastePrepared: () => void;
  onPinMyArea: () => void;
  onUploadClick: () => void;
  onAddImageUrl: () => void;
  onUnfurlFromText: (text: string) => void;
  onUseVideoFrameAsCover?: () => void;
  hasYoutubeSource: boolean;
  imageFileInputRef: React.RefObject<HTMLInputElement | null>;
  onImageFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  extractYoutubeId: (url: string) => string | null;
  inputClass: string;
  subCardClass: string;
  subTextClass: string;
};
