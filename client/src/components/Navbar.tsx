import ToggleMode from "./ToggleMode"
const Navbar = () => {
  return (
    <>
<nav className="w-full p-3 dark:bg-gray-900 shadow-sm flex justify-between">
    <div className="flex gap-2"><img src="/xds.png" alt="loh" className="w-8 h-8 object-cover" />
    <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">NasriChat</h1></div>
  <div className="flex gap-3">
  <ToggleMode />
  <button className="bg-yellow-400 text-white uppercase p-2 rounded-lg">Login</button>
  </div>
    </nav>    
    
    </>
  )
}

export default Navbar