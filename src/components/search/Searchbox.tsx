import React, { FC, useState } from "react";
import { searchUser } from "../../service/api";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";

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
   };

   return (
      <div className="relative -500 h-8 sm:h-10">
         <input
            type="text"
            placeholder="Search"
            className="p-2 rounded border border-gray-300 focus:outline-none h-8 sm:h-10 focus:border-blue-500 w-full"
            onChange={handleInputChange}
         />

         {suggestions.length > 0 && (
            <div className="absolute top-full left-0 w-full  bg-white border border-gray-200 shadow-lg rounded-b-lg z-50">
               <table className="w-full">
                  <tbody>
                     {suggestions.map((suggestion: any, index: number) => (
                        <tr
                           key={index}
                           className="border-b border-gray-200 hover:cursor-pointer hover:bg-gray-100"
                           onClick={() => handleClick(suggestion?._id, suggestion?.email)}
                        >
                           <td className="p-2">{suggestion?.fullName}</td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         )}
      </div>
   );
};

export default Searchbox;
