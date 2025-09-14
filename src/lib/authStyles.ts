import { ThemeSupa } from "@supabase/auth-ui-shared";

export const authAppearance = {
  theme: ThemeSupa,
  variables: {
    default: {
      colors: {
        brand: "hsl(var(--primary))",
        brandAccent: "hsl(var(--primary))",
        brandButtonText: "hsl(var(--primary-foreground))",
        defaultButtonBackground: "hsl(var(--background))",
        defaultButtonBackgroundHover: "hsl(var(--accent))",
        defaultButtonBorder: "hsl(var(--border))",
        defaultButtonText: "hsl(var(--foreground))",
        dividerBackground: "hsl(var(--border))",
        inputBackground: "hsl(var(--background))",
        inputBorder: "hsl(var(--border))",
        inputBorderHover: "hsl(var(--ring))",
        inputBorderFocus: "hsl(var(--ring))",
        inputText: "hsl(var(--foreground))",
        inputLabelText: "hsl(var(--foreground))",
        inputPlaceholder: "hsl(var(--muted-foreground))",
        messageText: "hsl(var(--muted-foreground))",
        messageTextDanger: "hsl(var(--destructive))",
        anchorTextColor: "hsl(var(--primary))",
        anchorTextHoverColor: "hsl(var(--primary))",
      },
      space: {
        spaceSmall: "0.5rem",
        spaceMedium: "1rem",
        spaceLarge: "1.5rem",
        labelBottomMargin: "0.5rem",
        anchorBottomMargin: "0.5rem",
        emailInputSpacing: "0.5rem",
        socialAuthSpacing: "0.5rem",
        buttonPadding: "0.75rem 1rem",
        inputPadding: "0.75rem 1rem",
      },
      fontSizes: {
        baseBodySize: "0.875rem",
        baseInputSize: "0.875rem",
        baseLabelSize: "0.875rem",
        baseButtonSize: "0.875rem",
      },
      fonts: {
        bodyFontFamily: "inherit",
        buttonFontFamily: "inherit",
        inputFontFamily: "inherit",
        labelFontFamily: "inherit",
      },
      borderWidths: {
        buttonBorderWidth: "1px",
        inputBorderWidth: "1px",
      },
      radii: {
        borderRadiusButton: "0.5rem",
        buttonBorderRadius: "0.5rem",
        inputBorderRadius: "0.5rem",
      },
    },
  },
};
