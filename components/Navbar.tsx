import Link from 'next/link'

const links = [
  { href: '/register', label: '프로필 등록' },
  { href: '/recommendations', label: '추천 목록' },
  { href: '/admin', label: '담당자 대시보드' },
]

export default function Navbar() {
  return (
    <header className="border-b bg-white">
      <nav className="mx-auto flex max-w-5xl items-center gap-8 px-6 py-4">
        <Link href="/" className="text-2xl font-bold text-blue-700">
          상상우리
        </Link>
        <ul className="flex gap-6">
          {links.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className="text-lg font-medium text-gray-700 hover:text-blue-700 transition-colors"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
