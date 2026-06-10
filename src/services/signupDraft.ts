export type SignupDraft = {
  firstName?: string;
  lastName?: string;
  userName?: string;
  email?: string;
  phoneNumber?: string;
  password?: string;
};

let draft: SignupDraft = {};

export const setSignupDraft = (patch: Partial<SignupDraft>): void => {
  draft = { ...draft, ...patch };
};

export const getSignupDraft = (): SignupDraft => ({ ...draft });

export const clearSignupDraft = (): void => {
  draft = {};
};
