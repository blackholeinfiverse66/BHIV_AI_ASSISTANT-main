export function Spinner({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="spinner" aria-label={label}>
      <div className="spinner__dot" />
      <div className="spinner__dot" />
      <div className="spinner__dot" />
    </div>
  )
}

