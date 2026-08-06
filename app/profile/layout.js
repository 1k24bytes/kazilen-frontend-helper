"use client";

import AuthGuard from "../components/AuthGuard";

export default function ProfileLayout({ children }) {
  return <AuthGuard>{children}</AuthGuard>;
}
