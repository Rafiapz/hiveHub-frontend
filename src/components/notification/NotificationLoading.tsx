function NotificationLoading() {
   return (
      <div className="flex flex-wrap justify-center">
         {Array.from({ length: 1 }, (_, i) => (
            <div
               key={i}
               className="user-card rounded-lg w-full shadow-md p-6 m-4 ml-0 hover:shadow-lg transition-shadow duration-300 relative bg-white animate-pulse"
            >
               <div className="flex items-center mb-4">
                  <div className="profile-photo mr-4">
                     <div className="w-16 h-16 rounded-full bg-gray-300"></div>
                  </div>
                  <div className="flex-grow">
                     <div className="user-name">
                        <div className="h-5 bg-gray-300 rounded w-32 mb-2"></div>
                        <div className="h-4 bg-gray-300 rounded w-48"></div>
                     </div>
                  </div>
                  <div className="absolute top-2 right-2 flex items-center">
                     <div className="h-4 bg-gray-300 rounded w-20 mr-2"></div>
                     <div className="w-6 h-6 bg-gray-300 rounded"></div>
                  </div>
               </div>
            </div>
         ))}
      </div>
   );
}

export default NotificationLoading;
