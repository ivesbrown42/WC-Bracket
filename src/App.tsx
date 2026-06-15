import { Routes, Route } from 'react-router-dom'
import { Home } from './screens/Home'
import { Groups } from './screens/Groups'
import { Bracket } from './screens/Bracket'
import { Summary } from './screens/Summary'
import { StyleGuide } from './screens/StyleGuide'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/groups" element={<Groups />} />
      <Route path="/bracket" element={<Bracket />} />
      <Route path="/summary" element={<Summary />} />
      {/* Importing a shared bracket: same screen, reads picks from URL hash. */}
      <Route path="/share" element={<Summary shared />} />
      <Route path="/style-guide" element={<StyleGuide />} />
      <Route path="*" element={<Home />} />
    </Routes>
  )
}
