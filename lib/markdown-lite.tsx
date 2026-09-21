// Minimal markdown-lite renderer for CMS body text: **bold**, "- " bullet
// lists, and \n\n paragraph breaks. There's no real markdown library or
// renderer in this project to reuse — blog post bodies (content_en/es) are
// only ever paragraph-split on blank lines (see app/blog/[slug]/page.tsx),
// they don't parse bold or bullets — so this is a new, small, purpose-built
// renderer rather than an existing one being reused.
//
// site_content bodies store literal two-character "\n" escape sequences
// (confirmed via direct DB inspection: no real newline bytes are present),
// so those are unescaped to real newlines before splitting.
import { Fragment, type ReactNode } from 'react'

function renderInlineBold(line: string, keyPrefix: string): ReactNode[] {
  const parts = line.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={`${keyPrefix}-${i}`}>{part.slice(2, -2)}</strong>
    }
    return <Fragment key={`${keyPrefix}-${i}`}>{part}</Fragment>
  })
}

export function renderMarkdownLite(raw: string): ReactNode {
  const text = raw.replace(/\\n/g, '\n')
  const blocks = text.split(/\n\s*\n/).filter((b) => b.trim())

  return (
    <>
      {blocks.map((block, blockIndex) => {
        const lines = block.split('\n').filter((l) => l.trim())
        const isList = lines.length > 0 && lines.every((l) => /^\s*-\s+/.test(l))

        if (isList) {
          return (
            <ul key={blockIndex} className="list-disc pl-5 space-y-1">
              {lines.map((line, i) => (
                <li key={i}>{renderInlineBold(line.replace(/^\s*-\s+/, ''), `${blockIndex}-${i}`)}</li>
              ))}
            </ul>
          )
        }

        return (
          <p key={blockIndex}>
            {lines.map((line, i) => (
              <Fragment key={i}>
                {i > 0 && <br />}
                {renderInlineBold(line, `${blockIndex}-${i}`)}
              </Fragment>
            ))}
          </p>
        )
      })}
    </>
  )
}
