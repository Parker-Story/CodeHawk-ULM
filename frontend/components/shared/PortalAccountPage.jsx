"use client";

import AccountView from "@/components/shared/AccountView";
import { PORTAL_CONFIG } from "@/lib/portals";

/**
 * Shared account page: uses config for display name, subtitle, academic info per variant.
 * Pass displayName, subtitle, academicInfo to override.
 */
export default function PortalAccountPage({
  variant,
  displayName,
  subtitle,
  academicInfo,
  onEditProfile = () => {},
}) {
  const config = PORTAL_CONFIG[variant];
  if (!config?.account) return null;
  const placeholders = config.account;
  return (
    <AccountView
      displayName={displayName ?? placeholders.displayName}
      subtitle={subtitle ?? placeholders.subtitle}
      academicInfo={academicInfo ?? placeholders.academicInfo}
      onEditProfile={onEditProfile}
      variant={variant}
    />
  );
}
