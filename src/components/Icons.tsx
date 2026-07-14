type IconProps = { className?: string };

export function QuillIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M18 4 7 15c-1.1 1.1-1.5 3-1.8 5.8 2.8-.3 4.7-.7 5.8-1.8L22 8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path d="M11 17 5.2 20.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function PlusIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function TrashIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-9 0 1 13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-13" />
    </svg>
  );
}

export function DownloadIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path d="M12 4v11m0 0 4-4m-4 4-4-4M5 19h14" />
    </svg>
  );
}

export function UploadIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path d="M12 16V5m0 0 4 4m-4-4-4 4M5 19h14" />
    </svg>
  );
}

export function CheckIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path d="m5 13 4 4L19 7" />
    </svg>
  );
}

export function XIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}
