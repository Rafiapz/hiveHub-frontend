import ReactLoading from "react-loading";

const LoadingButton = () => {
   return (
      <button
         type="submit" // Assuming this is a submit button
         className="mt-4 px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-700 flex items-center justify-center" // Added flexbox styles
      >
         <ReactLoading type={"spin"} color="#36d7b7" height={25} width={29} className="mr-2" /> {/* Added margin-right */}
         Loading
      </button>
   );
};

export default LoadingButton;
