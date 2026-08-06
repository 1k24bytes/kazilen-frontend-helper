"use client";

import AuthGuard from "../components/AuthGuard";

export default function JobsLayout({ children }) {
  return <AuthGuard>{children}</AuthGuard>;
}
