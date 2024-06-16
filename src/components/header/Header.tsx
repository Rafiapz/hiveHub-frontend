import Searchbox from "../search/Searchbox";

const Header = () => {
   return (
      <header className="bg-gray-800  fixed z-30 top-0 left-0 w-full sm:justify-center h-12  py-3 px-6 flex items-center justify-between">
         <h1 className="text-white font-thin text-xl sm:text-2xl ml-5">hiveHub</h1>
         <div className="sm:hidden flex-1 px-4">{<Searchbox />}</div>
      </header>
   );
};

export default Header;
