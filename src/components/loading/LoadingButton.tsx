import ReactLoading from "react-loading";

const LoadingButton = () => {
   return (
      <button type="submit" className=" rounded-md bg-blue-500 p-1 text-white hover:bg-blue-700 flex items-center justify-center">
         <ReactLoading type={"spin"} color="#36d7b7" height={20} width={20} className="mr-2" />
         Loading
      </button>
   );
};

export default LoadingButton;
