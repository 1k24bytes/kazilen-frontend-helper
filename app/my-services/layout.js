"use client";

import AuthGuard from "../components/AuthGuard";

export default function MyServicesLayout({ children }) {
  return <AuthGuard>{children}</AuthGuard>;
}
