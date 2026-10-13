const AdminCard = () => {
   return (
      <div className="flex">
         <div className="block max-w-sm w-64 p-6 mt-12 bg-white border border-gray-400 rounded-lg shadow">
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-black">Total Users</h5>
            <h3 className="font-bold text-gray-700 ">15000</h3>
            <p>Surpassing 15,000 user accounts, signaling a pivotal moment in our platform's expansion. </p>
         </div>
         <div className="ml-4"></div>
         <div className="block max-w-sm w-72 p-6 mt-12 bg-white border border-gray-400 rounded-lg shadow">
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-black">Total Posts</h5>
            <h3 className="font-bold text-gray-700 ">15000</h3>
            <p>Surpassing 15,000 user accounts, signaling a pivotal moment in our platform's expansion. </p>
         </div>
         <div className="ml-4"></div>
         <div className="block max-w-sm w-72 p-6 mt-12 bg-white border border-gray-400 rounded-lg shadow">
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-black">Total Likes</h5>
            <h3 className="font-bold text-gray-700 ">15000</h3>
            <p>Surpassing 15,000 user accounts, signaling a pivotal moment in our platform's expansion. </p>
         </div>
         <div className="ml-4"></div>
      </div>
   );
};

export default AdminCard;
