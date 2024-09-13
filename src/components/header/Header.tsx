import Searchbox from "../search/Searchbox";

const Header = () => {
   return (
      <header className="bg-orange-400 fixed z-30 top-0 left-0 w-full sm:justify-center h-10 py-3 px-6 flex items-center justify-between shadow-lg  border-b-2 border-orange-200 transition-all duration-300">
         <h1 className="text-white font-semibold text-2xl sm:text-3xl ml-5 tracking-wider drop-shadow-md">
            hive<span className="text-blue-500 font-bold">Hub</span>
         </h1>
         <div className="sm:hidden flex-1 px-4">
            <Searchbox />
         </div>
      </header>
   );
};

export default Header;
