export type IconName =
  | "ball"
  | "shirt"
  | "code"
  | "book"
  | "tool"
  | "news"
  | "users"
  | "calendar"
  | "tag"
  | "steam"
  | "copy"
  | "search"
  | "check"
  | "alert"
  | "download"
  | "menu";
const paths: Record<Exclude<IconName, "ball">, React.ReactNode> = {
  shirt: <path d="m8 3 4 2 4-2 6 4-3 5-3-2v12H8V10l-3 2-3-5Z" />,
  code: <path d="m8 6-6 6 6 6m8-12 6 6-6 6M14 3l-4 18" />,
  book: (
    <>
      <path d="M12 5C9 2 4 3 2 4v16c3-1 7-1 10 1 3-2 7-2 10-1V4c-3-1-7-2-10 1Z" />
      <path d="M12 5v16" />
    </>
  ),
  tool: (
    <path d="M21 3a7 7 0 0 1-9 9L5 21a3 3 0 0 1-4-4l9-7a7 7 0 0 1 9-9l-4 4 4 4Z" />
  ),
  news: (
    <>
      <rect x="3" y="2" width="18" height="20" rx="3" />
      <path d="M7 7h10M7 12h10M7 17h6" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="7" r="4" />
      <path d="M1 22v-4a8 8 0 0 1 16 0v4ZM18 3a4 4 0 0 1 0 8m2 3a7 7 0 0 1 3 8" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="17" rx="3" />
      <path d="M7 1v7m10-7v7M3 11h18" />
    </>
  ),
  tag: (
    <>
      <path d="M3 3h10l9 9-10 10-9-9Z" />
      <circle cx="8" cy="8" r="1" />
    </>
  ),
  steam: (
    <>
      <circle cx="16" cy="8" r="6" />
      <circle cx="16" cy="8" r="3" />
      <circle cx="6" cy="18" r="4" />
      <path d="m9 20 10-7M0 14l6 4 5-7" />
    </>
  ),
  copy: (
    <>
      <rect x="8" y="6" width="13" height="16" rx="2" />
      <path d="M16 6V2H3v15h5" />
    </>
  ),
  search: (
    <>
      <circle cx="10" cy="10" r="7" />
      <path d="m15 15 7 7" />
    </>
  ),
  check: <path d="m3 12 6 6L22 4" />,
  alert: (
    <>
      <path d="m12 2 11 20H1Z" />
      <path d="M12 8v6m0 3v1" />
    </>
  ),
  download: <path d="M12 1v15m-6-6 6 6 6-6M3 17v5h18v-5" />,
  menu: <path d="M3 5h18M3 12h18M3 19h18" />,
};
export function Icon({
  name,
  className = "",
}: {
  name: IconName;
  className?: string;
}) {
  if (name === "ball")
    return (
      <svg
        data-icon={name}
        className={className}
        viewBox="0 0 64 64"
        fill="none"
        aria-hidden="true"
      >
        <circle
          cx="32"
          cy="32"
          r="29"
          fill="#fff"
          stroke="#102352"
          strokeWidth="3"
        />
        {[0, 120, 240].map((angle) => (
          <g key={angle} transform={`rotate(${angle} 32 32)`}>
            <path
              d="M32 4C17 11 13 27 18 43L31 48C24 31 30 17 44 7Z"
              fill="#1454e8"
            />
            <path
              d="M44 7C31 18 27 31 32 43L41 44C35 28 42 17 51 12Z"
              fill="#ffd747"
            />
          </g>
        ))}
        <circle
          cx="32"
          cy="32"
          r="29"
          fill="none"
          stroke="#102352"
          strokeWidth="3"
        />
      </svg>
    );
  return (
    <svg
      data-icon={name}
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
