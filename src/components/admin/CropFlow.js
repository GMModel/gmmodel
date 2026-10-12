"use client";

import { useRef, useState } from "react";
import ImageCropper from "@/components/admin/ImageCropper";
import { uploadMedia } from "@/lib/clientUpload";

const isPhoto = (f) => f.type.startsWith("image/") || /\.(jpe?g|png|webp|gif|heic|heif)$/i.test(f.name || "");

// Shared "choose photos -> crop each one -> upload" flow for the admin.
//   const flow = useCropFlow({ aspect: 1, allowFit: true, outWidth: 1200, title: "..." });
//   flow.start(files, (url) => setSomething(url));   // e.g. from a file input's onChange
//   ...and render {flow.dialog} once in the component.
// Photos are cropped one at a time (the dialog shows "Ảnh 1/3"...); only the cropped result is uploaded,
// and each uploaded URL is passed to the callback given to start().
export function useCropFlow(options = {}) {
  const { aspect = 1, outWidth = 1600, allowFit = false, outputType = "image/jpeg", title = "Chọn vùng ảnh" } = options;
  const [jobs, setJobs] = useState([]); // { file, onUrl, id }
  const [total, setTotal] = useState(0);
  const nextId = useRef(1);

  function start(fileList, onUrl) {
    const files = [...(fileList ?? [])].filter(isPhoto);
    if (files.length === 0) return;
    setJobs((list) => [...list, ...files.map((file) => ({ file, onUrl, id: nextId.current++ }))]);
    setTotal((n) => n + files.length);
  }

  function finish() {
    setJobs((list) => {
      const rest = list.slice(1);
      if (rest.length === 0) setTotal(0);
      return rest;
    });
  }

  const current = jobs[0];

  // Throws on failure so the crop dialog stays open and shows the error (the admin can retry).
  async function handleDone(cropped) {
    const url = await uploadMedia(cropped, undefined, { skipPrepare: true });
    current.onUrl(url);
    finish();
  }

  const dialog = current ? (
    <ImageCropper
      key={current.id}
      file={current.file}
      aspect={aspect}
      outWidth={outWidth}
      allowFit={allowFit}
      outputType={outputType}
      title={title}
      counter={total > 1 ? `Ảnh ${total - jobs.length + 1}/${total}` : ""}
      onCancel={finish}
      onDone={handleDone}
    />
  ) : null;

  return { start, dialog };
}
