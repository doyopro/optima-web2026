// Renders a JSON-LD <script> tag. Escapes "</" so nothing in the payload
// (e.g. a guest testimonial that happens to contain that sequence) can
// break out of the script tag early.
export default function JsonLd({ data }: { data: object }) {
  const json = JSON.stringify(data).replace(/</g, '\\u003c')
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
}
