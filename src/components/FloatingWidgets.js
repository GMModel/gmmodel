"use client";

import ContactIcons from "./ContactIcons";

export default function FloatingWidgets() {
  return (
    <div className="fixed bottom-4 right-4 z-40 sm:bottom-6 sm:right-6">
      <ContactIcons />
    </div>
  );
}
