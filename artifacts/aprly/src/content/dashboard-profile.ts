export const dashboardProfileContent = {
  pageTitle: "ACCOUNT",
  accessCard: {
    getFullAccess: "GET FULL ACCESS",
    activate: "ACTIVATE APRLY",
    activeTitle: "YOUR ACCOUNT IS ACTIVE",
    activeDescriptionFrom: "Your full access is activated from {date}.",
    activeDescriptionFallback: "Your full access is active.",
  },
  loginEmail: {
    title: "LOGIN EMAIL",
    emailLabel: "Email",
  },
  personalInfo: {
    title: "PERSONAL INFO",
    firstName: "First name",
    lastName: "Last name",
    save: "SAVE CHANGES",
    successMessage: "Your personal info has been successfully changed.",
  },
  password: {
    title: "ACCOUNT PASSWORD",
    oldPassword: "Old password",
    newPassword: "New password",
    confirmPassword: "Confirm a new password",
    apply: "CHANGE PASSWORD",
    errorBanner: "Please check the passwords you entered.",
    successMessage: "Your account password has been successfully changed.",
    passwordLength: "Password must be 8–20 characters.",
    passwordsMustMatch: "Passwords must match.",
    currentPasswordIncorrect: "Current password is incorrect.",
  },
  actions: {
    logOut: "LOG OUT",
  },
  fieldRequired: "This field is required",
  ok: "OK",
  logout: {
    title: "LOG OUT",
    message: "Are you sure you want to log out?",
    confirm: "CONFIRM & LOG OUT",
  },
  deleteAccount: {
    title: "DELETE ACCOUNT",
    message:
      "Are you sure you want to delete your account? This action cannot be undone.",
    button: "DELETE ACCOUNT",
    confirm: "CONFIRM & DELETE ACCOUNT",
  },
  toast: {
    profileSaved: {
      title: "Profile updated",
      description: "Your name has been saved.",
    },
    passwordSaved: {
      title: "Password updated",
      description: "Your new password is now active.",
    },
    profileError: {
      title: "Could not save profile",
      description: "Please try again.",
    },
    passwordError: {
      title: "Could not update password",
      description: "Check your input and try again.",
    },
    deleteError: {
      title: "Could not delete account",
      description: "Please try again.",
    },
  },
} as const;

export const accountMenuContent = {
  profile: "Profile",
  subscription: "Subscription",
  logOut: "Log out",
} as const;
