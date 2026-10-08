
export function navigate(to) {
  if (window.location.pathname + window.location.search === to) return
  window.history.pushState(null, '', to)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

export function Link({ to, children, onClick, ...rest }) {
  function handleClick(e) {
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return
    e.preventDefault()
    if (onClick) onClick(e)
    navigate(to)
  }

  return (
    <a href={to} onClick={handleClick} {...rest}>
      {children}
    </a>
  )
}
