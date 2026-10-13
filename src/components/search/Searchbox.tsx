import React, { FC, useState } from "react";
import { searchUser } from "../../service/api";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

const Searchbox: FC = () => {
   const [suggestions, setSuggestions] = useState<any>([]);
   const navigate = useNavigate();
   const auth = useSelector((state: RootState) => state?.user?.user?.auth?.isAuth);

   const handleInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!auth) {
         return;
      }
      if (event?.target?.value === "") {
         setSuggestions([]);
         return;
      }
      const searchQuery = event.target.value;
      const newSuggestions = await searchUser(searchQuery);
      setSuggestions(newSuggestions?.data);
   };

   const handleClick = (id: number, email: string) => {
      navigate(`/others-profile?userId=${id}&email=${email}`);
      setSuggestions([]);
   };

   return (
      <div className="relative">
         <div className="relative">
            <FontAwesomeIcon
               icon={faMagnifyingGlass}
               className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"
            />
            <input
               type="text"
               placeholder="Search users..."
               className="w-full pl-9 pr-3 py-2 rounded-xl text-sm text-slate-800 placeholder-slate-400 bg-slate-100 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 shadow-2xs"
               onChange={handleInputChange}
            />
         </div>

         {suggestions.length > 0 && (
            <div className="absolute top-full left-0 w-full mt-1.5 rounded-2xl shadow-xl z-50 overflow-hidden bg-white border border-slate-200/90 py-1">
               {suggestions.map((suggestion: any, index: number) => (
                  <div
                     key={index}
                     className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-orange-50/60 transition-colors border-b border-slate-100 last:border-b-0"
                     onClick={() => handleClick(suggestion?._id, suggestion?.email)}
                  >
                     <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-2xs"
                        style={{ background: 'linear-gradient(135deg, #F97316, #EA580C)' }}
                     >
                        {suggestion?.fullName?.[0]?.toUpperCase()}
                     </div>
                     <span className="text-slate-800 text-sm font-medium">{suggestion?.fullName}</span>
                  </div>
               ))}
            </div>
         )}
      </div>
   );
};

export default Searchbox;
