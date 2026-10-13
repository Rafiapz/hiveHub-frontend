import { FC, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store/store";
import { adminFindAllUsers, blockOrUnblockUser, getOnlineUsers } from "../../store/actions/admin/adminActions";

const UsersTable: FC = () => {
   const adminId = useSelector((state: RootState) => state.user.user.userId);
   const [allUsers, setAllUsers] = useState<any>([]);
   const [online, setOnline] = useState<any>([]);

   const dispatch = useDispatch<AppDispatch>();

   useEffect(() => {
      dispatch(adminFindAllUsers(adminId)).then((response) => {
         dispatch(getOnlineUsers()).then((res) => {
            if (res?.payload?.status === "ok") {
               setOnline(res?.payload?.data);
            }
         });
         setAllUsers(response?.payload?.data);
      });
   }, []);

   const handleBlockUser = (userId: any, status: boolean) => {
      let toStatus;
      if (status) {
         toStatus = "false";
      } else {
         toStatus = "true";
      }

      const formData = new FormData();

      formData.append("userId", userId);
      formData.append("toStatus", toStatus);
      dispatch(blockOrUnblockUser(formData)).then((response) => {
         if (response.payload?.status === "ok") {
            dispatch(adminFindAllUsers(adminId)).then((response) => {
               setAllUsers(response?.payload?.data);
            });
         }
      });
   };

   return (
      <div className="flex flex-col justify-center items-center overflow-x-auto shadow-md sm:rounded-lg">
         <h1 className=" mt-2 ">Users</h1>
         <div className="max-w-[800px] w-full">
            <h1 className="text-3xl font-bold text-gray-900 mb-4 px-6 text-center">Users</h1>
            <div className="w-full overflow-x-auto">
               <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                  <thead className="text-xs text-black uppercase bg-gray-50 dark:bg-gray-400 dark:text-black">
                     <tr>
                        <th scope="col" className="px-6 py-3">
                           Name
                        </th>
                        <th scope="col" className="px-6 py-3">
                           Role
                        </th>
                        <th scope="col" className="px-6 py-3">
                           Status
                        </th>
                        <th scope="col" className="px-6 py-3">
                           Action
                        </th>
                     </tr>
                  </thead>
                  <tbody>
                     {allUsers.map((user: any) => (
                        <tr
                           key={user?._id}
                           className="bg-white border-b dark:bg-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-200"
                        >
                           <td className="flex items-center px-6 py-4 text-black whitespace-nowrap dark:text-white">
                              <img className="w-10 h-10 rounded-full object-cover" src={user?.profilePhoto} alt="Profile" />
                              <div className="pl-3">
                                 <div className="text-base font-semibold text-black">{user?.fullName}</div>
                                 <div className="font-normal text-black">{user?.email}</div>
                              </div>
                           </td>
                           <td className="px-6 py-4 text-black">{user?.role}</td>
                           <td className="px-6 py-4">
                              <div className="flex items-center text-black">
                                 {online.includes(user?._id) && <div className="h-2.5 w-2.5 rounded-full bg-green-500 mr-2"></div>}
                                 {online.includes(user?._id) ? "Online" : "Not online"}
                              </div>
                           </td>
                           <td className="px-6 py-4">
                              <button
                                 onClick={() => handleBlockUser(user?._id, user?.isBlocked)}
                                 className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                              >
                                 {user?.isBlocked === true ? <h1 className="text-green-800">Unblock</h1> : <h1 className="text-red-500">Block</h1>}
                              </button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
   );
};

export default UsersTable;
