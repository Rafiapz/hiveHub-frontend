import { FC, useEffect, useState } from "react";
import Menu from "../../../components/menu/Menu";
import RightSideBar from "../../../components/rightSideBar/RightSideBar";
import { fetchAllReports } from "../../../store/actions/admin/adminActions";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store/store";
import ViewReport from "../../../components/modal/ViewReport";
import { rejectReport, resolveReport } from "../../../service/api";
import toast from "react-hot-toast";
import Header from "../../../components/header/Header";
import socketService from "../../../service/socketService";
import Popup from "../../../components/notification/Popup";
const socket = socketService.socket;

const Reports: FC = () => {
   const reports: any = useSelector((state: RootState) => state?.admin?.reports?.data);
   const [modalIsOpen, setModalIsOpen] = useState(false);
   const dispatch = useDispatch<AppDispatch>();
   const [curReport, setCurReport] = useState<any>({});
   const [notificationData, setNotificationData] = useState<any>(null);
   const [notified, setNotified] = useState<boolean>(false);
   const userId: any = useSelector((state: RootState) => state?.user?.user?.userId);

   useEffect(() => {
      const getNotifiationEvent = (data: any) => {
         if (data?.senderId !== userId) {
            setNotificationData(data);
            setNotified(true);
         }
      };
      socket.on("getNotifiation", getNotifiationEvent);
      return () => {
         socket.off("getNotifiation", getNotifiationEvent);
      };
   }, [socket]);

   useEffect(() => {
      dispatch(fetchAllReports());
   }, []);

   const closeModal = () => {
      setModalIsOpen(false);
   };

   const handleResolveReport = (reportId: any, postId: any) => {
      resolveReport({ reportId, postId })
         .then((response) => {
            if (response?.data?.status === "ok") {
               dispatch(fetchAllReports());
               toast.success("Successfully resolved");
            }
         })
         .catch((err: any) => {
            toast.error(err?.response?.data?.message || "Something went wrong");
         });
   };

   const handleRejectReport = (reportId: any) => {
      rejectReport(reportId).then((response) => {
         if (response?.data?.status === "ok") {
            dispatch(fetchAllReports());
            toast.success("Successfully rejected");
         }
      });
   };

   const handleDisplayReportDetails = (id: any) => {
      setModalIsOpen(true);
      const current = reports.filter((ob: any) => ob?._id === id);
      setCurReport(current[0]);
   };

   return (
      <>
         <Menu />
         <Header />
         <Popup notification={notified} data={notificationData} />
         <div className="container max-w-[800px] mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Reports</h1>
            <div className="bg-white rounded-lg shadow-md overflow-x-auto">
               <table className="w-full table-auto">
                  <thead>
                     <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                        <th className="py-3 px-6">Reported User</th>
                        <th className="py-3 px-6">Status</th>
                        <th className="py-3 px-6">Reason</th>
                        <th className="py-3 px-6">Reported At</th>
                        <th className="py-3 px-6">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="text-gray-600 text-sm font-light">
                     {reports?.map((report: any) => (
                        <tr key={report?._id} className="border-b border-gray-200 hover:bg-gray-100">
                           <td className="py-3 px-6" onClick={() => handleDisplayReportDetails(report?._id)}>
                              {report?.userId?.fullName}
                           </td>
                           <td className="py-3 px-6" onClick={() => handleDisplayReportDetails(report?._id)}>
                              <span
                                 className={`px-2 py-1 rounded-full ${
                                    report?.status === "resolved" ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"
                                 }`}
                              >
                                 {report?.status}
                              </span>
                           </td>
                           <td className="py-3 px-6" onClick={() => handleDisplayReportDetails(report?._id)}>
                              {report?.reason}
                           </td>
                           <td className="py-3 px-6" onClick={() => handleDisplayReportDetails(report?._id)}>
                              {new Date(report?.createdAt).toLocaleDateString()}
                           </td>
                           <td className="py-3 px-6 flex items-center justify-center space-x-2">
                              {report?.status === "Pending" ? (
                                 <>
                                    <button
                                       className="bg-green-300 hover:bg-green-700 text-black font-bold py-2 px-4  hover:text-white rounded"
                                       onClick={() => handleResolveReport(report?._id, report?.postId?._id)}
                                    >
                                       Resolve
                                    </button>
                                    <button
                                       className="bg-red-300 hover:bg-red-700 text-black font-bold py-2 px-4 hover:text-white rounded"
                                       onClick={() => handleRejectReport(report?._id)}
                                    >
                                       Reject
                                    </button>
                                 </>
                              ) : (
                                 <button
                                    className="bg-blue-300  font-bold py-2 px-4 hover:cursor-default  text-white rounded"
                                    onClick={() => handleDisplayReportDetails(report?._id)}
                                 >
                                    {report?.status}
                                 </button>
                              )}
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
         <ViewReport modalIsOpen={modalIsOpen} closeModal={closeModal} report={curReport} />
         <RightSideBar />
      </>
   );
};

export default Reports;
