type Props = {
    label: string;
    error?: string;
    children: React.ReactNode;
}

export function Field({ label, error, children }: Props) {
  return (
    <div className="field">
      <label>
        <span>{label}</span>
        {children}
      </label>
      {error && <p role="alert">{error}</p>}
    </div>
  );
}